import { afterEach, describe, expect, it, vi } from "vitest";
import { fechaCivil, fechaCivilMasDias } from "../localDate";

describe("fecha civil de America/Lima", () => {
  afterEach(() => vi.useRealTimers());

  it.each([
    ["2026-08-01T23:59:00.000Z", "2026-08-01"], // 18:59 en Lima
    ["2026-08-02T00:01:00.000Z", "2026-08-01"], // 19:01 en Lima
  ])("mantiene el día local alrededor del cambio de fecha UTC: %s", (instant, expected) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(instant));
    expect(fechaCivil()).toBe(expected);
  });

  it("respeta el último día del mes aunque UTC ya esté en el mes siguiente", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-01T01:00:00.000Z")); // 31/07 20:00 Lima
    expect(fechaCivil()).toBe("2026-07-31");
  });

  it("resta días de calendario cruzando correctamente el fin de mes", () => {
    const fecha = new Date("2026-08-02T00:01:00.000Z"); // 01/08 19:01 Lima
    expect(fechaCivilMasDias(fecha, -30)).toBe("2026-07-02");
  });
});
