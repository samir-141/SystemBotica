// Compatibilidad para consumidores existentes. La única conexión global y todas
// las invalidaciones viven ahora en SocketProvider.
import { useSocket } from "../contexts/socket-context";

export function useSocketInvalidation(): boolean {
  return useSocket().isConnected;
}
