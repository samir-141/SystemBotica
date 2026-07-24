export type TipoDocumento = "DNI" | "RUC" | "CE" | "PASAPORTE";

export interface Cliente {
  id: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  total_compras: number;
  monto_total_comprado: number;
  ultima_compra?: string | null;
  created_at?: string;
}

export interface ClienteFormData {
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export type FormMode = "crear" | "editar";
