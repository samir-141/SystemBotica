// src/pages/comprobantes/__tests__/ComprobantePublicoPage.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ComprobantePublicoPage from "../ComprobantePublicoPage";
import { comprobantesService } from "../../../services/comprobantes.service";

vi.mock("../../../services/comprobantes.service", () => ({
  comprobantesService: {
    obtenerComprobantePublico: vi.fn(),
  },
}));

const receipt = {
  plantilla_version: "a4-v2",
  snapshot: {
    emisor: { razon_social: "Botica Marifarma", ruc: "20123456789" },
    cliente: { nombre: "Cliente Prueba", documento: "DNI 12345678" },
    tipo_comprobante: "BOLETA",
    emitido_at: "2026-08-01T10:00:00.000Z",
    items: [{ id: "detalle-1", descripcion: "Producto", presentacion: "Unidad", cantidad: 2, precio_unitario: 5, subtotal: 10 }],
    totales: { subtotal: 8.47, igv: 1.53, total: 10 },
  },
};

function renderPage(path = "/c/token-prueba") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/c/:token" element={<ComprobantePublicoPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ComprobantePublicoPage", () => {
  it("consulta el token codificado y renderiza el comprobante validado", async () => {
    const obtainMock = vi.mocked(comprobantesService.obtenerComprobantePublico).mockResolvedValue(receipt as any);
    renderPage("/c/token%20prueba");

    expect(await screen.findByText("Botica Marifarma")).toBeInTheDocument();
    expect(screen.getByText("Producto")).toBeInTheDocument();
    await waitFor(() => expect(obtainMock).toHaveBeenCalledWith(
      "token prueba",
      expect.any(AbortSignal),
    ));
  });

  it("muestra un error controlado si la respuesta no tiene el contrato esperado", async () => {
    vi.mocked(comprobantesService.obtenerComprobantePublico).mockRejectedValue({
      message: "No tiene un formato válido",
    });
    renderPage();

    expect(await screen.findByText(/no tiene un formato válido/i)).toBeInTheDocument();
  });
});
