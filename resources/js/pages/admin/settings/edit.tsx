import { Head, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const timezoneOptions = [
    { label: 'UTC', value: 'UTC' },
    { label: 'America/Bogota', value: 'America/Bogota' },
    { label: 'America/New_York', value: 'America/New_York' },
    { label: 'Europe/Madrid', value: 'Europe/Madrid' },
];

const localeOptions = [
    { label: 'Ingles', value: 'en' },
    { label: 'Espanol', value: 'es' },
    { label: 'Portugues', value: 'pt-BR' },
];

export default function SettingsEdit({ settings }: { settings: { identity?: { value?: { name?: string; tagline?: string } }; seo?: { value?: { title?: string; description?: string } }; system?: { value?: { timezone?: string; locale?: string; maintenance?: boolean } }; chrome?: { value?: { header?: { notice_label?: string; notice_text?: string; cta_label?: string; cta_url?: string }; footer?: { intro_title?: string; intro_body?: string; columns?: Array<{ title?: string; body?: string }>; bottom_text?: string } } } } }) {
    const footerColumns = settings.chrome?.value?.footer?.columns ?? [];
    const form = useForm({
        site_name: settings.identity?.value?.name ?? 'Atlas CMS',
        site_tagline: settings.identity?.value?.tagline ?? '',
        timezone: settings.system?.value?.timezone ?? 'UTC',
        locale: settings.system?.value?.locale ?? 'en',
        maintenance: settings.system?.value?.maintenance ?? false,
        seo_title: settings.seo?.value?.title ?? '',
        seo_description: settings.seo?.value?.description ?? '',
        header_notice_label: settings.chrome?.value?.header?.notice_label ?? '',
        header_notice_text: settings.chrome?.value?.header?.notice_text ?? '',
        header_cta_label: settings.chrome?.value?.header?.cta_label ?? '',
        header_cta_url: settings.chrome?.value?.header?.cta_url ?? '',
        footer_intro_title: settings.chrome?.value?.footer?.intro_title ?? '',
        footer_intro_body: settings.chrome?.value?.footer?.intro_body ?? '',
        footer_col_1_title: footerColumns[0]?.title ?? '',
        footer_col_1_body: footerColumns[0]?.body ?? '',
        footer_col_2_title: footerColumns[1]?.title ?? '',
        footer_col_2_body: footerColumns[1]?.body ?? '',
        footer_col_3_title: footerColumns[2]?.title ?? '',
        footer_col_3_body: footerColumns[2]?.body ?? '',
        footer_bottom_text: settings.chrome?.value?.footer?.bottom_text ?? '',
    });

    return (
        <>
            <Head title="Configuracion" />
            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas control center</p>
                            <h1 className="text-3xl font-semibold text-slate-950">Configuracion del sitio</h1>
                            <p className="max-w-2xl text-sm text-slate-600">Mant?n alineados el branding, la configuraci?n regional y los bloques p?blicos estructurados del header y footer antes de abrir Atlas al equipo editorial.</p>
                        </div>
                        <Button label={form.processing ? 'Guardando...' : 'Guardar configuracion'} icon="pi pi-save" type="button" onClick={() => form.put('/admin/settings')} loading={form.processing} className="rounded-full px-6" />
                    </div>
                </section>

                <form onSubmit={(event) => { event.preventDefault(); form.put('/admin/settings'); }} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader><CardTitle>Identidad</CardTitle><CardDescription>Define el nombre publico y el tono general de esta instancia de Atlas.</CardDescription></CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Nombre del sitio</span><InputText value={form.data.site_name} onChange={(event) => form.setData('site_name', event.target.value)} className="w-full" /></label>
                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Eslogan</span><InputText value={form.data.site_tagline} onChange={(event) => form.setData('site_tagline', event.target.value)} className="w-full" /></label>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader><CardTitle>SEO por defecto</CardTitle><CardDescription>Configura la metadata que Atlas usar? cuando una p?gina o post no la sobrescriba.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Titulo SEO</span><InputText value={form.data.seo_title} onChange={(event) => form.setData('seo_title', event.target.value)} className="w-full" /></label>
                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Descripcion SEO</span><InputTextarea value={form.data.seo_description} onChange={(event) => form.setData('seo_description', event.target.value)} rows={5} autoResize className="w-full" /></label>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader><CardTitle>Header estructurado</CardTitle><CardDescription>Configura una franja superior con aviso, texto y llamada a la acci?n sin escribir HTML.</CardDescription></CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Etiqueta del aviso</span><InputText value={form.data.header_notice_label} onChange={(event) => form.setData('header_notice_label', event.target.value)} placeholder="Comunidad" className="w-full" /></label>
                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Texto del aviso</span><InputText value={form.data.header_notice_text} onChange={(event) => form.setData('header_notice_text', event.target.value)} placeholder="Inscripciones abiertas hasta el 30 de junio." className="w-full" /></label>
                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Texto del bot?n</span><InputText value={form.data.header_cta_label} onChange={(event) => form.setData('header_cta_label', event.target.value)} placeholder="Ver convocatoria" className="w-full" /></label>
                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">URL del bot?n</span><InputText value={form.data.header_cta_url} onChange={(event) => form.setData('header_cta_url', event.target.value)} placeholder="/convocatorias" className="w-full" /></label>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader><CardTitle>Footer por columnas</CardTitle><CardDescription>Define introducci?n, tres columnas editables y una l?nea final para el pie p?blico.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Titulo introductorio</span><InputText value={form.data.footer_intro_title} onChange={(event) => form.setData('footer_intro_title', event.target.value)} placeholder="Institucion Educativa Atlas" className="w-full" /></label>
                                    <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium text-slate-700">Texto introductorio</span><InputTextarea value={form.data.footer_intro_body} onChange={(event) => form.setData('footer_intro_body', event.target.value)} rows={3} autoResize placeholder="Presentaci?n breve del sitio o de la instituci?n." className="w-full" /></label>
                                </div>
                                {[1, 2, 3].map((column) => (
                                    <div key={column} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-sm font-semibold text-slate-900">Columna {column}</p>
                                        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Titulo</span><InputText value={form.data[`footer_col_${column}_title` as keyof typeof form.data] as string} onChange={(event) => form.setData(`footer_col_${column}_title` as keyof typeof form.data, event.target.value)} className="w-full" /></label>
                                        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Contenido</span><InputTextarea value={form.data[`footer_col_${column}_body` as keyof typeof form.data] as string} onChange={(event) => form.setData(`footer_col_${column}_body` as keyof typeof form.data, event.target.value)} rows={4} autoResize placeholder={column === 1 ? 'Direcci?n\nTel?fono\nCorreo' : 'L?nea 1\nL?nea 2\nL?nea 3'} className="w-full" /></label>
                                    </div>
                                ))}
                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Texto inferior</span><InputText value={form.data.footer_bottom_text} onChange={(event) => form.setData('footer_bottom_text', event.target.value)} placeholder="Contenido, men?s y publicaciones administradas desde Atlas CMS." className="w-full" /></label>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader><CardTitle>Valores del sistema</CardTitle><CardDescription>Elige la configuraci?n regional base que Atlas aplicar? en el panel y en el sitio p?blico.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Zona horaria</span><Dropdown value={form.data.timezone} options={timezoneOptions} onChange={(event) => form.setData('timezone', event.value)} editable className="w-full" /></label>
                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Idioma</span><Dropdown value={form.data.locale} options={localeOptions} onChange={(event) => form.setData('locale', event.value)} editable className="w-full" /></label>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader><CardTitle>Mantenimiento</CardTitle><CardDescription>Controla si el sitio p?blico debe permanecer cerrado mientras el equipo sigue configurando contenido o temas.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"><div className="space-y-1"><p className="text-sm font-medium text-slate-900">Modo mantenimiento</p><p className="text-sm text-slate-600">Muestra a los visitantes que Atlas a?n se est? preparando antes del lanzamiento.</p></div><InputSwitch checked={form.data.maintenance} onChange={(event) => form.setData('maintenance', Boolean(event.value))} /></div>
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4"><p className="text-sm font-medium text-slate-900">Configuracion actual</p><div className="mt-3 grid gap-2 text-sm text-slate-600"><div className="flex items-center justify-between"><span>Sitio</span><span className="font-medium text-slate-900">{form.data.site_name || 'Atlas CMS'}</span></div><div className="flex items-center justify-between"><span>Idioma</span><span className="font-medium text-slate-900">{form.data.locale || 'en'}</span></div><div className="flex items-center justify-between"><span>Zona horaria</span><span className="font-medium text-slate-900">{form.data.timezone || 'UTC'}</span></div></div></div>
                            </CardContent>
                        </Card>

                        <Button label={form.processing ? 'Guardando...' : 'Guardar configuracion'} icon="pi pi-save" type="submit" loading={form.processing} className="w-full rounded-full" />
                    </div>
                </form>
            </div>
        </>
    );
}
