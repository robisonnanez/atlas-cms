import { Head } from '@inertiajs/react';
import InstallShell from './partials/install-shell';

export default function InstallAdmin({
    steps,
    currentStep,
    system,
}: {
    steps: Array<{ key: string; label: string }>;
    currentStep: string;
    system: { users: number; installed: boolean };
}) {
    return (
        <>
            <Head title="Administrador" />
            <InstallShell
                title="Preparar el administrador"
                description="En el siguiente paso Atlas creara el primer superadministrador y guardara la configuracion esencial del sitio para dejar lista la primera entrada al panel."
                steps={steps}
                currentStep={currentStep}
                backHref="/install/database"
                nextHref="/install/site"
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <h2 className="text-lg font-semibold">Lo que ocurrira</h2>
                        <ul className="mt-4 space-y-3 text-sm text-slate-700">
                            <li>Crear o actualizar la primera cuenta superadministradora.</li>
                            <li>Guardar el nombre del sitio, eslogan y configuracion regional.</li>
                            <li>Marcar Atlas CMS como instalado y redirigir al login.</li>
                        </ul>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-5">
                        <h2 className="text-lg font-semibold">Estado actual</h2>
                        <div className="mt-4 space-y-3 text-sm text-slate-700">
                            <div className="flex items-center justify-between"><span>Usuarios existentes</span><span className="font-medium text-slate-950">{system.users}</span></div>
                            <div className="flex items-center justify-between"><span>Lock de instalacion</span><span className="font-medium text-slate-950">{system.installed ? 'Presente' : 'No existe'}</span></div>
                        </div>
                    </div>
                </div>
            </InstallShell>
        </>
    );
}
