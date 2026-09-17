/**
 * Client for the Zodu Print Bridge — the small service on the billing PC that
 * forwards ESC/POS bytes to kitchen printers (zodu-merged-backend/print-bridge).
 *
 * Its address is per device, not per branch: two billing PCs in one restaurant
 * each run their own bridge, so it lives in this browser's localStorage.
 */

import { toBase64 } from "./escpos";
import type { PrinterConnection } from "./kotTicket";

const STORAGE_KEY = "zodu.printBridgeUrl";
export const DEFAULT_BRIDGE_URL = "http://127.0.0.1:9123";

export function getBridgeUrl(): string {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || DEFAULT_BRIDGE_URL;
  } catch {
    return DEFAULT_BRIDGE_URL;
  }
}

export function setBridgeUrl(url: string): void {
  try {
    const clean = url.trim().replace(/\/+$/, "");
    if (!clean || clean === DEFAULT_BRIDGE_URL) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, clean);
  } catch {
    /* storage blocked — the default address still works */
  }
}

/** The connection details the bridge needs; everything else about a printer stays server-side. */
export interface BridgePrinter {
  connection_type: PrinterConnection;
  ip_address: string | null;
  port: number | null;
  device_name: string | null;
}

async function request<T>(path: string, init?: RequestInit, timeoutMs = 15000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${getBridgeUrl()}${path}`, { ...init, signal: controller.signal });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body?.ok === false) throw new Error(body?.error || `Print bridge answered ${res.status}`);
    return body as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw new Error("Print bridge timed out");
    if (err instanceof TypeError) throw new Error("Print bridge is not running on this computer");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function bridgeHealth(): Promise<{ ok: true; version: string }> {
  return request("/health", undefined, 3000);
}

export async function bridgeSystemPrinters(): Promise<string[]> {
  const body = await request<{ printers: string[] }>("/printers");
  return body.printers ?? [];
}

export interface DiscoveredPrinter extends BridgePrinter {
  name: string;
  detail: string;
}

/** Scans this PC's network and installed/paired devices; takes a few seconds. */
export async function bridgeDiscoverPrinters(): Promise<DiscoveredPrinter[]> {
  try {
    const body = await request<{ printers: DiscoveredPrinter[] }>("/discover", undefined, 60000);
    return body.printers ?? [];
  } catch (err) {
    if (err instanceof Error && /answered 404|Not found/.test(err.message)) {
      throw new Error("This print bridge is too old to auto detect printers — install the latest ZoduPrintBridge.exe");
    }
    throw err;
  }
}

export async function bridgePrint(printer: BridgePrinter, data: Uint8Array): Promise<void> {
  await request("/print", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      printer: {
        connection_type: printer.connection_type,
        ip_address: printer.ip_address,
        port: printer.port,
        device_name: printer.device_name,
      },
      data: toBase64(data),
    }),
  });
}
