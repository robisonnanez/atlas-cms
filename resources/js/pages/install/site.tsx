import { Head, useForm } from '@inertiajs/react';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import InstallShell from './partials/install-shell';

export default function InstallSite({
    steps,
    currentStep,
    timezones,
    locales,
}: {
    steps: Array<{ key: string; label: string }>;
    currentStep: string;
    timezones: string[];
    locales: Array<{ label: string; value: string }>;
}) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        site_name: 'Atlas CMS',
        site_tagline: 'Operaciones de contenido modernas',
        site_url: 'http://localhost:8000',
        timezone: 'America/Bogota',
        locale: 'es',
        seo_title: 'Atlas CMS',
        seo_description: 'CMS moderno, modular y escalable para equipos editoriales.',
        mail_from_name: 'Atlas CMS',
        mail_from_address: '',
        maintenance_mode: false,
    });

    return (
        <>
            <Head title="Configuracion del sitio" />
            <InstallShell
                title="Configuracion final de Atlas"
                description="Crea el superadministrador, define la identidad publica del sitio y deja listas las opciones basicas de SEO, correo y mantenimiento."
                steps={steps}
                currentStep={currentStep}
                backHref="/install/admin"
            >
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post('/install/finish');
                    }}
                    className="grid gap-6"
                >
                    <div className="grid gap-6 xl:grid-cols-2">
                        <div className="space-y-4 rounded-3xl border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold">Administrador</h2>
                            <label className="grid gap-2 text-sm"><span>Nombre</span><InputText value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="w-full" /></label>
                            <label className="grid gap-2 text-sm"><span>Correo</span><InputText value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} className="w-full" /></label>
                            <label className="grid gap-2 text-sm"><span>Contrasena</span><InputText type="password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} className="w-full" /></label>
                        </div>

                        <div className="space-y-4 rounded-3xl border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold">Identidad del sitio</h2>
                            <label className="grid gap-2 text-sm"><span>Nombre del sitio</span><InputText value={form.data.site_name} onChange={(event) => form.setData('site_name', event.target.value)} className="w-full" /></label>
                            <label className="grid gap-2 text-sm"><span>Eslogan</span><InputText value={form.data.site_tagline} onChange={(event) => form.setData('site_tagline', event.target.value)} className="w-full" /></label>
                            <label className="grid gap-2 text-sm"><span>URL del sitio</span><InputText value={form.data.site_url} onChange={(event) => form.setData('site_url', event.target.value)} className="w-full" /></label>
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="grid gap-2 text-sm"><span>Zona horaria</span><Dropdown value={form.data.timezone} options={timezones.map((timezone) => ({ label: timezone, value: timezone }))} onChange={(event) => form.setData('timezone', event.value)} className="w-full" /></label>
                                <label className="grid gap-2 text-sm"><span>Idioma</span><Dropdown value={form.data.locale} options={locales} onChange={(event) => form.setData('locale', event.value)} className="w-full" /></label>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <div className="space-y-4 rounded-3xl border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold">SEO inicial</h2>
                            <label className="grid gap-2 text-sm"><span>Titulo SEO por defecto</span><InputText value={form.data.seo_title} onChange={(event) => form.setData('seo_title', event.target.value)} className="w-full" /></label>
                            <label className="grid gap-2 text-sm"><span>Descripcion SEO por defecto</span><InputTextarea value={form.data.seo_description} onChange={(event) => form.setData('seo_description', event.target.value)} rows={4} autoResize className="w-full" /></label>
                        </div>

                        <div className="space-y-4 rounded-3xl border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold">Correo y mantenimiento</h2>
                            <label className="grid gap-2 text-sm"><span>Nombre remitente</span><InputText value={form.data.mail_from_name} onChange={(event) => form.setData('mail_from_name', event.target.value)} className="w-full" /></label>
                            <label className="grid gap-2 text-sm"><span>Correo remitente</span><InputText value={form.data.mail_from_address} onChange={(event) => form.setData('mail_from_address', event.target.value)} className="w-full" /></label>
                            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                                <Checkbox inputId="maintenance_mode" checked={form.data.maintenance_mode} onChange={(event) => form.setData('maintenance_mode', !!event.checked)} />
                                <span>Activar modo mantenimiento al finalizar la instalacion</span>
                            </label>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
                        Atlas creara el primer superadministrador, guardara la identidad publica del sitio y dejara listas las opciones basicas de SEO, correo y mantenimiento.
                    </div>

                    <button className="rounded-full bg-slate-950 px-5 py-3 font-medium text-white" disabled={form.processing}>
                        {form.processing ? 'Finalizando instalacion...' : 'Finalizar instalacion'}
                    </button>
                </form>
            </InstallShell>
        </>
    );
}
