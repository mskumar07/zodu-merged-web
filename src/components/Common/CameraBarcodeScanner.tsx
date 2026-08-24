import React, { useEffect, useId, useRef, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
  Html5QrcodeScannerState,
  type Html5QrcodeCameraScanConfig,
} from 'html5-qrcode';

interface CameraBarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  /** Called once per distinct code — repeat reads of the same code are debounced internally. */
  onScan: (code: string) => void;
  title?: string;
}

const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.CODE_128,
];

// How long to ignore repeat reads of the same code, in ms — camera scanners fire
// onScanSuccess on every frame that still sees the code, not just once.
const DUPLICATE_DEBOUNCE_MS = 2000;

function friendlyCameraError(err: unknown): string {
  const name = (err as { name?: string } | undefined)?.name;
  if (name === 'NotAllowedError') return 'Camera permission denied. Allow camera access and try again.';
  if (name === 'NotFoundError') return 'No camera found on this device.';
  return 'Unable to access the camera. Please try again.';
}

// Stops + clears a scanner instance only if it's actually running/paused — calling
// stop() on an instance that never finished starting throws inside html5-qrcode's
// internal state machine, so this must always be checked first.
function safeStop(instance: Html5Qrcode) {
  try {
    if (
      instance.getState() === Html5QrcodeScannerState.SCANNING ||
      instance.getState() === Html5QrcodeScannerState.PAUSED
    ) {
      instance.stop().catch(() => {}).finally(() => {
        try { instance.clear(); } catch { /* DOM node may already be gone */ }
      });
    }
  } catch {
    // Defensive — never let cleanup throw.
  }
}

// Reads both 1D barcodes and QR codes via the device camera using html5-qrcode.
// Opens/starts the camera only while `open` is true and always stops + clears the
// underlying stream on close/unmount so the camera light doesn't stay on.
//
// React.StrictMode double-invokes effects in dev (mount → cleanup → mount), which
// races html5-qrcode's async start()/stop() — cleanup must never call stop() while
// start() is still pending (it throws), so pending state is tracked explicitly and
// an instance that finishes starting after it's been cancelled stops itself instead.
const CameraBarcodeScanner: React.FC<CameraBarcodeScannerProps> = ({
  open, onClose, onScan, title = 'Scan barcode or QR code',
}) => {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const elementId = `camera-scanner-${rawId}`;

  const lastScanRef = useRef<{ code: string; time: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (!window.isSecureContext) {
      setError('Camera scanning requires a secure connection (HTTPS). Use the keyboard-scan field instead.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported in this browser.');
      return;
    }

    let cancelled = false;
    setError(null);
    setStarting(true);

    let instance: Html5Qrcode;
    try {
      instance = new Html5Qrcode(elementId, { formatsToSupport: SUPPORTED_FORMATS, verbose: false });
    } catch {
      setStarting(false);
      setError('Unable to initialize the camera.');
      return;
    }

    const config: Html5QrcodeCameraScanConfig = {
      fps: 10,
      qrbox: { width: 260, height: 180 },
    };

    let startPromise: Promise<void>;
    try {
      startPromise = instance.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          const now = Date.now();
          const last = lastScanRef.current;
          if (last && last.code === decodedText && now - last.time < DUPLICATE_DEBOUNCE_MS) return;
          lastScanRef.current = { code: decodedText, time: now };
          onScan(decodedText);
        },
        () => {
          // Per-frame "no code found" callback — expected on almost every frame, not an error.
        }
      );
    } catch (err) {
      setStarting(false);
      setError(friendlyCameraError(err));
      return;
    }

    startPromise
      .then(() => {
        if (cancelled) {
          // Cleanup already ran before start() resolved — this instance is now
          // orphaned (StrictMode's double-invoke, or the dialog closing fast).
          safeStop(instance);
          return;
        }
        setStarting(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStarting(false);
        setError(friendlyCameraError(err));
      });

    return () => {
      cancelled = true;
      safeStop(instance);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, elementId]);

  const handleClose = () => {
    lastScanRef.current = null;
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
        <Typography fontWeight={700} fontSize={16}>{title}</Typography>
        <IconButton size="small" onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pb: 2.5 }}>
        {error ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="body2" color="error" fontWeight={600}>{error}</Typography>
          </Box>
        ) : (
          <Box sx={{ position: 'relative' }}>
            {starting && (
              <Box sx={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.7)', zIndex: 1,
              }}>
                <CircularProgress size={28} />
              </Box>
            )}
            <Box id={elementId} sx={{
              width: '100%', minHeight: 260, borderRadius: 1.5, overflow: 'hidden', bgcolor: '#000',
              '& video': { width: '100% !important', borderRadius: '12px' },
            }} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', textAlign: 'center' }}>
              Point the camera at a barcode or QR code
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CameraBarcodeScanner;
