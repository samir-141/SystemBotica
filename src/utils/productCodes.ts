// src/utils/productCodes.ts
// Utilidades puras para generar sugerencias de SKU a partir de datos del producto.

/**
 * Entrada para la generación de SKU.
 */
export interface GenerateSkuInput {
  /** Nombre comercial del producto (puede incluir cantidad y unidad al final). */
  nombreComercial: string;
  /** Nombre del laboratorio / marca (usado como respaldo si no hay palabras distintivas). */
  laboratorioNombre?: string;
  /** Nombre de la categoría (respaldo adicional). */
  categoriaNombre?: string;
  /** Cantidad, concentración o contenido explícito. */
  cantidad?: number | string;
  /** Unidad de medida explícita (ej: ml, mg, g, L). */
  unidadMedida?: string;
}

const GENERIC_WORDS = new Set([
  // Genéricos de productos
  "PRODUCTO",
  "ARTICULO",
  "ITEM",
  // Bebidas / alimentos comunes
  "AGUA",
  "BEBIDA",
  "GASEOSA",
  "REFRESCO",
  "JUGO",
  "NECTAR",
  "LECHE",
  "SNACK",
  "PAPAS",
  "CHICLE",
  "GALLETAS",
  "CHOCOLATE",
  "HARINA",
  "ACEITE",
  "ARROZ",
  "AZUCAR",
  "SAL",
  "PIMIENTA",
  "FIDEO",
  "SOPA",
  "CONSERVA",
  "MERMELADA",
  "MANTEQUILLA",
  "MIEL",
  "YOGUR",
  "QUESO",
  "PAN",
  "EMBUTIDO",
  // Formas farmacéuticas
  "TABLETA",
  "TABLETAS",
  "CAPSULA",
  "CAPSULAS",
  "COMPRIMIDO",
  "COMPRIMIDOS",
  "GRAGEA",
  "GRAGEAS",
  "PASTILLA",
  "PASTILLAS",
  "PILDORA",
  "PILDORAS",
  "JARABE",
  "SOLUCION",
  "SUSPENSION",
  "GOTAS",
  "LIQUIDO",
  "AMPOLLA",
  "AMPOLLAS",
  "INYECTABLE",
  "INYECTABLES",
  "VIAL",
  "VIALES",
  "CREMA",
  "GEL",
  "POMADA",
  "UNGÜENTO",
  "UNGUENTO",
  "TOPICO",
  "NASAL",
  "OFTALMICO",
  "OTICO",
  "COLUTORIO",
  "SPRAY",
  "INHALADOR",
  // Empaques / unidades
  "BOTELLA",
  "BOTELLAS",
  "FRASCO",
  "FRASCOS",
  "CAJA",
  "CAJAS",
  "BLISTER",
  "BLISTER",
  "SOBRE",
  "SOBRES",
  "DISPLAY",
  "PACK",
  "PACKS",
  "PAQUETE",
  "PAQUETES",
  "UNIDAD",
  "UNIDADES",
  "BOLSA",
  "BOLSAS",
  "TUBO",
  "TUBOS",
  "TARRO",
  "TARROS",
  "DOSIS",
  "ENVASE",
]);

const ARTICLES = new Set([
  "DE",
  "DEL",
  "LA",
  "LAS",
  "LOS",
  "EL",
  "EN",
  "CON",
  "POR",
  "PARA",
  "Y",
  "E",
  "O",
  "U",
  "A",
  "AL",
  "UN",
  "UNA",
  "UNOS",
  "UNAS",
  "LO",
  "LES",
  "SE",
  "ES",
  "SON",
  "SIN",
  "CONTRA",
  "ENTRE",
  "SOBRE",
  "HACIA",
  "HASTA",
  "DURANTE",
  "MEDIANTE",
  "SEGUN",
]);

const MEASURE_REGEX =
  /(\d+(?:[.,]\d+)?)\s*(ML|L|MG|G|KG|OZ|LB|UNIDAD|UNID|TAB|CAP|COMP|FRASCO|FRASCOS|BOTELLA|BOTELLAS|CAJA|CAJAS|SOBRE|SOBRES|DISPLAY|PACK|PACKS|PAQUETE|PAQUETES|BOLSA|BOLSAS|TUBO|TUBOS|TARRO|TARROS|DOSIS|ENVASE|TABLETA|TABLETAS|COMPRIMIDO|COMPRIMIDOS|CAPSULA|CAPSULAS|GRAGEA|GRAGEAS|PASTILLA|PASTILLAS|PILDORA|PILDORAS)$/i;

function removeAccents(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Normaliza un texto de producto: mayúsculas, sin tildes, sin símbolos,
 * espacios colapsados y sin espacios extremos.
 */
export function normalizeProductText(value: string): string {
  return removeAccents(value)
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isGenericWord(word: string): boolean {
  return GENERIC_WORDS.has(word) || ARTICLES.has(word);
}

/**
 * Extrae palabras distintivas de un texto normalizado.
 * Si todas son genéricas, devuelve las originales para no quedarse sin salida.
 */
export function extractRelevantWords(text: string): string[] {
  const normalized = normalizeProductText(text);
  const words = normalized.split(" ").filter((word) => word.length > 0);
  const filtered = words.filter((word) => !isGenericWord(word));
  return filtered;
}

function abbreviateUnit(unit: string): string {
  if (unit.startsWith("UNID")) return "UNID";
  if (unit.startsWith("TAB")) return "TAB";
  if (unit.startsWith("CAP")) return "CAP";
  if (unit.startsWith("COMP")) return "COMP";
  if (unit === "BOTELLAS") return "BOT";
  if (unit === "FRASCOS") return "FRAS";
  if (unit === "CAJAS") return "CAJA";
  if (unit === "SOBRES") return "SOBRE";
  if (unit === "PAQUETES") return "PAQ";
  if (unit === "PACKS") return "PACK";
  if (unit === "BOLSAS") return "BOL";
  if (unit === "TUBOS") return "TUB";
  if (unit === "TARROS") return "TAR";
  return unit;
}

function normalizeUnit(unit: string): string {
  const cleaned = normalizeProductText(unit).replace(/\s+/g, "");
  return abbreviateUnit(cleaned);
}

interface ParsedQuantity {
  cantidad: string;
  unidad: string;
  nombreRestante: string;
}

function parseQuantityFromName(rawName: string): ParsedQuantity | null {
  const match = rawName.match(MEASURE_REGEX);
  if (!match || match.index === undefined) return null;

  const cantidad = String(match[1]).replace(/[.,]/g, "");
  const unidad = abbreviateUnit(String(match[2]).toUpperCase());
  const nombreRestante = rawName.slice(0, match.index).trim();
  return { cantidad, unidad, nombreRestante };
}

function formatCantidad(value: number | string): string {
  return String(value).replace(/[.,]/g, "").replace(/^0+(?=\d)/, "");
}

function buildPrefix(words: string[]): string {
  if (words.length === 0) return "";

  const first = words[0];
  if (words.length === 1 || first.length >= 4) {
    return first.slice(0, 3);
  }

  // Primera palabra corta (ej. San): usar iniciales de las palabras siguientes.
  const initials = words.map((word) => word[0]).join("");
  return initials.slice(0, 3);
}

/**
 * Genera una sugerencia de SKU a partir del nombre comercial y datos opcionales.
 * Es una función pura: no muta el input y no depende del estado del sistema.
 *
 * Ejemplos:
 *   generateSkuSuggestion({ nombreComercial: "Agua Cielo 625 ml" }) // "CIE-625ML"
 *   generateSkuSuggestion({ nombreComercial: "Paracetamol 500 mg" }) // "PAR-500MG"
 */
export function generateSkuSuggestion(input: GenerateSkuInput): string {
  const rawName = input.nombreComercial;
  let nameForPrefix = rawName;
  let cantidadPart = "";
  let unitPart = "";

  const hasExplicitQuantity =
    input.cantidad !== undefined &&
    input.cantidad !== "" &&
    input.unidadMedida !== undefined &&
    input.unidadMedida !== "";

  if (hasExplicitQuantity) {
    cantidadPart = formatCantidad(input.cantidad as number | string);
    unitPart = normalizeUnit(input.unidadMedida!);
  } else {
    const parsed = parseQuantityFromName(rawName);
    if (parsed) {
      cantidadPart = parsed.cantidad;
      unitPart = parsed.unidad;
      nameForPrefix = parsed.nombreRestante;
    }
  }

  let words = extractRelevantWords(nameForPrefix);

  // Respaldo: si no quedó nada distintivo, intentar con laboratorio o categoría.
  if (words.length === 0) {
    if (input.laboratorioNombre) {
      words = extractRelevantWords(input.laboratorioNombre);
    } else if (input.categoriaNombre) {
      words = extractRelevantWords(input.categoriaNombre);
    }
  }

  const prefix = buildPrefix(words);
  if (!prefix) return "";

  if (cantidadPart && unitPart) {
    return `${prefix}-${cantidadPart}${unitPart}`;
  }
  return prefix;
}

