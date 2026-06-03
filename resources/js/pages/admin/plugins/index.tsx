import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { FileUpload, type FileUploadSelectEvent } from 'primereact/fileupload';
import { Tag } from 'primereact/tag';

type PluginRecord = {
    id: number;
    name: string;
    slug: string;
    version?: string;
    description: string | null;
    provider?: string | null;
    is_active: boolean;
    settings?: {
        author?: string;
        requires?: string[];
        hooks?: string[];
        settings_schema?: Array<{ key: string; label: string; type: string }>;
    } | null;
};

type DiscoveredPlugin = {
    name: string;
    slug: string;
    version: string;
    description: string;
    provider?: string | null;
    author: string;
    requires: string[];
    hooks: string[];
    settings_schema: Array<{ key: string; label: string; type: string }>;
};

export default function PluginsIndex({ plugins, discovered }: { plugins: PluginRecord[]; discovered: DiscoveredPlugin[] }) {
    const installForm = useForm<{ archive: File | null }>({ archive: null });

    return (
        <>
            <Head title="Plugins" />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm md:col-span-2">
                        <CardHeader>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Extensiones Atlas</p>
                            <CardTitle className="text-3xl">Gestor de plugins</CardTitle>
                            <CardDescription>
                                Activa capacidades una por una, instala plugins desde un ZIP y mantén sincronizado el registro interno con los manifiestos detectados.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader><CardTitle>Resumen</CardTitle></CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-slate-600">Instalados</span><span className="text-lg font-semibold text-slate-950">{plugins.length}</span></div>
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-slate-600">Activos</span><span className="text-lg font-semibold text-slate-950">{plugins.filter((plugin) => plugin.is_active).length}</span></div>
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-slate-600">Detectados</span><span className="text-lg font-semibold text-slate-950">{discovered.length}</span></div>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>Instalar plugin</CardTitle>
                            <CardDescription>Sube un archivo ZIP que contenga el manifiesto <code>plugin.json</code> para instalarlo en Atlas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    installForm.post('/admin/plugins/install', { forceFormData: true, onSuccess: () => installForm.reset() });
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
                                <Button label={installForm.processing ? 'Instalando...' : 'Instalar plugin'} icon="pi pi-upload" type="submit" loading={installForm.processing} className="w-full rounded-full" />
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>Manifiestos detectados</CardTitle>
                            <CardDescription>Plugins presentes en la carpeta de extensiones que Atlas detectó al sincronizar.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            {discovered.map((plugin) => (
                                <div key={plugin.slug} className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-5 shadow-sm">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <h3 className="font-semibold text-slate-950">{plugin.name}</h3>
                                            <Tag value={plugin.version} severity="secondary" rounded />
                                        </div>
                                        <p className="text-sm text-slate-500">{plugin.slug}</p>
                                        <p className="text-sm text-slate-600">{plugin.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {plugin.hooks.map((hook) => <Tag key={hook} value={hook} severity="info" rounded />)}
                                        </div>
                                        <p className="text-sm text-slate-600">{plugin.settings_schema.length} campos configurables y {plugin.requires.length} dependencias declaradas.</p>
                                    </div>
                                </div>
                            ))}
                            {!discovered.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 md:col-span-2">Todavía no se detectan plugins en la carpeta de extensiones.</div> : null}
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950">Plugins instalados</h2>
                        <p className="text-sm text-slate-600">Extensiones registradas en la base de datos de Atlas y listas para activarse.</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {plugins.map((plugin) => (
                            <Card key={plugin.id} className="rounded-3xl border border-slate-200/80 shadow-sm">
                                <CardHeader className="space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <CardTitle>{plugin.name}</CardTitle>
                                            <CardDescription>{plugin.slug}</CardDescription>
                                        </div>
                                        <Tag value={plugin.is_active ? 'Activo' : 'Inactivo'} severity={plugin.is_active ? 'success' : 'warning'} rounded />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <p className="min-h-12 text-sm leading-6 text-slate-600">{plugin.description || 'Este plugin aún no incluye descripción en su manifiesto.'}</p>
                                    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                                        <div className="flex items-center justify-between"><span>Versión</span><span className="font-medium text-slate-900">{plugin.version || 'Desconocida'}</span></div>
                                        <div className="flex items-center justify-between"><span>Autor</span><span className="font-medium text-slate-900">{plugin.settings?.author || 'Autor desconocido'}</span></div>
                                        <div className="flex items-center justify-between"><span>Hooks</span><span className="font-medium text-slate-900">{plugin.settings?.hooks?.length ?? 0}</span></div>
                                        <div className="flex items-center justify-between"><span>Campos de ajuste</span><span className="font-medium text-slate-900">{plugin.settings?.settings_schema?.length ?? 0}</span></div>
                                    </div>
                                    <div className="grid gap-3">
                                        {plugin.slug === 'atlas-oauth-connect' ? (
                                            <Button
                                                label="Configurar OAuth"
                                                icon="pi pi-cog"
                                                severity="info"
                                                onClick={() => router.visit('/admin/plugins/atlas-oauth-connect')}
                                                className="w-full rounded-full"
                                            />
                                        ) : null}
                                        <Button
                                            label={plugin.is_active ? 'Desactivar' : 'Activar'}
                                            icon={plugin.is_active ? 'pi pi-pause-circle' : 'pi pi-play-circle'}
                                            severity={plugin.is_active ? 'secondary' : 'contrast'}
                                            onClick={() => router.post(`/admin/plugins/${plugin.id}/toggle`)}
                                            className="w-full rounded-full"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
