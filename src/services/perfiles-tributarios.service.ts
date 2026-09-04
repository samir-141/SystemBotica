// src/services/perfiles-tributarios.service.ts
import { api } from "./api";

export interface ConfiguracionEmision {
  id: string;
  perfil_tributario_id: string;
  sistema_emision: string;
  proveedor_tipo: string;
  ambiente: string;
  tiene_sol_usuario: boolean;
  tiene_sol_clave: boolean;
  certificado_nombre: string | null;
  certificado_fecha_vencimiento: string | null;
  tiene_certificado: boolean;
  pse_id: string | null;
  ose_id: string | null;
  verificado: boolean;
  activo: boolean;
}

export interface PerfilTributario {
  id: string;
  botica_id: string;
  ruc: string;
  razon_social: string;
  nombre_comercial: string | null;
  tipo_contribuyente: string;
  regimen_tributario: string;
  direccion_fiscal: string;
  ubigeo: string | null;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  telefono: string | null;
  email: string | null;
  estado_sunat: string | null;
  condicion_sunat: string | null;
  es_principal: boolean;
  activo: boolean;
  configuracion_emision?: ConfiguracionEmision | null;
  comprobantes_permitidos?: string[];
  permite_factura?: boolean;
  requiere_certificado?: boolean;
}

export interface CreatePerfilTributarioPayload {
  ruc: string;
  razon_social: string;
  nombre_comercial?: string;
  tipo_contribuyente?: string;
  regimen_tributario: string;
  direccion_fiscal: string;
  ubigeo?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  telefono?: string;
  email?: string;
  estado_sunat?: string;
  condicion_sunat?: string;
  es_principal?: boolean;
  activo?: boolean;
  configuracion_emision?: {
    sistema_emision?: string;
    proveedor_tipo?: string;
    ambiente?: string;
    sol_usuario?: string;
    sol_clave?: string;
    certificado_clave?: string;
    pse_id?: string;
    ose_id?: string;
  };
}

export interface UpdatePerfilTributarioPayload extends Partial<CreatePerfilTributarioPayload> {}

export interface GuardarConfigEmisionPayload {
  sistema_emision?: string;
  proveedor_tipo?: string;
  ambiente?: string;
  sol_usuario?: string;
  sol_clave?: string;
  certificado_clave?: string;
  pse_id?: string;
  ose_id?: string;
  activo?: boolean;
}

export interface RucConsultado {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  tipoContribuyente?: string;
  estado?: string;
  condicion?: string;
  direccion?: string;
  ubigeo?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
}

export const perfilesTributariosService = {
  listar: async (): Promise<PerfilTributario[]> => {
    const { data } = await api.get<PerfilTributario[]>("/perfiles-tributarios");
    return data;
  },

  obtener: async (id: string): Promise<PerfilTributario> => {
    const { data } = await api.get<PerfilTributario>(`/perfiles-tributarios/${id}`);
    return data;
  },

  crear: async (payload: CreatePerfilTributarioPayload): Promise<PerfilTributario> => {
    const { data } = await api.post<PerfilTributario>("/perfiles-tributarios", payload);
    return data;
  },

  actualizar: async (id: string, payload: UpdatePerfilTributarioPayload): Promise<PerfilTributario> => {
    const { data } = await api.patch<PerfilTributario>(`/perfiles-tributarios/${id}`, payload);
    return data;
  },

  eliminar: async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await api.delete<{ mensaje: string }>(`/perfiles-tributarios/${id}`);
    return data;
  },

  guardarConfigEmision: async (
    id: string,
    payload: GuardarConfigEmisionPayload,
  ): Promise<PerfilTributario> => {
    const { data } = await api.post<PerfilTributario>(
      `/perfiles-tributarios/${id}/configuracion-emision`,
      payload,
    );
    return data;
  },

  subirCertificado: async (
    id: string,
    file: File,
    password?: string,
  ): Promise<PerfilTributario> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("certificado", file);
    if (password) {
      formData.append("password", password);
      formData.append("clave", password);
    }
    const { data } = await api.post<PerfilTributario>(
      `/perfiles-tributarios/${id}/certificado`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data;
  },

  verificarConfiguracion: async (
    id: string,
  ): Promise<{ valido: boolean; mensaje: string; detalles?: any }> => {
    const { data } = await api.post<{ valido: boolean; mensaje: string; detalles?: any }>(
      `/perfiles-tributarios/${id}/verificar`,
    );
    return data;
  },

  consultarRuc: async (ruc: string): Promise<RucConsultado> => {
    const { data } = await api.get<RucConsultado>(
      `/perfiles-tributarios/consultar-ruc/${ruc}`,
    );
    return data;
  },

  obtenerCapacidades: async (
    regimen: string,
    sistemaEmision?: string,
  ): Promise<{
    regimen: string;
    sistema_emision: string;
    comprobantes_permitidos: string[];
    permite_factura: boolean;
    requiere_certificado: boolean;
  }> => {
    const { data } = await api.get(
      `/perfiles-tributarios/capacidades?regimen=${regimen}${sistemaEmision ? `&sistemaEmision=${sistemaEmision}` : ""}`,
    );
    return data;
  },
};
