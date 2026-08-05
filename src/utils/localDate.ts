const ZONA_NEGOCIO = "America/Lima";

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_NEGOCIO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

type PartesFecha = { year: number; month: number; day: number };

function partesFecha(fecha: Date): PartesFecha {
  const values = Object.fromEntries(
    formatter
      .formatToParts(fecha)
      .filter((part) => part.type === "year" || part.type === "month" || part.type === "day")
      .map((part) => [part.type, Number(part.value)]),
  ) as PartesFecha;

  return values;
}

const pad = (value: number) => String(value).padStart(2, "0");

/** Fecha civil YYYY-MM-DD usada por el negocio, independiente del UTC del navegador. */
export function fechaCivil(fecha: Date = new Date()): string {
  const { year, month, day } = partesFecha(fecha);
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Desplaza días de calendario desde la fecha civil de Lima. */
export function fechaCivilMasDias(fecha: Date, dias: number): string {
  const { year, month, day } = partesFecha(fecha);
  const desplazada = new Date(Date.UTC(year, month - 1, day + dias));
  return `${desplazada.getUTCFullYear()}-${pad(desplazada.getUTCMonth() + 1)}-${pad(desplazada.getUTCDate())}`;
}

/** Formatea una fecha string (YYYY-MM-DD o ISO) a formato local DD/MM/YYYY sin alterar la zona horaria */
export function formatearFechaCivil(fechaInput: string | Date | null | undefined): string {
  if (!fechaInput) return "";
  const str = typeof fechaInput === "string" ? fechaInput : fechaInput.toISOString();
  const datePart = str.slice(0, 10);
  const parts = datePart.split("-");
  if (parts.length !== 3) return "";
  const [year, month, day] = parts;
  return `${Number(day)}/${Number(month)}/${year}`;
}

export { ZONA_NEGOCIO };
