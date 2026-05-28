import { Head, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TaxonomiesIndex({
    categories,
    tags,
}: {
    categories: Array<{ id: number; name: string; slug: string; description: string | null }>;
    tags: Array<{ id: number; name: string; slug: string; description: string | null }>;
}) {
    const categoryForm = useForm({ name: '', slug: '', description: '', parent_id: '' });
    const tagForm = useForm({ name: '', slug: '', description: '' });

    return (
        <>
            <Head title="Taxonom?as" />
            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm md:col-span-2">
                        <CardHeader>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas taxonom?as</p>
                            <CardTitle className="text-3xl">Categor?as y etiquetas</CardTitle>
                            <CardDescription>Organiza el contenido del CMS con estructuras reutilizables para p?ginas, posts y futuras extensiones.</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-slate-600">Categor?as</span><span className="text-lg font-semibold text-slate-950">{categories.length}</span></div>
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-slate-600">Etiquetas</span><span className="text-lg font-semibold text-slate-950">{tags.length}</span></div>
                        </CardContent>
                    </Card>
                </section>

                <div className="grid gap-6 xl:grid-cols-2">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>Categor?as</CardTitle>
                            <CardDescription>Crea categor?as editoriales para agrupar p?ginas y entradas relacionadas.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={(event) => {
                                event.preventDefault();
                                categoryForm.post('/admin/categories', { onSuccess: () => categoryForm.reset() });
                            }} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <InputText value={categoryForm.data.name} onChange={(event) => categoryForm.setData('name', event.target.value)} placeholder="Nombre" className="w-full" />
                                <InputText value={categoryForm.data.slug} onChange={(event) => categoryForm.setData('slug', event.target.value)} placeholder="Slug" className="w-full" />
                                <InputTextarea value={categoryForm.data.description} onChange={(event) => categoryForm.setData('description', event.target.value)} placeholder="Descripci?n" rows={4} autoResize className="w-full" />
                                <Button label="Agregar categor?a" icon="pi pi-plus" type="submit" className="w-full rounded-full" />
                            </form>
                            <DataTable value={categories} dataKey="id" paginator rows={8} stripedRows className="rounded-2xl border border-slate-200" emptyMessage="No hay categor?as registradas.">
                                <Column field="name" header="Nombre" sortable />
                                <Column field="slug" header="Slug" sortable />
                                <Column field="description" header="Descripci?n" body={(row: { description: string | null }) => row.description || '-'} />
                            </DataTable>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>Etiquetas</CardTitle>
                            <CardDescription>Usa etiquetas para enriquecer descubrimiento, filtros y SEO editorial.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={(event) => {
                                event.preventDefault();
                                tagForm.post('/admin/tags', { onSuccess: () => tagForm.reset() });
                            }} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <InputText value={tagForm.data.name} onChange={(event) => tagForm.setData('name', event.target.value)} placeholder="Nombre" className="w-full" />
                                <InputText value={tagForm.data.slug} onChange={(event) => tagForm.setData('slug', event.target.value)} placeholder="Slug" className="w-full" />
                                <InputTextarea value={tagForm.data.description} onChange={(event) => tagForm.setData('description', event.target.value)} placeholder="Descripci?n" rows={4} autoResize className="w-full" />
                                <Button label="Agregar etiqueta" icon="pi pi-plus" type="submit" className="w-full rounded-full" />
                            </form>
                            <DataTable value={tags} dataKey="id" paginator rows={8} stripedRows className="rounded-2xl border border-slate-200" emptyMessage="No hay etiquetas registradas.">
                                <Column field="name" header="Nombre" sortable />
                                <Column field="slug" header="Slug" sortable />
                                <Column field="description" header="Descripci?n" body={(row: { description: string | null }) => row.description || '-'} />
                            </DataTable>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
