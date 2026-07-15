
import { Circle } from "lucide-react";

interface ProfileSectionProps {
    session: {
        id: string,
        username: string,
        nombres: string,
        apellidos: string,
        estado: boolean,
        roles: any
    };
    isCollapsed: boolean;
}

export default function ProfileSection({ session, isCollapsed }: ProfileSectionProps) {
    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    };

    return (
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-md">
                {getInitials(session.nombres + " " + session.apellidos)}
            </div>

            {!isCollapsed && (
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-white truncate">{session.nombres + " " + session.apellidos}</p>
                    <p className="text-xs text-slate-400 truncate">{session.roles[0]}</p>

                    <div className="flex items-center gap-1.5 mt-1 bg-slate-800/50 px-2 py-0.5 rounded-md w-fit">
                        <span className="text-[10px] font-bold text-slate-300">{session.estado ? "Activo" : "Inactivo"}</span>
                        <Circle size={8} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                    </div>
                </div>
            )}
        </div>
    );
}