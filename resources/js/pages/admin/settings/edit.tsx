import AtlasForgeEditor from '@/components/atlas-forge-editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

const timezoneOptions = [
    { label: 'America/Bogota', value: 'America/Bogota' },
    { label: 'UTC', value: 'UTC' },
    { label: 'America/New_York', value: 'America/New_York' },
    { label: 'Europe/Madrid', value: 'Europe/Madrid' },
];

const localeOptions = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
];

export default function SettingsEdit({
    settings,
}: {
    settings: {
        identity?: { value?: { name?: string; tagline?: string } };
        seo?: { value?: { title?: string; description?: string } };
        system?: { value?: { timezone?: string; locale?: string; maintenance?: boolean } };
        chrome?: {
            value?: {
                header?: { advanced_html?: string };
                footer?: { advanced_html?: string };
            };
        };
    };
}) {
    const form = useForm({
        site_name: settings.identity?.value?.name ?? 'Atlas CMS',
        site_tagline: settings.identity?.value?.tagline ?? '',
        timezone: settings.system?.value?.timezone ?? 'America/Bogota',
        locale: settings.system?.value?.locale ?? 'es',
        maintenance: settings.system?.value?.maintenance ?? false,
        seo_title: settings.seo?.value?.title ?? '',
        seo_description: settings.seo?.value?.description ?? '',
        header_advanced_html: settings.chrome?.value?.header?.advanced_html ?? '',
        footer_advanced_html: settings.chrome?.value?.footer?.advanced_html ?? '',
    });

    return (
        <>
            <Head title="Configuración" />

            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Centro de control Atlas</p>
                            <h1 className="text-3xl font-semibold text-slate-950">Configuración del sitio</h1>
                            <p className="max-w-2xl text-sm text-slate-600">
                                Ajusta la identidad, el idioma base y edita directamente el HTML real del header y footer públicos.
                            </p>
                        </div>
                        <Button
                            label={form.processing ? 'Guardando...' : 'Guardar configuración'}
                            icon="pi pi-save"
                            type="button"
                            onClick={() => form.put('/admin/settings')}
                            loading={form.processing}
                            className="rounded-full px-6"
                        />
                    </div>
                </section>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.put('/admin/settings');
                    }}
                    className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
                >
                    <div className="space-y-6">
                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>Identidad</CardTitle>
                                <CardDescription>Define el nombre público y el tono general de esta instancia de Atlas.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Nombre del sitio</span>
                                    <InputText value={form.data.site_name} onChange={(event) => form.setData('site_name', event.target.value)} className="w-full" />
                                </label>
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Eslogan</span>
                                    <InputText value={form.data.site_tagline} onChange={(event) => form.setData('site_tagline', event.target.value)} className="w-full" />
                                </label>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>SEO por defecto</CardTitle>
                                <CardDescription>Metadata base para páginas o entradas que no la sobrescriban.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Título SEO</span>
                                    <InputText value={form.data.seo_title} onChange={(event) => form.setData('seo_title', event.target.value)} className="w-full" />
                                </label>
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Descripción SEO</span>
                                    <InputTextarea value={form.data.seo_description} onChange={(event) => form.setData('seo_description', event.target.value)} rows={5} autoResize className="w-full" />
                                </label>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>HTML del header</CardTitle>
                                <CardDescription>
                                    Edita aquí la cabecera pública completa del sitio. Este contenido reemplaza el header base cuando exista.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <AtlasForgeEditor
                                    value={form.data.header_advanced_html}
                                    onChange={(value) => form.setData('header_advanced_html', value)}
                                    placeholder="Construye aquí el header exacto del sitio."
                                    config={{ defaultHeight: 380, stickyToolbar: true, allowHtmlMode: true, allowTables: true, allowMedia: true }}
                                />
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>HTML del footer</CardTitle>
                                <CardDescription>
                                    Edita aquí el pie de página real del sitio. Este contenido reemplaza el footer base cuando exista.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <AtlasForgeEditor
                                    value={form.data.footer_advanced_html}
                                    onChange={(value) => form.setData('footer_advanced_html', value)}
                                    placeholder="Construye aquí el footer exacto del sitio."
                                    config={{ defaultHeight: 380, stickyToolbar: true, allowHtmlMode: true, allowTables: true, allowMedia: true }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>Valores del sistema</CardTitle>
                                <CardDescription>Elige la configuración regional base que Atlas aplicará en el panel y en el sitio público.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Zona horaria</span>
                                    <Dropdown value={form.data.timezone} options={timezoneOptions} onChange={(event) => form.setData('timezone', event.value)} editable className="w-full" />
                                </label>
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Idioma</span>
                                    <Dropdown value={form.data.locale} options={localeOptions} onChange={(event) => form.setData('locale', event.value)} className="w-full" />
                                </label>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>Mantenimiento</CardTitle>
                                <CardDescription>Controla si el sitio público debe permanecer cerrado mientras el equipo sigue configurando contenido o temas.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-slate-900">Modo mantenimiento</p>
                                        <p className="text-sm text-slate-600">Muestra a los visitantes que Atlas todavía se está preparando antes del lanzamiento.</p>
                                    </div>
                                    <InputSwitch checked={form.data.maintenance} onChange={(event) => form.setData('maintenance', Boolean(event.value))} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </>
    );
}
