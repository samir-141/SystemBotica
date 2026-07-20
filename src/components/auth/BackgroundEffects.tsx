// src/components/auth/BackgroundEffects.tsx


const BackgroundEffects = () => {
    return (
        <>
            {/* Fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

            {/* Blob 1 */}
            <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />

            {/* Blob 2 */}
            <div className="absolute top-1/2 -translate-y-1/2 right-0 h-[450px] w-[450px] rounded-full bg-blue-600/20 blur-3xl animate-pulse" />

            {/* Blob 3 */}
            <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />

            {/* Grid */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right,#ffffff 1px,transparent 1px),
                        linear-gradient(to bottom,#ffffff 1px,transparent 1px)
                    `,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Glow superior */}
            <div className="absolute top-0 left-0 h-40 w-full bg-gradient-to-b from-cyan-400/10 to-transparent" />

            {/* Glow inferior */}
            <div className="absolute bottom-0 w-full h-52 bg-gradient-to-t from-blue-500/10 to-transparent" />
        </>
    );
};

export default BackgroundEffects;