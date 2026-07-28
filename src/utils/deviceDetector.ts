// src/utils/deviceDetector.ts
// Detecta el sistema operativo (iOS, Android, Windows, macOS, Linux, etc.) y si es móvil o PC.

export type OperatingSystem = "Android" | "iOS" | "Windows" | "macOS" | "Linux" | "Otros";

export interface DeviceInfo {
  os: OperatingSystem;
  esMovil: boolean; // true para iOS o Android (celulares/tablets)
  esPC: boolean;    // true para Windows, macOS o Linux (computadoras de escritorio/laptops)
  userAgent: string;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { os: "Otros", esMovil: false, esPC: true, userAgent: "" };
  }

  const ua = navigator.userAgent || "";
  let os: OperatingSystem = "Otros";

  if (/Android/i.test(ua)) {
    os = "Android";
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = "iOS";
  } else if (/Win/i.test(ua)) {
    os = "Windows";
  } else if (/Mac/i.test(ua)) {
    // Para iPadOS cuando Safari solicita la versión de escritorio de macOS
    if (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) {
      os = "iOS";
    } else {
      os = "macOS";
    }
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  }

  const esMovil = os === "Android" || os === "iOS" || /webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const esPC = !esMovil;

  return {
    os,
    esMovil,
    esPC,
    userAgent: ua,
  };
}
