import { Head } from '@inertiajs/react';
import InstallShell from './partials/install-shell';

export default function InstallRequirements({
    steps,
    currentStep,
    requirements,
}: {
    steps: Array<{ key: string; label: string }>;
    currentStep: string;
    requirements: Array<{ label: string; passed: boolean }>;
}) {
    const passed = requirements.filter((item) => item.passed).length;

    return (
        <>
            <Head title="Requisitos" />
            <InstallShell
                title="Requisitos del servidor"
                description="Atlas verifica el runtime, los permisos de escritura y la conectividad de base de datos antes de permitir la creacion del primer acceso administrativo."
                steps={steps}
                currentStep={currentStep}
                backHref="/install"
                nextHref="/install/database"
            >
                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
                        {passed} de {requirements.length} verificaciones superadas.
                    </div>
                    <div className="grid gap-4">
                        {requirements.map((item) => (
                            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <span>{item.label}</span>
                                <span className={item.passed ? 'text-emerald-600' : 'text-amber-600'}>{item.passed ? 'Correcto' : 'Requiere atencion'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </InstallShell>
        </>
    );
}
