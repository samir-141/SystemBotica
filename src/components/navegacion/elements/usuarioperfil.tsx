import { ShieldCheck } from "lucide-react";

interface UsuarioperfilProps {
    isCollapsed: boolean;
    user: any;
    rolUsuario: string;
}
export default function Usuarioperfil({ isCollapsed, user, rolUsuario }: UsuarioperfilProps) {
    return (
        <div className="p-3 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center shrink-0 text-sm shadow-md">
                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
            </div>

            {!isCollapsed && (
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-white truncate leading-tight">
                        {user?.nombre || "Usuario POS"}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-teal-400 font-semibold mt-0.5">
                        <ShieldCheck size={12} />
                        <span className="truncate">{rolUsuario}</span>
                    </div>
                </div>
            )}
        </div>
    )
}