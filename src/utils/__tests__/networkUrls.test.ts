import { describe, expect, it } from "vitest";
import {
  isExternallyShareableUrl,
  resolveApiBaseUrl,
  resolveMobileScannerLink,
  resolveReceiptLink,
  resolveSocketBaseUrl,
} from "../networkUrls";

describe("networkUrls", () => {
  it("usa /api same-origin cuando VITE_API_URL no está configurada", () => {
    expect(resolveApiBaseUrl()).toBe("/api");
    expect(resolveApiBaseUrl("   ")).toBe("/api");
  });

  it("normaliza API absoluta o relativa sin duplicar /api", () => {
    expect(resolveApiBaseUrl("https://api.marifarma.pe", "https://pos.marifarma.pe")).toBe("https://api.marifarma.pe/api");
    expect(resolveApiBaseUrl("https://api.marifarma.pe/api/", "https://pos.marifarma.pe")).toBe("https://api.marifarma.pe/api");
    expect(resolveApiBaseUrl("/backend")).toBe("/backend/api");
  });

  it("evita contenido mixto y vuelve a /api si la configuración HTTP se usa bajo HTTPS", () => {
    expect(resolveApiBaseUrl("http://192.168.0.4:3000", "https://192.168.0.4:5173"))
      .toBe("/api");
  });

  it("deriva un socket seguro del origen HTTPS para escritorio y PWA móvil", () => {
    expect(resolveSocketBaseUrl({ origin: "https://pos.marifarma.pe", configuredApiUrl: "" }))
      .toBe("https://pos.marifarma.pe");
    expect(resolveSocketBaseUrl({
      origin: "https://192.168.0.4:5173",
      configuredApiUrl: "http://192.168.0.4:3000/api",
    })).toBe("https://192.168.0.4:5173");
    expect(resolveSocketBaseUrl({
      origin: "https://pos.marifarma.pe",
      configuredSocketUrl: "wss://realtime.marifarma.pe/api/",
    })).toBe("https://realtime.marifarma.pe");
  });

  it("clasifica una URL LAN como local y no apta para envío externo", () => {
    const link = resolveReceiptLink(
      "http://192.168.0.4:5173/c/token-prueba",
      "",
      "http://192.168.0.4:5173",
    );

    expect(link).toMatchObject({
      url: "http://192.168.0.4:5173/c/token-prueba",
      externallyShareable: false,
    });
    expect(link?.warning).toMatch(/red local/i);
    expect(isExternallyShareableUrl(link?.url || "")).toBe(false);
  });

  it("reconstruye el comprobante sobre el dominio público HTTPS configurado", () => {
    const link = resolveReceiptLink(
      "http://192.168.0.4:5173/c/token-prueba?download=1",
      "https://pos.marifarma.pe",
      "http://192.168.0.4:5173",
    );

    expect(link).toEqual({
      url: "https://pos.marifarma.pe/c/token-prueba?download=1",
      externallyShareable: true,
      warning: null,
    });
  });

  it("solo habilita el QR móvil cuando el enlace es HTTPS y no es localhost", () => {
    expect(resolveMobileScannerLink("SESION-1", "", "http://192.168.0.4:5173"))
      .toMatchObject({ mobileReady: false, warning: expect.stringMatching(/requiere HTTPS/i) });
    expect(resolveMobileScannerLink("SESION-1", "", "https://localhost:5173"))
      .toMatchObject({ mobileReady: false, warning: expect.stringMatching(/no puede abrir localhost/i) });
    expect(resolveMobileScannerLink("SESION 1", "https://pos.marifarma.pe", "http://localhost:5173"))
      .toEqual({
        url: "https://pos.marifarma.pe/escanner-remoto?session=SESION+1",
        mobileReady: true,
        warning: null,
      });
  });
});
