import { Head, router } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ThemeRecord = {
    id: number;
    name: string;
    slug: string;
    version: string;
    is_active: boolean;
};

type DiscoveredTheme = {
    name?: string;
    slug: string;
    version?: string;
    author?: string;
};

export default function ThemesIndex({
    themes,
    discovered,
}: {
    themes: ThemeRecord[];
    discovered: DiscoveredTheme[];
}) {
    return (
        <>
            <Head title="Themes" />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm md:col-span-2">
                        <CardHeader>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas themes</p>
                            <CardTitle className="text-3xl">Theme manager</CardTitle>
                            <CardDescription>
                                Activate the visual shell that powers the public site and keep track of the manifests discovered on disk.
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
                                <span className="text-lg font-semibold text-slate-950">{themes.length}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <span className="text-slate-600">Discovered</span>
                                <span className="text-lg font-semibold text-slate-950">{discovered.length}</span>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950">Installed themes</h2>
                        <p className="text-sm text-slate-600">The themes already registered in Atlas and ready to activate.</p>
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
                                        <Tag value={theme.is_active ? 'Active' : 'Inactive'} severity={theme.is_active ? 'success' : 'info'} rounded />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                                        <div className="flex items-center justify-between">
                                            <span>Version</span>
                                            <span className="font-medium text-slate-900">{theme.version}</span>
                                        </div>
                                    </div>

                                    <Button
                                        label={theme.is_active ? 'Active theme' : 'Activate theme'}
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

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950">Discovered manifests</h2>
                        <p className="text-sm text-slate-600">Themes found in the filesystem, useful for validating the active catalog.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {discovered.map((theme) => (
                            <div key={theme.slug} className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-5 shadow-sm">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="font-semibold text-slate-950">{theme.name ?? theme.slug}</h3>
                                        <Tag value={theme.version ?? 'manifest'} severity="secondary" rounded />
                                    </div>
                                    <p className="text-sm text-slate-500">{theme.slug}</p>
                                    <p className="text-sm text-slate-600">{theme.author ? `Author: ${theme.author}` : 'No author metadata provided.'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
