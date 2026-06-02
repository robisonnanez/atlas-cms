import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Head, router } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';

type PostRecord = { id: number; title: string; slug: string; status: string };

function statusSeverity(status: string): 'success' | 'warning' | 'info' | 'danger' | 'secondary' {
    if (status === 'published') return 'success';
    if (status === 'draft') return 'warning';
    return 'secondary';
}

export default function PostsIndex({ posts }: { posts: PostRecord[] }) {
    const { t } = useAtlasLocale();

    return (
        <>
            <Head title={t('Entradas', 'Posts')} />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm md:col-span-2">
                        <CardHeader>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{t('Atlas entradas', 'Atlas posts')}</p>
                            <CardTitle className="text-3xl">{t('Gestión de entradas', 'Post management')}</CardTitle>
                            <CardDescription>{t('Escribe, revisa y publica entradas editoriales desde una tabla consistente de PrimeReact.', 'Write, review and publish editorial posts from a consistent PrimeReact table surface.')}</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>{t('Resumen', 'Overview')}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <span className="text-slate-600">{t('Entradas', 'Posts')}</span>
                                <span className="text-lg font-semibold text-slate-950">{posts.length}</span>
                            </div>
                            <button type="button" onClick={() => router.visit('/admin/posts/create')} className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white">
                                {t('Nueva entrada', 'New post')}
                            </button>
                        </CardContent>
                    </Card>
                </section>

                <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                    <CardHeader>
                        <CardTitle>{t('Entradas', 'Posts')}</CardTitle>
                        <CardDescription>{t('Mantén visibles el estado de publicación, los slugs y las acciones en una sola tabla.', 'Keep publication status, slugs and actions visible in one datatable.')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable value={posts} dataKey="id" paginator rows={10} stripedRows scrollable scrollHeight="440px" className="rounded-2xl border border-slate-200" emptyMessage={t('Todavía no hay entradas creadas.', 'No posts created yet.')}>
                            <Column field="title" header={t('Título', 'Title')} sortable />
                            <Column field="slug" header="Slug" sortable />
                            <Column header={t('Estado', 'Status')} body={(row: PostRecord) => <Tag value={row.status} severity={statusSeverity(row.status)} rounded />} />
                            <Column header={t('Acciones', 'Actions')} body={(row: PostRecord) => (
                                <div className="flex gap-2">
                                    <Button icon="pi pi-pencil" text rounded onClick={() => router.visit(`/admin/posts/${row.id}/edit`)} />
                                    <Button icon="pi pi-trash" severity="danger" text rounded onClick={() => {
                                        if (window.confirm(t(`¿Eliminar la entrada "${row.title}"?`, `Delete post "${row.title}"?`))) {
                                            router.delete(`/admin/posts/${row.id}`);
                                        }
                                    }} />
                                </div>
                            )} />
                        </DataTable>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
