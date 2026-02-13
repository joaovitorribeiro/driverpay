export default function AuthShell({ children }) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#070B12] text-slate-100">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-44 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-500/8 blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#070B12] via-[#070B12] to-black" />
            </div>

            <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pt-10 pb-12 sm:justify-center sm:py-16">
                {children}
            </div>
        </div>
    );
}
