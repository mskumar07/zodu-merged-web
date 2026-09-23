import { describe, expect, it } from "vitest";
import { encodeSlipText, packRaster, toBase64 } from "./escpos";

const bytes = (...xs: number[]) => Uint8Array.from(xs);
const indexOfSeq = (hay: Uint8Array, needle: Uint8Array) => {
  outer: for (let i = 0; i <= hay.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) if (hay[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
};

describe("encodeSlipText", () => {
  it("initialises, styles lines only when the style changes, then feeds and cuts", () => {
    const out = encodeSlipText({
      paper: "3",
      lines: [
        { text: "TITLE", bold: true, size: 2 },
        { text: "Item", bold: true },
        { text: "plain" },
      ],
    });
    expect(Array.from(out.slice(0, 5))).toEqual([0x1b, 0x40, 0x1b, 0x74, 0x00]);
    const title = indexOfSeq(out, new TextEncoder().encode("TITLE\n"));
    const item = indexOfSeq(out, new TextEncoder().encode("Item\n"));
    expect(indexOfSeq(out.slice(0, title), bytes(0x1b, 0x45, 1))).toBeGreaterThan(-1);
    expect(indexOfSeq(out.slice(0, title), bytes(0x1d, 0x21, 0x11))).toBeGreaterThan(-1);
    // Between TITLE and Item only the size resets; bold stays on.
    const between = out.slice(title, item);
    expect(indexOfSeq(between, bytes(0x1d, 0x21, 0x00))).toBeGreaterThan(-1);
    expect(indexOfSeq(between, bytes(0x1b, 0x45, 1))).toBe(-1);
    expect(Array.from(out.slice(-7))).toEqual([0x1b, 0x64, 0x04, 0x1d, 0x56, 0x42, 0x00]);
  });

  it("ends with the printer's cut mode", () => {
    const slip = { paper: "3" as const, lines: [{ text: "x" }] };
    expect(Array.from(encodeSlipText(slip, "full").slice(-7))).toEqual([0x1b, 0x64, 0x04, 0x1d, 0x56, 0x41, 0x00]);
    const none = encodeSlipText(slip, "none");
    expect(Array.from(none.slice(-3))).toEqual([0x1b, 0x64, 0x06]);
    expect(indexOfSeq(none, bytes(0x1d, 0x56))).toBe(-1);
    expect(Array.from(packRaster(new Uint8ClampedArray(64 * 4), 8, 8, 255, "full").slice(-2))).toEqual([0x41, 0x00]);
  });

  it("replaces characters outside printable ASCII", () => {
    const out = encodeSlipText({ paper: "2", lines: [{ text: "Café" }] });
    expect(indexOfSeq(out, new TextEncoder().encode("Caf?\n"))).toBeGreaterThan(-1);
  });
});

describe("packRaster", () => {
  it("packs dark pixels as set bits, MSB first, padded to whole bytes", () => {
    // 10 x 2: row 0 → pixels 0 and 9 black; row 1 → all white.
    const w = 10, h = 2;
    const rgba = new Uint8ClampedArray(w * h * 4).fill(255);
    for (const x of [0, 9]) rgba.fill(0, x * 4, x * 4 + 3);
    const out = packRaster(rgba, w, h);
    const header = indexOfSeq(out, bytes(0x1d, 0x76, 0x30, 0x00, 2, 0, 2, 0));
    expect(header).toBe(2);
    expect(Array.from(out.slice(header + 8, header + 12))).toEqual([0b10000000, 0b01000000, 0, 0]);
  });

  it("splits tall images into bands", () => {
    const w = 8, h = 5;
    const out = packRaster(new Uint8ClampedArray(w * h * 4).fill(255), w, h, 2);
    const bands = Array.from(out).filter((_, i) => out[i] === 0x1d && out[i + 1] === 0x76).length;
    expect(bands).toBe(3);
  });
});

describe("toBase64", () => {
  it("round-trips binary", () => {
    const data = Uint8Array.from({ length: 70000 }, (_, i) => i % 256);
    expect(Uint8Array.from(atob(toBase64(data)), (c) => c.charCodeAt(0))).toEqual(data);
  });
});
