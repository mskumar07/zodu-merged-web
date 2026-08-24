import { useEffect, useRef } from 'react';

interface UseHardwareScannerListenerOptions {
  /** Called with the scanned code once a fast keystroke burst ends with Enter. */
  onScan: (code: string) => void;
  /** Only listens while true — e.g. bind this to a dialog's `open` state. Default true. */
  active?: boolean;
  /** Codes shorter than this (after trim) are treated as stray/human input and ignored. Default 3. */
  minLength?: number;
  /** Max gap between keystrokes, in ms, to still count as "scanner speed". Default 50. */
  maxKeyIntervalMs?: number;
}

function isEditableElement(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return (el as HTMLElement).isContentEditable === true;
}

// Detects a hardware USB/Bluetooth barcode scanner without requiring any field to be
// focused first. Scanners emulate a keyboard: they fire a burst of keydown events far
// faster than a human can type, then send Enter. This listens at the document level
// and buffers only while the currently focused element is NOT a real text input/
// textarea/select — so it never interferes with someone actually typing into a form
// field (that field's own onChange/onKeyDown already handles a scan landing there).
export function useHardwareScannerListener({
  onScan,
  active = true,
  minLength = 3,
  maxKeyIntervalMs = 50,
}: UseHardwareScannerListenerOptions): void {
  const bufferRef = useRef('');
  const lastTimeRef = useRef(0);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableElement(document.activeElement)) return;

      const now = Date.now();
      const gap = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (e.key === 'Enter') {
        const code = bufferRef.current.trim();
        bufferRef.current = '';
        if (code.length >= minLength) {
          e.preventDefault();
          onScanRef.current(code);
        }
        return;
      }

      if (e.key === 'Tab' || e.key === 'Escape') {
        bufferRef.current = '';
        return;
      }

      if (e.key.length === 1) {
        // Gap too large since the last key — this isn't a continuous scanner burst,
        // so start a fresh buffer instead of mixing unrelated keystrokes together.
        if (gap > maxKeyIntervalMs && bufferRef.current) bufferRef.current = '';
        bufferRef.current += e.key;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [active, minLength, maxKeyIntervalMs]);
}
