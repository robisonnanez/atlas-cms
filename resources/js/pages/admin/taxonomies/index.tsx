import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Head, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

export default function TaxonomiesIndex({
    categories,
    tags,
}: {
    categories: Array<{ id: number; name: string; slug: string; description: string | null }>;
    tags: Array<{ id: number; name: string; slug: string; description: string | null }>;
}) {
    const { t } = useAtlasLocale();
    const categoryForm = useForm({ name: '', slug: '', description: '', parent_id: '' });
    const tagForm = useForm({ name: '', slug: '', description: '' });

    return (
        <>
            <Head title={t('Taxonomías', 'Taxonomies')} />
            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm md:col-span-2">
                        <CardHeader>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{t('Atlas taxonomías', 'Atlas taxonomies')}</p>
                            <CardTitle className="text-3xl">{t('Categorías y etiquetas', 'Categories and tags')}</CardTitle>
                            <CardDescription>{t('Organiza el contenido del CMS con estructuras reutilizables para páginas, entradas y futuras extensiones.', 'Organize CMS content with reusable structures for pages, posts and future extensions.')}</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>{t('Resumen', 'Overview')}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-slate-600">{t('Categorías', 'Categories')}</span><span className="text-lg font-semibold text-slate-950">{categories.length}</span></div>
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-slate-600">{t('Etiquetas', 'Tags')}</span><span className="text-lg font-semibold text-slate-950">{tags.length}</span></div>
                        </CardContent>
                    </Card>
                </section>

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>{t('Categorías', 'Categories')}</CardTitle>
                            <CardDescription>{t('Crea categorías editoriales para agrupar páginas y entradas relacionadas.', 'Create editorial categories to group related pages and posts.')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={(event) => {
                                event.preventDefault();
                                categoryForm.post('/admin/categories', { onSuccess: () => categoryForm.reset() });
                            }} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <InputText value={categoryForm.data.name} onChange={(event) => categoryForm.setData('name', event.target.value)} placeholder={t('Nombre', 'Name')} className="w-full" />
                                <InputText value={categoryForm.data.slug} onChange={(event) => categoryForm.setData('slug', event.target.value)} placeholder="Slug" className="w-full" />
                                <InputTextarea value={categoryForm.data.description} onChange={(event) => categoryForm.setData('description', event.target.value)} placeholder={t('Descripción', 'Description')} rows={4} autoResize className="w-full" />
                                <Button label={t('Agregar categoría', 'Add category')} icon="pi pi-plus" type="submit" className="w-full rounded-full" />
                            </form>
                            <DataTable value={categories} dataKey="id" paginator rows={8} stripedRows className="rounded-2xl border border-slate-200" emptyMessage={t('No hay categorías registradas.', 'No categories registered yet.')}>
                                <Column field="name" header={t('Nombre', 'Name')} sortable />
                                <Column field="slug" header="Slug" sortable />
                                <Column field="description" header={t('Descripción', 'Description')} body={(row: { description: string | null }) => row.description || '-'} />
                            </DataTable>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>{t('Etiquetas', 'Tags')}</CardTitle>
                            <CardDescription>{t('Usa etiquetas para enriquecer el descubrimiento, los filtros y el SEO editorial.', 'Use tags to enrich discovery, filters and editorial SEO.')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={(event) => {
                                event.preventDefault();
                                tagForm.post('/admin/tags', { onSuccess: () => tagForm.reset() });
                            }} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <InputText value={tagForm.data.name} onChange={(event) => tagForm.setData('name', event.target.value)} placeholder={t('Nombre', 'Name')} className="w-full" />
                                <InputText value={tagForm.data.slug} onChange={(event) => tagForm.setData('slug', event.target.value)} placeholder="Slug" className="w-full" />
                                <InputTextarea value={tagForm.data.description} onChange={(event) => tagForm.setData('description', event.target.value)} placeholder={t('Descripción', 'Description')} rows={4} autoResize className="w-full" />
                                <Button label={t('Agregar etiqueta', 'Add tag')} icon="pi pi-plus" type="submit" className="w-full rounded-full" />
                            </form>
                            <DataTable value={tags} dataKey="id" paginator rows={8} stripedRows className="rounded-2xl border border-slate-200" emptyMessage={t('No hay etiquetas registradas.', 'No tags registered yet.')}>
                                <Column field="name" header={t('Nombre', 'Name')} sortable />
                                <Column field="slug" header="Slug" sortable />
                                <Column field="description" header={t('Descripción', 'Description')} body={(row: { description: string | null }) => row.description || '-'} />
                            </DataTable>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
