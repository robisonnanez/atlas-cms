import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { FileUpload, type FileUploadSelectEvent } from 'primereact/fileupload';
import { Tag } from 'primereact/tag';

type ThemeRecord = {
    id: number;
    name: string;
    slug: string;
    version: string;
    author?: string | null;
    is_active: boolean;
    settings?: {
        description?: string;
        zones?: string[];
        templates?: string[];
        settings_schema?: Array<{ key: string; label: string; type: string }>;
    } | null;
};

type DiscoveredTheme = {
    name: string;
    slug: string;
    version: string;
    author: string;
    description: string;
    zones: string[];
    templates: string[];
    settings_schema: Array<{ key: string; label: string; type: string }>;
};

export default function ThemesIndex({ themes, discovered }: { themes: ThemeRecord[]; discovered: DiscoveredTheme[] }) {
    const installForm = useForm<{ archive: File | null }>({ archive: null });

    return (
        <>
            <Head title="Temas" />
            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm md:col-span-2">
                        <CardHeader>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Temas Atlas</p>
                            <CardTitle className="text-3xl">Gestor de temas</CardTitle>
                            <CardDescription className="text-base leading-7 text-slate-700">
                                Activa la capa pública del sitio, instala temas desde ZIP y mantén sincronizados los manifiestos detectados con el catálogo instalado.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader><CardTitle>Resumen</CardTitle></CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-slate-600">Instalados</span><span className="text-lg font-semibold text-slate-950">{themes.length}</span></div>
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-slate-600">Detectados</span><span className="text-lg font-semibold text-slate-950">{discovered.length}</span></div>
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-slate-600">Activos</span><span className="text-lg font-semibold text-slate-950">{themes.filter((theme) => theme.is_active).length}</span></div>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>Instalar tema</CardTitle>
                            <CardDescription>Sube un archivo ZIP con <code>theme.json</code> para incorporarlo a la galería de temas de Atlas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    installForm.post('/admin/themes/install', { forceFormData: true, onSuccess: () => installForm.reset() });
                                }}
                                className="space-y-4"
                            >
                                <FileUpload
                                    mode="basic"
                                    name="archive"
                                    chooseLabel={installForm.data.archive ? installForm.data.archive.name : 'Seleccionar ZIP'}
                                    auto={false}
                                    customUpload
                                    uploadHandler={() => {}}
                                    onSelect={(event: FileUploadSelectEvent) => installForm.setData('archive', event.files?.[0] ?? null)}
                                />
                                <Button label={installForm.processing ? 'Instalando...' : 'Instalar tema'} icon="pi pi-upload" type="submit" loading={installForm.processing} className="w-full rounded-full" />
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>Manifiestos detectados</CardTitle>
                            <CardDescription>Temas localizados en la carpeta de vistas públicas y listos para sincronizar con Atlas.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            {discovered.map((theme) => (
                                <div key={theme.slug} className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-5 shadow-sm">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <h3 className="font-semibold text-slate-950">{theme.name}</h3>
                                            <Tag value={theme.version} severity="secondary" rounded />
                                        </div>
                                        <p className="text-sm text-slate-500">{theme.slug}</p>
                                        <p className="text-sm text-slate-600">{theme.description}</p>
                                        <div className="grid gap-2 text-sm text-slate-600">
                                            <div className="flex items-center justify-between"><span>Zonas</span><span className="font-medium text-slate-900">{theme.zones.length}</span></div>
                                            <div className="flex items-center justify-between"><span>Plantillas</span><span className="font-medium text-slate-900">{theme.templates.length}</span></div>
                                            <div className="flex items-center justify-between"><span>Campos</span><span className="font-medium text-slate-900">{theme.settings_schema.length}</span></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!discovered.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 md:col-span-2">Todavía no se detectan temas en la carpeta pública.</div> : null}
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-white">Temas instalados</h2>
                        <p className="text-sm text-slate-300">Temas ya registrados en Atlas y listos para activarse.</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {themes.map((theme) => (
                            <Card key={theme.id} className="rounded-3xl border border-slate-200/80 shadow-sm">
                                <CardHeader className="space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <CardTitle>{theme.name}</CardTitle>
                                            <CardDescription>{theme.slug}</CardDescription>
                                        </div>
                                        <Tag value={theme.is_active ? 'Activo' : 'Inactivo'} severity={theme.is_active ? 'success' : 'info'} rounded />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <p className="min-h-12 text-sm leading-6 text-slate-600">{theme.settings?.description || 'Este tema aún no incluye descripción en su manifiesto.'}</p>
                                    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                                        <div className="flex items-center justify-between"><span>Versión</span><span className="font-medium text-slate-900">{theme.version}</span></div>
                                        <div className="flex items-center justify-between"><span>Autor</span><span className="font-medium text-slate-900">{theme.author || 'Autor desconocido'}</span></div>
                                        <div className="flex items-center justify-between"><span>Zonas</span><span className="font-medium text-slate-900">{theme.settings?.zones?.length ?? 0}</span></div>
                                        <div className="flex items-center justify-between"><span>Plantillas</span><span className="font-medium text-slate-900">{theme.settings?.templates?.length ?? 0}</span></div>
                                    </div>
                                    <Button
                                        label={theme.is_active ? 'Tema activo' : 'Activar tema'}
                                        icon={theme.is_active ? 'pi pi-check-circle' : 'pi pi-bolt'}
                                        severity={theme.is_active ? 'success' : 'contrast'}
                                        outlined={theme.is_active}
                                        disabled={theme.is_active}
                                        onClick={() => !theme.is_active && router.post(`/admin/themes/${theme.id}/activate`)}
                                        className="w-full rounded-full"
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
