import { describe, expect, it, beforeEach, vi } from "vitest";
import { ticketConfigService } from "../ticketConfig.service";
import { TICKET_CONFIG_DEFAULT } from "../../types/ticketConfig";

vi.mock("../api", () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: null }),
    post: vi.fn().mockResolvedValue({ data: { ok: true } }),
  },
}));

describe("ticketConfigService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("retorna la configuración por defecto si no hay nada guardado", () => {
    const config = ticketConfigService.obtenerConfiguracion("botica-123");
    expect(config).toEqual(TICKET_CONFIG_DEFAULT);
    expect(config.formatoPapel).toBe("80mm");
    expect(config.fuenteFamilia).toBe("mono");
  });

  it("guarda y recupera configuración por botica_id aislada", async () => {
    await ticketConfigService.guardarConfiguracion(
      {
        ...TICKET_CONFIG_DEFAULT,
        formatoPapel: "58mm",
        fuenteFamilia: "sans",
        eslogan: "Farmacia de Confianza",
      },
      "botica-abc"
    );

    const config = ticketConfigService.obtenerConfiguracion("botica-abc");
    expect(config.formatoPapel).toBe("58mm");
    expect(config.fuenteFamilia).toBe("sans");
    expect(config.eslogan).toBe("Farmacia de Confianza");

    // Otra botica debe mantener el default
    const configOtra = ticketConfigService.obtenerConfiguracion("botica-otra");
    expect(configOtra.formatoPapel).toBe("80mm");
  });

  it("restablece la configuración a los valores por defecto", async () => {
    await ticketConfigService.guardarConfiguracion(
      {
        ...TICKET_CONFIG_DEFAULT,
        eslogan: "Eslogan Temporal",
      },
      "botica-1"
    );

    const restablecida = await ticketConfigService.restablecerConfiguracion("botica-1");
    expect(restablecida.eslogan).toBe(TICKET_CONFIG_DEFAULT.eslogan);
  });
});
