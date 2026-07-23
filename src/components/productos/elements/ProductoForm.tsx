// src/components/productos/elements/ProductoForm.tsx
import { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  Package,
  Tag,
  Barcode,
  DollarSign,
  Beaker,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { ProductoPOS } from "../../api/api.data";
import { posApi } from "../../api/api.data";
import type { ProductoFormData, FormMode, TipoCatalogo } from "../types";
import { VIAS_ADMINISTRACION, UNIDADES_CONCENTRACION } from "../types";
import type { CatalogosMap } from "../hooks/useCatalogos";
import CatalogoSelect from "./CatalogoSelect";

type Props = {
  open: boolean;
  mode: FormMode;
  producto: ProductoPOS | null;
  catalogos: CatalogosMap;
  onClose: () => void;
  onSave: (data: Record<string, unknown>, mode: FormMode) => Promise<void>;
  onCatalogoRefresh: (tipo: TipoCatalogo) => void;
};

const EMPTY_FORM: ProductoFormData = {
  nombre_comercial: "",
  sku: "",
  codigo_interno: "",
  principio_activo_id: "",
  forma_farmaceutica_id: "",
  laboratorio_id: "",
  categoria_id: "",
  concentracion: "",
  unidad_concentracion: "mg",
  via_administracion: "Oral",
  requiere_receta: false,
  afecto_igv: true,
  presentacion_id: "",
  cantidad_unidad_base: 1,
  precio_actual: "",
  codigo_barras: "",
};

/**
 * Panel lateral (slide-over) para crear o editar un producto.
 * - Crear: formulario completo con CatalogoSelects
 * - Editar: solo campos editables (precio, código de barras, flags)
 */
export default function ProductoForm({
  open,
  mode,
  producto,
  catalogos,
  onClose,
  onSave,
  onCatalogoRefresh,
}: Props) {
  const [form, setForm] = useState<ProductoFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para búsqueda de producto comercial existente
  const [searchVal, setSearchVal] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundProduct, setFoundProduct] = useState(false);

  const isEdit = mode === "editar";

  /* Pre-fill form on open */
  useEffect(() => {
    if (!open) return;
    setError(null);
    setSearchVal("");
    setFoundProduct(false);

    if (isEdit && producto) {
      setForm({
        nombre_comercial: producto.nombre_comercial,
        sku: producto.sku,
        codigo_interno: producto.codigo_interno ?? "",
        principio_activo_id: "",
        forma_farmaceutica_id: "",
        laboratorio_id: "",
        categoria_id: "",
        concentracion: producto.concentracion,
        unidad_concentracion: producto.unidad_concentracion,
        via_administracion: producto.via_administracion,
        requiere_receta: producto.requiere_receta,
        afecto_igv: producto.afecto_igv,
        presentacion_id: producto.presentacion_id,
        cantidad_unidad_base: producto.cantidad_unidad_base,
        precio_actual: producto.precio_actual,
        codigo_barras: producto.codigo_barras ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, mode, producto]);

  /* Field updater */
  const set = <K extends keyof ProductoFormData>(key: K, value: ProductoFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /* Buscar producto existente para agregar una nueva presentación */
  const handleSearchExisting = async () => {
    if (!searchVal.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const res = await posApi.buscarProductoPorIdentificador(searchVal.trim());
      if (res && res.encontrado) {
        setForm({
          producto_comercial_id: res.producto_comercial_id,
          nombre_comercial: res.nombre_comercial,
          sku: res.sku,
          codigo_interno: res.codigo_interno ?? "",
          principio_activo_id: res.principio_activo_id,
          forma_farmaceutica_id: res.forma_farmaceutica_id,
          laboratorio_id: res.laboratorio_id,
          categoria_id: res.categoria_id,
          concentracion: res.concentracion,
          unidad_concentracion: res.unidad_concentracion,
          via_administracion: res.via_administracion,
          requiere_receta: res.requiere_receta,
          afecto_igv: res.afecto_igv,
          presentacion_id: "", // El usuario debe seleccionar
          cantidad_unidad_base: 1, // Por defecto
          precio_actual: "",
          codigo_barras: "",
        });
        setFoundProduct(true);
      } else {
        setError("No se encontró ningún producto comercial con ese SKU o Código de Barras.");
        setFoundProduct(false);
      }
    } catch (err: any) {
      setError(err.message ?? "Error al buscar producto comercial");
      setFoundProduct(false);
    } finally {
      setSearching(false);
    }
  };

  /* Submit */
  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {};

      if (isEdit && producto) {
        payload.presentacion_id = producto.presentacion_id;
        payload.precio_actual = Number(form.precio_actual);
        payload.codigo_barras = form.codigo_barras;
        payload.requiere_receta = form.requiere_receta;
        payload.afecto_igv = form.afecto_igv;
      } else {
        // Si el producto comercial ya existe, solo enviamos su ID y los campos de la nueva presentación
        if (form.producto_comercial_id) {
          payload.producto_comercial_id = form.producto_comercial_id;
        } else {
          // Crear de cero: enviar toda la clasificación y datos comerciales
          payload.nombre_comercial = form.nombre_comercial;
          payload.sku = form.sku;
          if (form.codigo_interno) payload.codigo_interno = form.codigo_interno;
          payload.principio_activo_id = form.principio_activo_id;
          payload.forma_farmaceutica_id = form.forma_farmaceutica_id;
          payload.laboratorio_id = form.laboratorio_id;
          payload.categoria_id = form.categoria_id;
          payload.concentracion = Number(form.concentracion);
          payload.unidad_concentracion = form.unidad_concentracion;
          payload.via_administracion = form.via_administracion;
          payload.requiere_receta = form.requiere_receta;
          payload.afecto_igv = form.afecto_igv;
        }
        // Campos comunes de la presentación
        payload.presentacion_id = form.presentacion_id;
        payload.cantidad_unidad_base = Number(form.cantidad_unidad_base);
        payload.precio_actual = Number(form.precio_actual);
        if (form.codigo_barras) payload.codigo_barras = form.codigo_barras;
      }

      await onSave(payload, mode);
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  /* Validation */
  const isValid = (): boolean => {
    if (isEdit) {
      return form.precio_actual !== "" && Number(form.precio_actual) > 0;
    }
    // Si ya existe el producto comercial, solo requerimos los datos de la presentación
    if (form.producto_comercial_id) {
      return (
        !!form.presentacion_id &&
        form.cantidad_unidad_base !== "" &&
        Number(form.cantidad_unidad_base) >= 1 &&
        form.precio_actual !== "" &&
        Number(form.precio_actual) > 0
      );
    }
    // De cero
    return (
      !!form.nombre_comercial.trim() &&
      !!form.sku.trim() &&
      !!form.principio_activo_id &&
      !!form.forma_farmaceutica_id &&
      !!form.laboratorio_id &&
      !!form.categoria_id &&
      !!form.presentacion_id &&
      form.concentracion !== "" &&
      form.precio_actual !== "" &&
      Number(form.precio_actual) > 0
    );
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel slide-over */}
      <div
        className="fixed inset-y-0 right-0 z-[101] w-full max-w-lg bg-white shadow-2xl
          flex flex-col animate-slideRight"
      >
        {/* ── Header ──────────────────────────────────── */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <Package className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm">
                {isEdit ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              {isEdit && producto && (
                <p className="text-[10px] text-slate-400 font-mono">{producto.sku}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Buscar producto existente para agregar presentación */}
          {!isEdit && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                ¿El producto ya está registrado? Búscalo por SKU o Barras
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="SKU o Código de Barras..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                  onKeyDown={(e) => e.key === "Enter" && handleSearchExisting()}
                />
                <button
                  type="button"
                  onClick={handleSearchExisting}
                  disabled={searching || !searchVal.trim()}
                  className="px-3 py-2 bg-teal-600 text-white font-bold text-xs rounded-lg hover:bg-teal-700 disabled:opacity-50 transition active:scale-[0.98]"
                >
                  {searching ? "Buscando..." : "Buscar"}
                </button>
              </div>
              {foundProduct && (
                <div className="flex items-center justify-between mt-1 text-[11px] text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200">
                  <span className="font-semibold">¡Producto enlazado correctamente!</span>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(EMPTY_FORM);
                      setFoundProduct(false);
                      setSearchVal("");
                    }}
                    className="underline font-bold text-teal-800 hover:text-teal-950"
                  >
                    Desvincular
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── Sección: Info Básica ─────────────────── */}
          <fieldset className="space-y-3">
            <legend className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
              <Tag className="w-3 h-3" /> Información General
            </legend>

            {/* Nombre comercial */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Nombre Comercial <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={form.nombre_comercial}
                onChange={(e) => set("nombre_comercial", e.target.value)}
                disabled={isEdit || foundProduct}
                placeholder="Ej: Advil 400mg"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                  disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                  placeholder:text-slate-300 transition"
              />
            </div>

            {/* SKU + Código Interno */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  SKU <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                  disabled={isEdit || foundProduct}
                  placeholder="SKU-001"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono
                    disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                    placeholder:text-slate-300 transition"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Código Interno
                </label>
                <input
                  type="text"
                  value={form.codigo_interno}
                  onChange={(e) => set("codigo_interno", e.target.value)}
                  disabled={isEdit || foundProduct}
                  placeholder="INT-001"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono
                    disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                    placeholder:text-slate-300 transition"
                />
              </div>
            </div>
          </fieldset>

          {/* ─── Sección: Catálogos Maestros ──────────── */}
          {!isEdit && (
            <fieldset className="space-y-3">
              <legend className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                <Beaker className="w-3 h-3" /> Clasificación Farmacéutica
              </legend>

              <CatalogoSelect
                tipo="principios-activos"
                items={catalogos["principios-activos"]}
                value={form.principio_activo_id}
                onChange={(id) => set("principio_activo_id", id)}
                onItemCreated={onCatalogoRefresh}
                disabled={foundProduct}
                required
              />

              <CatalogoSelect
                tipo="formas-farmaceuticas"
                items={catalogos["formas-farmaceuticas"]}
                value={form.forma_farmaceutica_id}
                onChange={(id) => set("forma_farmaceutica_id", id)}
                onItemCreated={onCatalogoRefresh}
                disabled={foundProduct}
                required
              />

              <CatalogoSelect
                tipo="laboratorios"
                items={catalogos["laboratorios"]}
                value={form.laboratorio_id}
                onChange={(id) => set("laboratorio_id", id)}
                onItemCreated={onCatalogoRefresh}
                disabled={foundProduct}
                required
              />

              <CatalogoSelect
                tipo="categorias"
                items={catalogos["categorias"]}
                value={form.categoria_id}
                onChange={(id) => set("categoria_id", id)}
                onItemCreated={onCatalogoRefresh}
                disabled={foundProduct}
                required
              />

              {/* Concentración + Unidad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Concentración <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.concentracion}
                    onChange={(e) =>
                      set("concentracion", e.target.value === "" ? "" : Number(e.target.value))
                    }
                    disabled={foundProduct}
                    placeholder="400"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono
                      disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                      placeholder:text-slate-300 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Unidad
                  </label>
                  <select
                    value={form.unidad_concentracion}
                    onChange={(e) => set("unidad_concentracion", e.target.value)}
                    disabled={foundProduct}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white appearance-none
                      disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                  >
                    {UNIDADES_CONCENTRACION.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vía Administración */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Vía de Administración
                </label>
                <select
                  value={form.via_administracion}
                  onChange={(e) => set("via_administracion", e.target.value)}
                  disabled={foundProduct}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white appearance-none
                    disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
                >
                  {VIAS_ADMINISTRACION.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </fieldset>
          )}

          {/* ─── Sección: Presentación y Precio ──────── */}
          <fieldset className="space-y-3">
            <legend className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
              <DollarSign className="w-3 h-3" /> Presentación y Precio
            </legend>

            {!isEdit && (
              <>
                <CatalogoSelect
                  tipo="unidades-presentacion"
                  items={catalogos["unidades-presentacion"]}
                  value={form.presentacion_id}
                  onChange={(id) => set("presentacion_id", id)}
                  onItemCreated={onCatalogoRefresh}
                  required
                />
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Cant. Unidades Base por Pack
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.cantidad_unidad_base}
                    onChange={(e) =>
                      set("cantidad_unidad_base", e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="1"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono
                      focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                      placeholder:text-slate-300 transition"
                  />
                </div>
              </>
            )}

            {/* Precio */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Precio de Venta (S/) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  S/
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.precio_actual}
                  onChange={(e) =>
                    set("precio_actual", e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono text-right
                    focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                    placeholder:text-slate-300 transition"
                />
              </div>
            </div>

            {/* Código de barras */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1 flex items-center gap-1">
                <Barcode className="w-3 h-3" /> Código de Barras
              </label>
              <input
                type="text"
                value={form.codigo_barras}
                onChange={(e) => set("codigo_barras", e.target.value)}
                placeholder="7751234567890"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono tracking-wider
                  focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                  placeholder:text-slate-300 transition"
              />
            </div>
          </fieldset>

          {/* ─── Sección: Opciones ────────────────────── */}
          <fieldset className="space-y-3">
            <legend className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
              Opciones
            </legend>

            {/* Toggle: Requiere Receta */}
            <button
              type="button"
              onClick={() => !foundProduct && set("requiere_receta", !form.requiere_receta)}
              disabled={foundProduct}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200
                bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition"
            >
              <span className="text-sm text-slate-700 font-medium">Requiere Receta Médica</span>
              {form.requiere_receta ? (
                <ToggleRight className={`w-6 h-6 ${foundProduct ? "text-teal-400" : "text-teal-600"}`} />
              ) : (
                <ToggleLeft className="w-6 h-6 text-slate-300" />
              )}
            </button>

            {/* Toggle: Afecto IGV */}
            <button
              type="button"
              onClick={() => !foundProduct && set("afecto_igv", !form.afecto_igv)}
              disabled={foundProduct}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200
                bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition"
            >
              <span className="text-sm text-slate-700 font-medium">Afecto a IGV (18%)</span>
              {form.afecto_igv ? (
                <ToggleRight className={`w-6 h-6 ${foundProduct ? "text-teal-400" : "text-teal-600"}`} />
              ) : (
                <ToggleLeft className="w-6 h-6 text-slate-300" />
              )}
            </button>
          </fieldset>

          {/* Info readonly en modo editar */}
          {isEdit && producto && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-500">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                Información de Referencia
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Principio Activo:</span>
                  <p className="font-medium text-slate-700">{producto.principio_activo}</p>
                </div>
                <div>
                  <span className="text-slate-400">Forma:</span>
                  <p className="font-medium text-slate-700">{producto.forma_farmaceutica}</p>
                </div>
                <div>
                  <span className="text-slate-400">Laboratorio:</span>
                  <p className="font-medium text-slate-700">{producto.laboratorio}</p>
                </div>
                <div>
                  <span className="text-slate-400">Categoría:</span>
                  <p className="font-medium text-slate-700">{producto.categoria}</p>
                </div>
                <div>
                  <span className="text-slate-400">Presentación:</span>
                  <p className="font-medium text-slate-700">{producto.presentacion_nombre}</p>
                </div>
                <div>
                  <span className="text-slate-400">Concentración:</span>
                  <p className="font-medium text-slate-700">
                    {producto.concentracion}{producto.unidad_concentracion}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────── */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200
              rounded-xl hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid() || saving}
            className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700
              disabled:bg-slate-200 disabled:text-slate-400 rounded-xl shadow-sm transition
              flex items-center gap-1.5 active:scale-[0.98]"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEdit ? "Guardar Cambios" : "Crear Producto"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slideRight {
          animation: slideRight 0.25s ease-out both;
        }
      `}</style>
    </>
  );
}
