import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Head, Link } from '@inertiajs/react';

type DashboardProps = {
    stats: Record<string, number>;
    recentPages: Array<{ id: number; title: string; status: string; updated_at: string }>;
    recentPosts: Array<{ id: number; title: string; status: string; updated_at: string }>;
    system: { php: string; app: string; environment: string };
};

export default function Dashboard({ stats, recentPages, recentPosts, system }: DashboardProps) {
    const { t } = useAtlasLocale();

    return (
        <>
            <Head title={t('Dashboard Atlas', 'Atlas Dashboard')} />
            <div className="space-y-6">
                <section className="rounded-3xl bg-[linear-gradient(135deg,_#0f172a,_#1e3a8a_55%,_#38bdf8)] p-8 text-white shadow-xl">
                    <p className="text-sm uppercase tracking-[0.3em] text-sky-200">Atlas CMS</p>
                    <h1 className="mt-3 text-3xl font-semibold">{t('Un cockpit editorial limpio para páginas, entradas y crecimiento.', 'A clean editorial cockpit for pages, posts and growth.')}</h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-200">
                        {t('Gestiona contenido, temas, multimedia y plugins desde un dashboard modular.', 'Manage content, themes, media and plugins from one modular dashboard.')}
                    </p>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                        [t('Páginas', 'Pages'), stats.pages],
                        [t('Entradas', 'Posts'), stats.posts],
                        [t('Usuarios', 'Users'), stats.users],
                        [t('Media', 'Media'), stats.media],
                    ].map(([label, value]) => (
                        <Card key={String(label)} className="text-slate-100">
                            <CardHeader>
                                <CardDescription className="text-slate-300">{label}</CardDescription>
                                <CardTitle className="text-3xl text-white">{Number(value)}</CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                    <Card className="text-slate-100">
                        <CardHeader>
                            <CardTitle className="text-white">{t('Contenido reciente', 'Recent content')}</CardTitle>
                            <CardDescription className="text-slate-300">{t('Últimas páginas y entradas actualizadas desde el editor de Atlas.', 'Latest pages and articles updated from the Atlas editor.')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-slate-300">{t('Páginas', 'Pages')}</h3>
                                <div className="space-y-3">
                                    {recentPages.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 p-3">
                                            <div>
                                                <p className="font-medium text-white">{item.title}</p>
                                                <p className="text-xs capitalize text-slate-300">{item.status}</p>
                                            </div>
                                            <Link href={`/admin/pages/${item.id}/edit`} className="text-sm text-blue-300">
                                                {t('Editar', 'Edit')}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-slate-300">{t('Entradas', 'Posts')}</h3>
                                <div className="space-y-3">
                                    {recentPosts.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 p-3">
                                            <div>
                                                <p className="font-medium text-white">{item.title}</p>
                                                <p className="text-xs capitalize text-slate-300">{item.status}</p>
                                            </div>
                                            <Link href={`/admin/posts/${item.id}/edit`} className="text-sm text-blue-300">
                                                {t('Editar', 'Edit')}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="text-slate-100">
                        <CardHeader>
                            <CardTitle className="text-white">{t('Estado del sistema', 'System status')}</CardTitle>
                            <CardDescription className="text-slate-300">{t('Resumen rápido del entorno de Atlas.', 'Quick environment snapshot for Atlas.')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between rounded-lg bg-white px-3 py-2 text-slate-800">
                                <span className="font-medium text-slate-500">{t('Aplicación', 'Application')}</span>
                                <span className="font-semibold text-slate-950">{system.app}</span>
                            </div>
                            <div className="flex justify-between rounded-lg bg-white px-3 py-2 text-slate-800">
                                <span className="font-medium text-slate-500">{t('Entorno', 'Environment')}</span>
                                <span className="font-semibold capitalize text-slate-950">{system.environment}</span>
                            </div>
                            <div className="flex justify-between rounded-lg bg-white px-3 py-2 text-slate-800">
                                <span className="font-medium text-slate-500">PHP</span>
                                <span className="font-semibold text-slate-950">{system.php}</span>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
}
