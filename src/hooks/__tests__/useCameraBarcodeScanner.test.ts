import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useCameraBarcodeScanner } from "../useCameraBarcodeScanner";

// Mock ZXing Library
const mockDecodeFromConstraints = vi.fn();
const mockReset = vi.fn();

vi.mock("@zxing/library", () => {
  return {
    BrowserMultiFormatReader: class {
      decodeFromConstraints = mockDecodeFromConstraints;
      reset = mockReset;
    },
    NotFoundException: class NotFoundException extends Error {},
  };
});

describe("useCameraBarcodeScanner - Hook madre", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDecodeFromConstraints.mockResolvedValue(undefined);
  });

  it("inicializa con estado inactivo si no hay video element montado", () => {
    const onScan = vi.fn();
    const { result } = renderHook(() =>
      useCameraBarcodeScanner({ onScan, enabled: false })
    );

    expect(result.current.isScanning).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastScannedCode).toBeNull();
  });

  it("resetea el lector al desmontar o detener", () => {
    const onScan = vi.fn();
    const { result, unmount } = renderHook(() =>
      useCameraBarcodeScanner({ onScan, enabled: false })
    );

    // Mock video element
    const mockVideo = document.createElement("video");
    result.current.videoRef.current = mockVideo;

    act(() => {
      result.current.startScanning();
    });

    expect(mockDecodeFromConstraints).toHaveBeenCalled();

    act(() => {
      result.current.stopScanning();
    });

    expect(mockReset).toHaveBeenCalled();
    expect(result.current.isScanning).toBe(false);

    unmount();
  });

  it("invoca onScan cuando se detecta un código válido", async () => {
    const onScan = vi.fn();
    let scanCallback: ((result: any, err: any) => void) | null = null;

    mockDecodeFromConstraints.mockImplementation(
      (_constraints: any, _video: any, cb: any) => {
        scanCallback = cb;
        return Promise.resolve();
      }
    );

    const { result } = renderHook(() =>
      useCameraBarcodeScanner({ onScan, enabled: false, continuous: false })
    );

    const mockVideo = document.createElement("video");
    result.current.videoRef.current = mockVideo;

    act(() => {
      result.current.startScanning();
    });

    expect(scanCallback).not.toBeNull();

    // Simular detección de código de barras
    act(() => {
      scanCallback?.({ getText: () => "7751234567890" }, null);
    });

    expect(onScan).toHaveBeenCalledWith("7751234567890");
    expect(result.current.lastScannedCode).toBe("7751234567890");
    // En modo disparo único (continuous = false), debe detenerse automáticamente
    expect(mockReset).toHaveBeenCalled();
  });
});
