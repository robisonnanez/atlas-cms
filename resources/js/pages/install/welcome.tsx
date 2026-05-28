import { Head } from '@inertiajs/react';
import InstallShell from './partials/install-shell';

export default function InstallWelcome({
    steps,
    currentStep,
    requirements,
    system,
}: {
    steps: Array<{ key: string; label: string }>;
    currentStep: string;
    requirements: Array<{ label: string; passed: boolean }>;
    system: { php: string; app_env: string; app_url: string };
}) {
    return (
        <>
            <Head title="Instalar Atlas CMS" />
            <InstallShell
                title="Bienvenido a Atlas CMS"
                description="Este asistente verifica el entorno, valida la conexion a la base de datos y deja creado el primer superadministrador para arrancar el proyecto con una base segura."
                steps={steps}
                currentStep={currentStep}
                nextHref="/install/requirements"
                nextLabel="Comenzar instalacion"
            >
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Resumen inicial</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {requirements.slice(0, 4).map((item) => (
                                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-slate-700">{item.label}</span>
                                        <span className={item.passed ? 'text-emerald-600' : 'text-amber-600'}>{item.passed ? 'Listo' : 'Revisar'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Entorno</h3>
                        <div className="mt-4 space-y-3 text-sm text-slate-700">
                            <div className="flex items-center justify-between"><span>PHP</span><span className="font-medium text-slate-950">{system.php}</span></div>
                            <div className="flex items-center justify-between"><span>Entorno</span><span className="font-medium text-slate-950">{system.app_env}</span></div>
                            <div className="flex items-center justify-between"><span>App URL</span><span className="font-medium text-slate-950">{system.app_url}</span></div>
                        </div>
                    </div>
                </div>
            </InstallShell>
        </>
    );
}
