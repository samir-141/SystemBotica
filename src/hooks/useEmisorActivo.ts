// src/hooks/useEmisorActivo.ts
import { useEffect, useMemo, useContext } from "react";
import { useEmisorStore } from "../store/emisorStore";
import { AuthContext } from "../contexts/auth-context";

export function useEmisorActivo() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const {
    perfiles,
    emisorActivoId,
    cargando,
    error,
    cargarPerfiles,
    setEmisorActivoId,
  } = useEmisorStore();

  useEffect(() => {
    cargarPerfiles();
  }, [cargarPerfiles]);

  const emisorActivo = useMemo(() => {
    if (!perfiles.length) return null;
    return perfiles.find((p) => p.id === emisorActivoId) || perfiles[0] || null;
  }, [perfiles, emisorActivoId]);

  const rolUpper = (user?.rol || "").toUpperCase();
  const puedeCambiarEmisor =
    rolUpper === "ADMIN" ||
    rolUpper === "ADMINISTRADOR" ||
    rolUpper === "SUPERVISOR" ||
    rolUpper === "SUPER_ADMIN";

  const regimenUpper = (emisorActivo?.regimen_tributario || "").toUpperCase();
  const esNuevoRus = regimenUpper === "NRUS" || regimenUpper === "NUEVO_RUS";
  const permiteFactura = emisorActivo ? !esNuevoRus : true;

  return {
    emisorActivo,
    perfiles,
    cargando,
    error,
    recargarPerfiles: () => cargarPerfiles(true),
    cambiarEmisor: setEmisorActivoId,
    puedeCambiarEmisor,
    esNuevoRus,
    permiteFactura,
  };
}
