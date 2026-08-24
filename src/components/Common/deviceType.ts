// Distinguishes phone/tablet from desktop/laptop so camera-based scanning (only
// useful on a device with a built-in camera pointed away from the screen) can be
// offered only there, while desktop/laptop relies on a hardware USB/Bluetooth
// scanner instead (which behaves like a keyboard and needs no UI of its own).
export function isMobileOrTabletDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Silk/i.test(ua)) {
    return true;
  }
  // iPadOS 13+ reports its UA as a plain "Macintosh" — the only reliable way to
  // still tell it apart from an actual Mac is that it exposes multiple touch points.
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}
