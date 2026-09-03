export type FormatoPapel = "80mm" | "58mm" | "A4";
export type FuenteFamilia = "mono" | "sans" | "compact";
export type TamanoFuente = "sm" | "md" | "lg";
export type Interlineado = "compacto" | "normal" | "espacioso";
export type AlineacionLogo = "center" | "left" | "right";

export interface TicketConfig {
  // Logo
  logoUrl?: string | null;
  mostrarLogo: boolean;
  logoWidthPx: number;
  logoAlineacion: AlineacionLogo;
  logoMonocromatico: boolean;

  // Tipografía
  fuenteFamilia: FuenteFamilia;
  tamanoFuente: TamanoFuente;
  interlineado: Interlineado;
  formatoPapel: FormatoPapel;

  // Textos y mensajes
  nombreComercialPersonalizado?: string;
  eslogan?: string;
  mensajePie?: string;
  mensajeContacto?: string;

  // Opciones de visibilidad
  mostrarRuc: boolean;
  mostrarDireccion: boolean;
  mostrarTelefono: boolean;
  mostrarCajero: boolean;
  mostrarCliente: boolean;
  mostrarDescuentos: boolean;
  mostrarQR: boolean;
  mostrarCodigoBarras: boolean;
}

export const TICKET_CONFIG_DEFAULT: TicketConfig = {
  logoUrl: null,
  mostrarLogo: false,
  logoWidthPx: 120,
  logoAlineacion: "center",
  logoMonocromatico: false,

  fuenteFamilia: "mono",
  tamanoFuente: "md",
  interlineado: "normal",
  formatoPapel: "80mm",

  nombreComercialPersonalizado: "",
  eslogan: "Tu salud y bienestar, nuestra prioridad",
  mensajePie: "¡Gracias por su preferencia!\nConserve este comprobante para cualquier reclamo.",
  mensajeContacto: "Delivery / Consultas: 987-654-321",

  mostrarRuc: true,
  mostrarDireccion: true,
  mostrarTelefono: true,
  mostrarCajero: true,
  mostrarCliente: true,
  mostrarDescuentos: true,
  mostrarQR: true,
  mostrarCodigoBarras: true,
};
