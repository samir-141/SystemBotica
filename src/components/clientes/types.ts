// El backend Prisma usa VARCHAR(10) sin enum, por lo que acepta cualquier cadena.
// El DTO CreateClienteDto solo valida @IsNotEmpty() y @IsString(), sin restringir valores.
// El módulo facturacion define un enum interno (TipoDocumentoIdentidad) para emisión de comprobantes,
// pero la capa de clientes almacena DNI, RUC, CE y PASAPORTE libremente.
export type TipoDocumento = "DNI" | "RUC" | "CE" | "PASAPORTE";
export type TipoCliente = "NATURAL" | "JURIDICO" | "HOSPITAL" | "CLINICA" | "DROGUERIA" | "BOTICA" | "OTRO";
export type CondicionContribuyente = "HABIDO" | "NO HABIDO" | "SUSPENDED" | "ANULADO";
export type EstadoCliente = "ACTIVO" | "INACTIVO" | "BLOQUEADO";
export type EstadoCredito = "AL CORRIENTE" | "MOROSO" | "BLOQUEADO";

export interface Cliente {
  id: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  tipo_cliente?: TipoCliente;
  condicion_contribuyente?: CondicionContribuyente;
  estado_sunat?: string | null;
  estado?: EstadoCliente;
  limite_credito?: number;
  dias_credito?: number;
  saldo_actual?: number;
  estado_credito?: EstadoCredito;
  whatsapp?: string | null;
  contacto_principal?: string | null;
  cargo_contacto?: string | null;
  representante_legal?: string | null;
  dni_representante?: string | null;
  fecha_nacimiento?: string | null;
  observaciones?: string | null;
  origen?: string | null;
  total_compras: number;
  monto_total_comprado: number;
  ultima_compra?: string | null;
  created_at?: string;
  ventas?: any[];
}

export interface ClienteFormData {
  tipo_documento: TipoDocumento;
  numero_documento: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  tipo_cliente?: TipoCliente;
  condicion_contribuyente?: CondicionContribuyente;
  estado_sunat?: string;
  estado?: EstadoCliente;
  limite_credito?: number | "";
  dias_credito?: number | "";
  saldo_actual?: number | "";
  estado_credito?: EstadoCredito;
  whatsapp?: string;
  contacto_principal?: string;
  cargo_contacto?: string;
  representante_legal?: string;
  dni_representante?: string;
  fecha_nacimiento?: string;
  observaciones?: string;
  origen?: string;
}

export type FormMode = "crear" | "editar";
