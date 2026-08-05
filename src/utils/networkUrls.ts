export interface ReceiptLink {
  url: string;
  externallyShareable: boolean;
  warning: string | null;
}

export interface MobileScannerLink {
  url: string;
  mobileReady: boolean;
  warning: string | null;
}

function runtimeOrigin(): string {
  return typeof window !== "undefined" ? window.location.origin : "";
}

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function withApiPath(value: string): string {
  const cleaned = withoutTrailingSlash(value);
  return /\/api$/i.test(cleaned) ? cleaned : `${cleaned}/api`;
}

/**
 * The deployed frontend talks to `/api` on its own origin by default. An
 * absolute VITE_API_URL remains available for development or split-host setups.
 */
export function resolveApiBaseUrl(configuredUrl = "", origin = runtimeOrigin()): string {
  const configured = configuredUrl.trim();
  if (!configured) return "/api";

  if (/^https?:\/\//i.test(configured)) {
    const parsed = new URL(configured);
    if (origin && new URL(origin).protocol === "https:" && parsed.protocol === "http:") {
      return "/api";
    }
    parsed.pathname = withApiPath(parsed.pathname || "");
    return withoutTrailingSlash(parsed.toString());
  }

  const relative = configured.startsWith("/") ? configured : `/${configured}`;
  return withApiPath(relative);
}

function asSocketHttpUrl(value: string, origin: string): URL {
  const parsed = new URL(value, origin || "http://localhost");
  if (parsed.protocol === "ws:") parsed.protocol = "http:";
  if (parsed.protocol === "wss:") parsed.protocol = "https:";
  return parsed;
}

/**
 * Socket.IO receives an HTTP(S) base. On an HTTPS page we never return an
 * insecure HTTP endpoint, avoiding mixed-content failures on desktop and PWA.
 */
export function resolveSocketBaseUrl(options: {
  configuredSocketUrl?: string;
  configuredApiUrl?: string;
  origin?: string;
} = {}): string {
  const origin = options.origin ?? runtimeOrigin();
  const socketOverride = String(options.configuredSocketUrl || "").trim();
  const apiBase = resolveApiBaseUrl(options.configuredApiUrl || "", origin);
  const candidate = socketOverride || (apiBase.startsWith("http") ? apiBase : origin || apiBase);
  const parsed = asSocketHttpUrl(candidate, origin);

  parsed.pathname = parsed.pathname.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
  parsed.search = "";
  parsed.hash = "";

  if (origin) {
    const page = new URL(origin);
    if (page.protocol === "https:" && parsed.protocol === "http:") {
      return withoutTrailingSlash(page.toString());
    }
  }

  return withoutTrailingSlash(parsed.toString());
}

function isPrivateIpv4(hostname: string): boolean {
  const octets = hostname.split(".").map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }
  const [first, second] = octets;
  return first === 10
    || first === 127
    || (first === 169 && second === 254)
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 168);
}

export function isExternallyShareableUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const localHost = hostname === "localhost"
      || hostname === "::1"
      || hostname.endsWith(".local")
      || !hostname.includes(".")
      || isPrivateIpv4(hostname);
    return parsed.protocol === "https:" && !localHost;
  } catch {
    return false;
  }
}

function isLoopbackHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return normalized === "localhost" || normalized === "::1" || normalized.startsWith("127.");
}

/**
 * Mobile camera access needs a secure context and a host resolvable from the
 * phone. VITE_PUBLIC_APP_URL is the supported override when the POS origin is
 * localhost or the application is published behind a gateway.
 */
export function resolveMobileScannerLink(
  sessionCode: string,
  publicAppUrl = "",
  origin = runtimeOrigin(),
): MobileScannerLink | null {
  const normalizedCode = sessionCode.trim();
  if (!normalizedCode) return null;

  try {
    const base = new URL(publicAppUrl.trim() || origin || "http://localhost");
    const scannerUrl = new URL("/escanner-remoto", base);
    scannerUrl.searchParams.set("session", normalizedCode);

    const loopback = isLoopbackHost(base.hostname);
    const secure = base.protocol === "https:";
    const mobileReady = secure && !loopback;
    const warning = loopback
      ? "El celular no puede abrir localhost. Accede al POS mediante un dominio HTTPS o configura VITE_PUBLIC_APP_URL."
      : !secure
        ? "La cámara del celular requiere HTTPS. Publica el POS con un certificado válido antes de escanear este QR."
        : null;

    return { url: scannerUrl.toString(), mobileReady, warning };
  } catch {
    return null;
  }
}

/**
 * Receipt URLs are rebuilt on the trusted public frontend base. A LAN link is
 * still useful inside the botica, but is explicitly classified as local.
 */
export function resolveReceiptLink(
  receiptUrl?: string | null,
  publicAppUrl = "",
  origin = runtimeOrigin(),
): ReceiptLink | null {
  if (!receiptUrl) return null;

  try {
    const fallbackBase = origin || "http://localhost";
    console.log(fallbackBase)
    const source = new URL(receiptUrl, fallbackBase);
    const configuredPublicBase = publicAppUrl.trim();
    const trustedBase = new URL(configuredPublicBase || fallbackBase);
    const url = new URL(`${source.pathname}${source.search}${source.hash}`, trustedBase).toString();
    const externallyShareable = isExternallyShareableUrl(url);

    return {
      url,
      externallyShareable,
      warning: externallyShareable
        ? null
        : "Este enlace solo es accesible en la red local. Configura VITE_PUBLIC_APP_URL con un dominio HTTPS público antes de enviarlo al cliente.",
    };
  } catch {
    return null;
  }
}

export const apiBaseUrl = resolveApiBaseUrl(import.meta.env.VITE_API_URL);
export const socketBaseUrl = resolveSocketBaseUrl({
  configuredSocketUrl: import.meta.env.VITE_SOCKET_URL,
  configuredApiUrl: import.meta.env.VITE_API_URL,
});
