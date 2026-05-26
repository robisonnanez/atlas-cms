import { Head, router } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PluginRecord = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
};

type DiscoveredPlugin = {
    name?: string;
    slug: string;
    version?: string;
    description?: string;
};

export default function PluginsIndex({
    plugins,
    discovered,
}: {
    plugins: PluginRecord[];
    discovered: DiscoveredPlugin[];
}) {
    return (
        <>
            <Head title="Plugins" />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm md:col-span-2">
                        <CardHeader>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas extensions</p>
                            <CardTitle className="text-3xl">Plugin manager</CardTitle>
                            <CardDescription>
                                Enable capabilities one module at a time and compare the installed registry against the manifests discovered on disk.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <span className="text-slate-600">Installed</span>
                                <span className="text-lg font-semibold text-slate-950">{plugins.length}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <span className="text-slate-600">Active</span>
                                <span className="text-lg font-semibold text-slate-950">{plugins.filter((plugin) => plugin.is_active).length}</span>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950">Installed plugins</h2>
                        <p className="text-sm text-slate-600">Core and custom extensions already registered in the Atlas database.</p>
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
                                        <Tag value={plugin.is_active ? 'Active' : 'Inactive'} severity={plugin.is_active ? 'success' : 'warning'} rounded />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <p className="min-h-12 text-sm leading-6 text-slate-600">
                                        {plugin.description || 'No description provided in the plugin manifest yet.'}
                                    </p>

                                    <Button
                                        label={plugin.is_active ? 'Deactivate' : 'Activate'}
                                        icon={plugin.is_active ? 'pi pi-pause-circle' : 'pi pi-play-circle'}
                                        severity={plugin.is_active ? 'secondary' : 'contrast'}
                                        onClick={() => router.post(`/admin/plugins/${plugin.id}/toggle`)}
                                        className="w-full rounded-full"
                                    />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950">Discovered manifests</h2>
                        <p className="text-sm text-slate-600">Manifests available in the plugin path, ready to cross-check against the installed registry.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {discovered.map((plugin) => (
                            <div key={plugin.slug} className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-5 shadow-sm">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="font-semibold text-slate-950">{plugin.name ?? plugin.slug}</h3>
                                        <Tag value={plugin.version ?? 'manifest'} severity="secondary" rounded />
                                    </div>
                                    <p className="text-sm text-slate-500">{plugin.slug}</p>
                                    <p className="text-sm text-slate-600">{plugin.description || 'No description included in the manifest.'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
