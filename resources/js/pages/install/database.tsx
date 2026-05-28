import { Head } from '@inertiajs/react';
import InstallShell from './partials/install-shell';

export default function InstallDatabase({
    steps,
    currentStep,
    database,
}: {
    steps: Array<{ key: string; label: string }>;
    currentStep: string;
    database: { driver: string; host?: string | null; port?: string | number | null; database?: string | null; connected: boolean; message: string };
}) {
    return (
        <>
            <Head title="Base de datos" />
            <InstallShell
                title="Configuracion de base de datos"
                description="Atlas lee la conexion activa de Laravel desde el entorno y verifica que la base de datos sea alcanzable antes de terminar la instalacion."
                steps={steps}
                currentStep={currentStep}
                backHref="/install/requirements"
                nextHref="/install/admin"
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border p-5">
                        <p className="text-sm text-slate-500">Driver</p>
                        <p className="mt-2 text-lg font-semibold">{database.driver}</p>
                    </div>
                    <div className="rounded-2xl border p-5">
                        <p className="text-sm text-slate-500">Base de datos</p>
                        <p className="mt-2 text-lg font-semibold">{database.database || 'No configurada'}</p>
                    </div>
                    <div className="rounded-2xl border p-5">
                        <p className="text-sm text-slate-500">Host</p>
                        <p className="mt-2 text-lg font-semibold">{database.host || 'No configurado'}</p>
                    </div>
                    <div className="rounded-2xl border p-5">
                        <p className="text-sm text-slate-500">Puerto</p>
                        <p className="mt-2 text-lg font-semibold">{database.port || 'Por defecto'}</p>
                    </div>
                </div>
                <div className={`mt-6 rounded-3xl border px-5 py-4 text-sm ${database.connected ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
                    {database.connected ? 'Conexion establecida.' : 'La conexion requiere atencion.'} {database.message}
                </div>
            </InstallShell>
        </>
    );
}
