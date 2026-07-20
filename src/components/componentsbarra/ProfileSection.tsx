import { Circle } from "lucide-react";

interface ProfileSectionProps {
    session?: { // Lo hacemos opcional para mitigar retrasos de carga asíncrona
        id: string;
        correo: string; // Acoplado al campo real de tu base de datos
        nombre: string; // Unificado según el esquema físico de PostgreSQL
        estado: 'ACTIVO' | 'INACTIVO'; // En sintonía con las restricciones CHECK del DDL
        roles?: { nombre: string } | string | string[]; // Adaptable si usas include de Prisma o string
    };
    isCollapsed: boolean;
}

export default function ProfileSection({ session, isCollapsed }: ProfileSectionProps) {
    const getInitials = (name: string) => {
        if (!name) return "??";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    };

    // Extraemos de forma segura el nombre completo o colocamos un fallback
    const nombreCompleto = session?.nombre || "Usuario POS";

    // Obtenemos el nombre del rol dinámicamente según cómo lo manejes
    let nombreRol = "Vendedor";
    if (session?.roles) {
        if (typeof session.roles === 'object' && 'nombre' in session.roles) {
            nombreRol = session.roles.nombre;
        } else if (Array.isArray(session.roles)) {
            nombreRol = session.roles[0] || "Vendedor";
        } else if (typeof session.roles === 'string') {
            nombreRol = session.roles;
        }
    }

    const isActive = session?.estado === 'ACTIVO';

    return (
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-md">
                {getInitials(nombreCompleto)}
            </div>

            {!isCollapsed && (
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-white truncate">{nombreCompleto}</p>
                    <p className="text-xs text-slate-400 truncate">{nombreRol}</p>

                    <div className="flex items-center gap-1.5 mt-1 bg-slate-800/50 px-2 py-0.5 rounded-md w-fit">
                        <span className="text-[10px] font-bold text-slate-300">
                            {isActive ? "Activo" : "Inactivo"}
                        </span>
                        <Circle
                            size={8}
                            className={`animate-pulse ${isActive
                                ? "fill-emerald-500 text-emerald-500"
                                : "fill-rose-500 text-rose-500"
                                }`}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}