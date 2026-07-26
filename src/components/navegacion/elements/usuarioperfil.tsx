import { ShieldCheck } from "lucide-react";

interface UsuarioperfilProps {
    isCollapsed: boolean;
    user: any;
    rolUsuario: string;
}

export default function Usuarioperfil({ isCollapsed, user, rolUsuario }: UsuarioperfilProps) {
    const inicial = user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U";

    return (
        <div className={`border-b border-slate-800/80 shrink-0 ${isCollapsed ? "flex justify-center py-3 px-2" : "flex items-center gap-3 px-4 py-3"}`}>
            {/* Avatar inicial */}
            <div
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white font-black flex items-center justify-center shrink-0 text-sm shadow-md"
                title={user?.nombre || "Usuario"}
            >
                {inicial}
            </div>

            {!isCollapsed && (
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-[13px] text-white truncate leading-tight">
                        {user?.nombre || "Usuario POS"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                        <ShieldCheck size={11} className="text-teal-400 shrink-0" />
                        <span className="text-[11px] text-teal-400 font-semibold truncate">{rolUsuario}</span>
                    </div>
                </div>
            )}
        </div>
    );
}