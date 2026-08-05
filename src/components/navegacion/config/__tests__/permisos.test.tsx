import { describe, expect, it } from "vitest";
import {
  CAPACIDADES,
  MENU_ITEMS,
  normalizarRol,
  tieneRolPermitido,
} from "../perimisos";

describe("matriz única de capacidades", () => {
  it("normaliza mayúsculas y tildes al comparar roles", () => {
    expect(normalizarRol(" farmacéutico ")).toBe("FARMACEUTICO");
    expect(tieneRolPermitido("FARMACEUTICO", [...CAPACIDADES.DASHBOARD])).toBe(
      true,
    );
  });

  it.each([
    ["/ventas/nueva", CAPACIDADES.VENTAS_POS],
    ["/dashboard", CAPACIDADES.DASHBOARD],
    ["/productos", CAPACIDADES.INVENTARIO_GESTION],
    ["/compras", CAPACIDADES.COMPRAS],
    ["/clientes", CAPACIDADES.CLIENTES],
    ["/reportes/ventas", CAPACIDADES.REPORTES],
    ["/admin/usuarios", CAPACIDADES.ADMINISTRACION],
    ["/gastos", CAPACIDADES.GASTOS],
  ])("el menú %s reutiliza su capacidad canónica", (path, roles) => {
    expect(
      MENU_ITEMS.find((item) => item.path === path)?.rolesPermitidos,
    ).toEqual([...roles]);
  });

  it("no expone la gestión de inventario a cajero ni vendedor", () => {
    expect(
      tieneRolPermitido("Cajero", [...CAPACIDADES.INVENTARIO_GESTION]),
    ).toBe(false);
    expect(
      tieneRolPermitido("Vendedor", [...CAPACIDADES.INVENTARIO_GESTION]),
    ).toBe(false);
    expect(
      tieneRolPermitido("Almacenero", [...CAPACIDADES.INVENTARIO_GESTION]),
    ).toBe(true);
  });

  it("limita compras a administrador, gerente y almacenero", () => {
    expect(tieneRolPermitido("Almacenero", [...CAPACIDADES.COMPRAS])).toBe(
      true,
    );
    expect(tieneRolPermitido("Cajero", [...CAPACIDADES.COMPRAS])).toBe(false);
  });
});
