import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Head, router } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';

type PageRecord = { id: number; title: string; slug: string; status: string; updated_at: string };

function statusSeverity(status: string): 'success' | 'warning' | 'info' | 'danger' | 'secondary' {
    if (status === 'published') return 'success';
    if (status === 'draft') return 'warning';
    return 'secondary';
}

export default function PagesIndex({ pages }: { pages: PageRecord[] }) {
    const { t } = useAtlasLocale();

    return (
        <>
            <Head title={t('Páginas', 'Pages')} />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm md:col-span-2">
                        <CardHeader>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{t('Atlas páginas', 'Atlas pages')}</p>
                            <CardTitle className="text-3xl">{t('Gestión de páginas', 'Page management')}</CardTitle>
                            <CardDescription>{t('Crea, actualiza y publica las páginas públicas que dan forma a la experiencia web de Atlas.', 'Create, update and publish the public pages that shape the Atlas website experience.')}</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>{t('Resumen', 'Overview')}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <span className="text-slate-600">{t('Páginas', 'Pages')}</span>
                                <span className="text-lg font-semibold text-slate-950">{pages.length}</span>
                            </div>
                            <button type="button" onClick={() => router.visit('/admin/pages/create')} className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white">
                                {t('Nueva página', 'New page')}
                            </button>
                        </CardContent>
                    </Card>
                </section>

                <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                    <CardHeader>
                        <CardTitle>{t('Páginas', 'Pages')}</CardTitle>
                        <CardDescription>{t('Todas las páginas se gestionan desde una tabla consistente de PrimeReact.', 'All page entries are managed from a consistent PrimeReact table surface.')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable value={pages} dataKey="id" paginator rows={10} stripedRows scrollable scrollHeight="440px" className="rounded-2xl border border-slate-200" emptyMessage={t('Todavía no hay páginas creadas.', 'No pages created yet.')}>
                            <Column field="title" header={t('Título', 'Title')} sortable />
                            <Column field="slug" header="Slug" sortable />
                            <Column header={t('Estado', 'Status')} body={(row: PageRecord) => <Tag value={row.status} severity={statusSeverity(row.status)} rounded />} />
                            <Column field="updated_at" header={t('Actualizado', 'Updated')} body={(row: PageRecord) => row.updated_at ? row.updated_at.slice(0, 10) : '-'} sortable />
                            <Column header={t('Acciones', 'Actions')} body={(row: PageRecord) => (
                                <div className="flex gap-2">
                                    <Button icon="pi pi-pencil" text rounded onClick={() => router.visit(`/admin/pages/${row.id}/edit`)} />
                                    <Button icon="pi pi-trash" severity="danger" text rounded onClick={() => {
                                        if (window.confirm(t(`¿Eliminar la página "${row.title}"?`, `Delete page "${row.title}"?`))) {
                                            router.delete(`/admin/pages/${row.id}`);
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
