// src/services/facturacion.service.ts
import { api } from "./api";

export type TipoComprobanteSunat = "01" | "03";

export interface ConfiguracionTributaria {
  id: string;
  ruc: string;
  razon_social: string;
  nombre_comercial: string | null;
  codigo_pais: string;
  ubigeo: string | null;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  direccion_fiscal: string;
  regimen_tributario: string;
  /** Tipos SUNAT (catálogo 01) que la empresa puede emitir según su régimen. */
  comprobantes_permitidos?: string[];
  emisor_electronico: boolean;
  ambiente: string;
  proveedor_facturacion: string;
  tiene_credenciales_sol: boolean;
  certificado_nombre: string | null;
  certificado_fecha_vencimiento: string | null;
  tiene_certificado: boolean;
  activo: boolean;
}

export interface GuardarConfiguracionPayload {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  ubigeo?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  direccionFiscal: string;
  regimenTributario: string;
  emisorElectronico?: boolean;
  ambiente?: string;
  solUsuario?: string;
  solClave?: string;
  certificadoClave?: string;
  activo?: boolean;
}

export interface ComprobanteEmitido {
  id: string;
  tipo_comprobante: string;
  serie: string;
  correlativo: number;
  numero: string;
  cliente_numero_documento: string | null;
  cliente_razon_social: string | null;
  total: number;
  moneda: string;
  fecha_emision: string;
  estado: string;
  codigo_respuesta: string | null;
  mensaje_respuesta: string | null;
  venta_id: string;
  hash?: string | null;
  tiene_xml?: boolean;
  tiene_cdr?: boolean;
  tiene_pdf?: boolean;
}

export interface ListaComprobantes {
  total: number;
  pagina: number;
  limite: number;
  datos: ComprobanteEmitido[];
}

export const facturacionService = {
  // ------------------------------------------------------------ configuración
  obtenerConfiguracion: async (): Promise<ConfiguracionTributaria | null> => {
    const { data } = await api.get<ConfiguracionTributaria | null>(
      "/facturacion/configuracion-tributaria",
    );
    return data;
  },

  guardarConfiguracion: async (
    payload: GuardarConfiguracionPayload,
  ): Promise<ConfiguracionTributaria> => {
    const { data } = await api.post<ConfiguracionTributaria>(
      "/facturacion/configuracion-tributaria",
      payload,
    );
    return data;
  },

  actualizarConfiguracion: async (
    payload: GuardarConfiguracionPayload,
  ): Promise<ConfiguracionTributaria> => {
    const { data } = await api.patch<ConfiguracionTributaria>(
      "/facturacion/configuracion-tributaria",
      payload,
    );
    return data;
  },

  subirCertificado: async (
    archivo: File,
    clave: string,
  ): Promise<ConfiguracionTributaria> => {
    const form = new FormData();
    form.append("certificado", archivo);
    form.append("clave", clave);
    const { data } = await api.post<ConfiguracionTributaria>(
      "/facturacion/configuracion-tributaria/certificado",
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  probarConexion: async (): Promise<{ listo: boolean; faltantes: string[] }> => {
    const { data } = await api.post<{ listo: boolean; faltantes: string[] }>(
      "/facturacion/configuracion-tributaria/probar-conexion",
    );
    return data;
  },

  // ------------------------------------------------------------ comprobantes
  emitir: async (payload: {
    ventaId: string;
    tipoComprobante: TipoComprobanteSunat;
    serieId: string;
  }): Promise<ComprobanteEmitido> => {
    const { data } = await api.post<ComprobanteEmitido>(
      "/facturacion/emitir",
      payload,
    );
    return data;
  },

  listarComprobantes: async (params?: {
    estado?: string;
    tipo?: string;
    pagina?: number;
    limite?: number;
  }): Promise<ListaComprobantes> => {
    const { data } = await api.get<ListaComprobantes>(
      "/facturacion/comprobantes",
      { params },
    );
    return data;
  },

  reintentar: async (id: string): Promise<ComprobanteEmitido> => {
    const { data } = await api.post<ComprobanteEmitido>(
      `/facturacion/comprobantes/${id}/reintentar`,
    );
    return data;
  },

  /** Descarga un artefacto (xml | cdr | pdf) como archivo. */
  descargar: async (
    id: string,
    tipo: "xml" | "cdr" | "pdf",
  ): Promise<void> => {
    const { data, headers } = await api.get<Blob>(
      `/facturacion/comprobantes/${id}/${tipo}`,
      { responseType: "blob" },
    );
    const disposition = String(headers["content-disposition"] ?? "");
    const match = /filename="?([^";]+)"?/.exec(disposition);
    const nombre = match?.[1] ?? `comprobante.${tipo === "pdf" ? "pdf" : "xml"}`;
    const url = URL.createObjectURL(data);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(url);
  },
};
