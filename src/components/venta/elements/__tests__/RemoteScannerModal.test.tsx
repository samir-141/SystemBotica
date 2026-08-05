import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RemoteScannerModal from "../RemoteScannerModal";

const mocks = vi.hoisted(() => ({
  toDataURL: vi.fn(),
}));

vi.mock("qrcode", () => ({
  default: { toDataURL: mocks.toDataURL },
}));

vi.mock("../../../../utils/deviceDetector", () => ({
  detectDevice: () => ({ esMovil: false, os: "Windows" }),
}));

const baseProps = {
  open: true,
  onClose: vi.fn(),
  sessionCode: "SESION-SEGURA",
  connected: true,
  remoteDeviceConnected: false,
  expiresAt: Date.now() + 300_000,
};

describe("RemoteScannerModal - enlace móvil seguro", () => {
  beforeEach(() => {
    mocks.toDataURL.mockReset();
    mocks.toDataURL.mockResolvedValue("data:image/png;base64,qr");
    vi.stubEnv("VITE_PUBLIC_APP_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("genera el QR de cámara para localhost a pesar del warning", async () => {
    render(<RemoteScannerModal {...baseProps} />);

    expect(await screen.findByText(/no puede abrir localhost/i)).toBeInTheDocument();
    await waitFor(() => expect(mocks.toDataURL).toHaveBeenCalled());
    expect(await screen.findByRole("img", { name: /Código QR escaneable/i })).toBeInTheDocument();
  });

  it("genera el QR sobre VITE_PUBLIC_APP_URL cuando es un dominio HTTPS", async () => {
    vi.stubEnv("VITE_PUBLIC_APP_URL", "https://pos.marifarma.pe");
    render(<RemoteScannerModal {...baseProps} />);

    await waitFor(() => expect(mocks.toDataURL).toHaveBeenCalledWith(
      "https://pos.marifarma.pe/escanner-remoto?session=SESION-SEGURA",
      expect.any(Object),
    ));
    expect(await screen.findByRole("img", { name: /Código QR escaneable/i })).toBeInTheDocument();
    expect(screen.queryByText(/no puede abrir localhost/i)).not.toBeInTheDocument();
  });
});
