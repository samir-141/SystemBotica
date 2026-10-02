import { create } from 'zustand';

export type ModoEmision = 'CREACION' | 'REINTENTO';
export type TipoComprobanteProgreso = 'BOLETA' | 'FACTURA';
export type EstadoEmisionProgreso = 'PROCESANDO' | 'EXITO' | 'ERROR';

export interface EtapaConfig {
  paso: number;
  nombreCorto: string;
  titulo: string;
  descripcion: string;
  porcentajeEstimado: number;
}

export const ETAPAS_EMISION_SOL: EtapaConfig[] = [
  {
    paso: 1,
    nombreCorto: 'Conexión',
    titulo: 'Conectando con SUNAT SOL',
    descripcion: 'Iniciando navegador seguro y accediendo al portal tributario...',
    porcentajeEstimado: 12,
  },
  {
    paso: 2,
    nombreCorto: 'Credenciales',
    titulo: 'Autenticando Credenciales SOL',
    descripcion: 'Validando acceso seguro con RUC/DNI y clave SOL...',
    porcentajeEstimado: 28,
  },
  {
    paso: 3,
    nombreCorto: 'Módulo SEE',
    titulo: 'Cargando Módulo SEE - SOL',
    descripcion: 'Navegando al formulario oficial de Emisión de Comprobantes...',
    porcentajeEstimado: 44,
  },
  {
    paso: 4,
    nombreCorto: 'Receptor',
    titulo: 'Registrando Datos del Receptor',
    descripcion: 'Configurando cliente, tipo de documento y moneda...',
    porcentajeEstimado: 58,
  },
  {
    paso: 5,
    nombreCorto: 'Ítems y Precios',
    titulo: 'Adicionando Productos y Precios',
    descripcion: 'Insertando ítems, cantidades y sincronizando valor unitario...',
    porcentajeEstimado: 76,
  },
  {
    paso: 6,
    nombreCorto: 'Validación',
    titulo: 'Verificando Preliminar',
    descripcion: 'Comprobando totales tributarios y confirmando emisión...',
    porcentajeEstimado: 90,
  },
  {
    paso: 7,
    nombreCorto: 'Emisión',
    titulo: 'Comprobante Emitido con Éxito',
    descripcion: 'Recuperando número de comprobante oficial y constancia...',
    porcentajeEstimado: 100,
  },
];

interface IniciarParams {
  modo?: ModoEmision;
  tipoComprobante?: TipoComprobanteProgreso;
  detalles?: {
    cliente?: string;
    total?: number;
    cantidadItems?: number;
  };
}

interface ActualizarProgresoParams {
  paso?: number;
  totalPasos?: number;
  titulo?: string;
  descripcion?: string;
  porcentaje?: number;
  etapa?: string;
}

interface EmisionProgresoState {
  isOpen: boolean;
  modo: ModoEmision;
  tipoComprobante: TipoComprobanteProgreso;
  pasoActual: number;
  totalPasos: number;
  titulo: string;
  descripcion: string;
  porcentaje: number;
  estado: EstadoEmisionProgreso;
  mensajeError: string | null;
  numeroComprobante: string | null;
  detalles: {
    cliente?: string;
    total?: number;
    cantidadItems?: number;
  };

  // Acciones
  iniciar: (params?: IniciarParams) => void;
  actualizarProgreso: (params: ActualizarProgresoParams) => void;
  avanzarPaso: () => void;
  finalizarExito: (numeroComprobante?: string) => void;
  finalizarError: (errorMsg: string) => void;
  cerrar: () => void;
}

export const useEmisionProgresoStore = create<EmisionProgresoState>((set, get) => ({
  isOpen: false,
  modo: 'CREACION',
  tipoComprobante: 'BOLETA',
  pasoActual: 1,
  totalPasos: 7,
  titulo: ETAPAS_EMISION_SOL[0].titulo,
  descripcion: ETAPAS_EMISION_SOL[0].descripcion,
  porcentaje: ETAPAS_EMISION_SOL[0].porcentajeEstimado,
  estado: 'PROCESANDO',
  mensajeError: null,
  numeroComprobante: null,
  detalles: {},

  iniciar: (params) => {
    const modo = params?.modo || 'CREACION';
    const tipo = params?.tipoComprobante || 'BOLETA';
    const primera = ETAPAS_EMISION_SOL[0];

    set({
      isOpen: true,
      modo,
      tipoComprobante: tipo,
      pasoActual: 1,
      totalPasos: 7,
      titulo: primera.titulo,
      descripcion: primera.descripcion,
      porcentaje: primera.porcentajeEstimado,
      estado: 'PROCESANDO',
      mensajeError: null,
      numeroComprobante: null,
      detalles: params?.detalles || {},
    });
  },

  actualizarProgreso: (params) => {
    const paso = params.paso ?? get().pasoActual;
    const configEtapa = ETAPAS_EMISION_SOL.find((e) => e.paso === paso);

    set({
      pasoActual: paso,
      totalPasos: params.totalPasos ?? get().totalPasos,
      titulo: params.titulo || configEtapa?.titulo || get().titulo,
      descripcion: params.descripcion || configEtapa?.descripcion || get().descripcion,
      porcentaje: params.porcentaje ?? configEtapa?.porcentajeEstimado ?? get().porcentaje,
    });
  },

  avanzarPaso: () => {
    const siguiente = Math.min(get().pasoActual + 1, 7);
    const configEtapa = ETAPAS_EMISION_SOL.find((e) => e.paso === siguiente);
    if (configEtapa) {
      set({
        pasoActual: siguiente,
        titulo: configEtapa.titulo,
        descripcion: configEtapa.descripcion,
        porcentaje: configEtapa.porcentajeEstimado,
      });
    }
  },

  finalizarExito: (numeroComprobante) => {
    set({
      estado: 'EXITO',
      pasoActual: 7,
      porcentaje: 100,
      titulo: '¡Comprobante Emitido con Éxito!',
      descripcion: numeroComprobante
        ? `Se generó el comprobante oficial ${numeroComprobante} aceptado por SUNAT.`
        : 'La emisión electrónica fue aceptada correctamente por SUNAT.',
      numeroComprobante: numeroComprobante || null,
    });
  },

  finalizarError: (errorMsg) => {
    set({
      estado: 'ERROR',
      mensajeError: errorMsg || 'Ocurrió una observación al procesar en SUNAT SOL.',
    });
  },

  cerrar: () => {
    set({ isOpen: false });
  },
}));
