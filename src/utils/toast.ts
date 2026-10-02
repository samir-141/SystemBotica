// src/utils/toast.ts
import { sileo } from "sileo";

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export const toast = {
  success: (title: string, description?: string, options?: Partial<ToastOptions>) =>
    sileo.success({ title, description, ...options }),

  error: (title: string, description?: string, options?: Partial<ToastOptions>) =>
    sileo.error({ title, description, ...options }),

  warning: (title: string, description?: string, options?: Partial<ToastOptions>) =>
    sileo.warning({ title, description, ...options }),

  warn: (title: string, description?: string, options?: Partial<ToastOptions>) =>
    sileo.warning({ title, description, ...options }),

  info: (title: string, description?: string, options?: Partial<ToastOptions>) =>
    sileo.info({ title, description, ...options }),

  action: (opts: Parameters<typeof sileo.action>[0]) =>
    sileo.action(opts),

  promise: sileo.promise,

  dismiss: (id: string) => sileo.dismiss(id),

  clear: () => sileo.clear(),

  /**
   * Método de compatibilidad directa con la sintaxis previa de PrimeReact Toast:
   * toast.show({ severity: "success" | "error" | "warn" | "info", summary: "...", detail: "...", life: 3000 })
   */
  show: ({
    severity = "info",
    summary,
    detail,
    life,
  }: {
    severity?: "success" | "info" | "warn" | "error" | string;
    summary?: string;
    detail?: string;
    life?: number;
  }) => {
    const title = summary || "";
    const description = detail;
    const duration = life;
    switch (severity) {
      case "success":
        return sileo.success({ title, description, duration });
      case "error":
        return sileo.error({ title, description, duration });
      case "warn":
      case "warning":
        return sileo.warning({ title, description, duration });
      case "info":
      default:
        return sileo.info({ title, description, duration });
    }
  },
};

export default toast;
