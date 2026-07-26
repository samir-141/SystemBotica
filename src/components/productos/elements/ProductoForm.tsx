// src/components/productos/elements/ProductoForm.tsx
import { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  Package,
  Tag,
  Barcode,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Pill,
  Sparkles,
  Layers,
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

  // Estado para la ventana de ayuda sobre presentaciones
  const [mostrarAyuda, setMostrarAyuda] = useState(false);

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
        codigo_interno: producto.codigo_interno || "",
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
        codigo_barras: "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, mode, producto, isEdit]);

  if (!open) return null;

  const set = (key: keyof ProductoFormData, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  /* Búsqueda por SKU o Código de Barras */
  const handleSearch = async () => {
    if (!searchVal.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const res = await posApi.buscarPorIdentificador(searchVal.trim());
      if (res.encontrado && res.producto) {
        const p = res.producto;
        setForm((prev) => ({
          ...prev,
          nombre_comercial: p.nombre_comercial,
          sku: p.sku,
          codigo_interno: p.codigo_interno || "",
          principio_activo_id: p.principio_activo_id,
          forma_farmaceutica_id: p.forma_farmaceutica_id,
          laboratorio_id: p.laboratorio_id,
          categoria_id: p.categoria_id,
          concentracion: p.concentracion,
          unidad_concentracion: p.unidad_concentracion,
          via_administracion: p.via_administracion,
          requiere_receta: p.requiere_receta,
          afecto_igv: p.afecto_igv,
        }));
        setFoundProduct(true);
      } else {
        setError("No se encontró ningún producto comercial con ese identificador.");
      }
    } catch (err: any) {
      setError(err.message ?? "Error en la búsqueda");
    } finally {
      setSearching(false);
    }
  };

  /* Submit handler */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.precio_actual === "" || Number(form.precio_actual) < 0) {
      setError("El precio de venta debe ser un número válido mayor o igual a 0.");
      return;
    }

    if (!isEdit && !form.nombre_comercial.trim()) {
      setError("El nombre comercial es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      await onSave(form as unknown as Record<string, unknown>, mode);
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col">
          {/* ── Header ──────────────────────────────────── */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">
                  {isEdit ? "Editar Producto" : "Nuevo Producto Farmacéutico"}
                </h2>
                <p className="text-xs text-slate-400">
                  {isEdit
                    ? `Modificando: ${producto?.nombre_comercial ?? ""}`
                    : "Registro unificado de medicamentos y presentaciones"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Form Body ───────────────────────────────── */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            {/* Búsqueda previa en modo Crear */}
            {!isEdit && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  ¿El producto comercial ya existe? Búscalo aquí:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                    placeholder="Escribe SKU o Código de Barras..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-3.5 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition cursor-pointer"
                  >
                    {searching ? "Buscando..." : "Buscar"}
                  </button>
                </div>
                {foundProduct && (
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    ✓ Producto encontrado. Los datos del medicamento han sido rellenados.
                  </p>
                )}
              </div>
            )}

            {/* ─── Sección: Datos Comerciales ───────────── */}
            {!isEdit && (
              <fieldset className="space-y-3">
                <legend className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                  <Tag className="w-3 h-3" /> Datos Comerciales
                </legend>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Nombre Comercial <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nombre_comercial}
                    onChange={(e) => set("nombre_comercial", e.target.value)}
                    disabled={foundProduct}
                    placeholder="ej. Paracetamol 500mg, Panadol Forte, Apronax"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none transition disabled:bg-slate-50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      SKU / Código Unificado
                    </label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(e) => set("sku", e.target.value)}
                      disabled={foundProduct}
                      placeholder="ej. PAR-500-TAB"
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none transition disabled:bg-slate-50"
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
                      disabled={foundProduct}
                      placeholder="ej. INT-0091"
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none transition disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {/* Selección de Laboratorio y Categoría */}
                <div className="grid grid-cols-2 gap-3">
                  <CatalogoSelect
                    tipo="laboratorios"
                    items={catalogos.laboratorios}
                    value={form.laboratorio_id}
                    onChange={(id) => set("laboratorio_id", id)}
                    onItemCreated={onCatalogoRefresh}
                    disabled={foundProduct}
                    required
                  />
                  <CatalogoSelect
                    tipo="categorias"
                    items={catalogos.categorias}
                    value={form.categoria_id}
                    onChange={(id) => set("categoria_id", id)}
                    onItemCreated={onCatalogoRefresh}
                    disabled={foundProduct}
                    required
                  />
                </div>
              </fieldset>
            )}

            {/* ─── Sección: Ficha Farmacéutica ──────────── */}
            {!isEdit && (
              <fieldset className="space-y-3">
                <legend className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                  <Pill className="w-3 h-3" /> Ficha Farmacéutica
                </legend>

                <div className="grid grid-cols-2 gap-3">
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
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Concentración
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.concentracion}
                      onChange={(e) => set("concentracion", e.target.value === "" ? "" : Number(e.target.value))}
                      disabled={foundProduct}
                      placeholder="ej. 500"
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none transition disabled:bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Unidad Conc.
                    </label>
                    <select
                      value={form.unidad_concentracion}
                      onChange={(e) => set("unidad_concentracion", e.target.value)}
                      disabled={foundProduct}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none transition disabled:bg-slate-50"
                    >
                      {UNIDADES_CONCENTRACION.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Vía Admin.
                    </label>
                    <select
                      value={form.via_administracion}
                      onChange={(e) => set("via_administracion", e.target.value)}
                      disabled={foundProduct}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none transition disabled:bg-slate-50"
                    >
                      {VIAS_ADMINISTRACION.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>
            )}

            {/* ─── Sección: Presentación y Precio (con Ayuda `❓`) ─── */}
            <fieldset className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <legend className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-600" /> Presentaciones Unificadas & Precio
                </legend>

                <button
                  type="button"
                  onClick={() => setMostrarAyuda(!mostrarAyuda)}
                  className="text-teal-700 hover:text-teal-800 text-xs font-extrabold flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200 cursor-pointer"
                >
                  <HelpCircle size={14} />
                  <span>❓ ¿Cómo funciona?</span>
                </button>
              </div>

              {/* Caja de Ayuda Explicativa */}
              {mostrarAyuda && (
                <div className="p-4 bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl border border-teal-500/30 text-xs space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 font-black text-teal-300">
                    <Sparkles size={16} />
                    <span>Explicación del Manejo Unificado por Producto:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    En esta farmacia, <strong className="text-white">cada producto es un registro único</strong> (ej. <em>Paracetamol 500mg</em>). No necesitas crear productos independientes para Caja, Blíster o Tabletas.
                  </p>
                  <div className="space-y-1 bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-[11px] font-mono">
                    <p>💊 <strong>Pastillas:</strong> Unidad Base = Pastilla (1). Blíster = 10. Caja = 100.</p>
                    <p>🧴 <strong>Jarabes/Líquidos:</strong> Unidad Base = Frasco (1). Caja = 12.</p>
                    <p>💉 <strong>Ampollas:</strong> Unidad Base = Ampolla (1). Caja = 5.</p>
                  </div>
                  <p className="text-[11px] text-teal-300">
                     Al realizar una venta en el POS, el cajero puede elegir cualquier presentación y el sistema descontará automáticamente el stock exacto en unidades base de tus lotes FEFO.
                  </p>
                </div>
              )}

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

                  {/* Preajustes rápidos de equivalencia */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Ajustes rápidos:</span>
                    <button
                      type="button"
                      onClick={() => set("cantidad_unidad_base", 1)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      💊 Pastilla (x1)
                    </button>
                    <button
                      type="button"
                      onClick={() => set("cantidad_unidad_base", 10)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      📦 Blíster (x10)
                    </button>
                    <button
                      type="button"
                      onClick={() => set("cantidad_unidad_base", 100)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      📦 Caja (x100)
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Cant. Unidades Base que Contiene esta Presentación
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.cantidad_unidad_base}
                      onChange={(e) =>
                        set("cantidad_unidad_base", e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="1"
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 focus:outline-none transition"
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
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono text-right focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Código de barras */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1 flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5" /> Código de Barras
                </label>
                <input
                  type="text"
                  value={form.codigo_barras}
                  onChange={(e) => set("codigo_barras", e.target.value)}
                  placeholder="ej. 7751234567890"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono tracking-wider focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 focus:outline-none transition"
                />
              </div>
            </fieldset>

            {/* ─── Sección: Opciones ────────────────────── */}
            <fieldset className="space-y-3">
              <legend className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                Opciones Farmacéuticas
              </legend>

              <button
                type="button"
                onClick={() => !foundProduct && set("requiere_receta", !form.requiere_receta)}
                disabled={foundProduct}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <span className="text-sm text-slate-700 font-medium">Requiere Receta Médica</span>
                {form.requiere_receta ? (
                  <ToggleRight className={`w-6 h-6 ${foundProduct ? "text-teal-400" : "text-teal-600"}`} />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-300" />
                )}
              </button>

              <button
                type="button"
                onClick={() => !foundProduct && set("afecto_igv", !form.afecto_igv)}
                disabled={foundProduct}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition cursor-pointer"
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
                  Información de Referencia Farmacéutica
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
                </div>
              </div>
            )}
          </form>

          {/* ── Footer ──────────────────────────────────── */}
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Producto"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
