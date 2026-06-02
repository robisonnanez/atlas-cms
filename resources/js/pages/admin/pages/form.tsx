import BlockEditor from '@/editor/block-editor';
import type { AtlasBlock, AtlasLatestPostPreview, AtlasMediaAsset, AtlasMediaDirectory } from '@/types/atlas-content';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

type PageFormProps = {
    page: null | {
        id: number;
        title: string;
        slug: string;
        status: string;
        template: string;
        excerpt: string | null;
        content_json: AtlasBlock[] | null;
        seo_title: string | null;
        seo_description: string | null;
    };
    revisions?: Array<{ id: number; created_at: string | null; author_name: string | null }>;
    editorMedia: { directories: AtlasMediaDirectory[]; assets: AtlasMediaAsset[] };
    latestPostsPreview: AtlasLatestPostPreview[];
};

const statusOptions = [
    { label: 'Borrador', value: 'draft' },
    { label: 'Publicado', value: 'published' },
];

export default function PageForm({ page, revisions = [], editorMedia, latestPostsPreview }: PageFormProps) {
    const form = useForm({
        title: page?.title ?? '',
        slug: page?.slug ?? '',
        status: page?.status ?? 'draft',
        template: page?.template ?? 'page',
        excerpt: page?.excerpt ?? '',
        content_json: page?.content_json ?? [],
        seo_title: page?.seo_title ?? '',
        seo_description: page?.seo_description ?? '',
    });

    return (
        <>
            <Head title={page ? 'Editar página' : 'Crear página'} />

            <form
                className="space-y-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    if (page) {
                        form.put(`/admin/pages/${page.id}`);
                        return;
                    }
                    form.post('/admin/pages');
                }}
            >
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas páginas</p>
                            <h1 className="text-3xl font-semibold text-slate-950">{page ? 'Editar página' : 'Crear página'}</h1>
                            <p className="max-w-2xl text-sm text-slate-600">Construye la estructura, la metadata y el estado de publicación desde un solo espacio editorial.</p>
                        </div>
                        <div className="flex w-full gap-3 lg:w-auto">
                            <Link href="/admin/pages" className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 lg:w-auto">
                                Cancelar
                            </Link>
                            <Button label={page ? 'Actualizar página' : 'Crear página'} icon={page ? 'pi pi-save' : 'pi pi-plus'} type="submit" loading={form.processing} className="w-full rounded-full lg:w-auto" />
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="grid gap-4">
                            <label className="grid gap-2">
                                <span className="text-sm font-medium text-slate-700">Título</span>
                                <InputText value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} placeholder="Sobre Atlas CMS" className="w-full" />
                            </label>
                            <label className="grid gap-2">
                                <span className="text-sm font-medium text-slate-700">Slug</span>
                                <InputText value={form.data.slug} onChange={(event) => form.setData('slug', event.target.value)} placeholder="sobre-atlas" className="w-full" />
                            </label>
                            <label className="grid gap-2">
                                <span className="text-sm font-medium text-slate-700">Extracto</span>
                                <InputTextarea value={form.data.excerpt} onChange={(event) => form.setData('excerpt', event.target.value)} autoResize rows={4} placeholder="Resumen breve para listados y vistas previas." className="w-full" />
                            </label>
                        </div>

                        <BlockEditor value={form.data.content_json} onChange={(blocks) => form.setData('content_json', blocks)} directories={editorMedia.directories} mediaAssets={editorMedia.assets} latestPostsPreview={latestPostsPreview} />
                    </div>

                    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Estado</span>
                            <Dropdown value={form.data.status} options={statusOptions} onChange={(event) => form.setData('status', event.value)} className="w-full" />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Plantilla</span>
                            <InputText value={form.data.template} onChange={(event) => form.setData('template', event.target.value)} placeholder="page" className="w-full" />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Título SEO</span>
                            <InputText value={form.data.seo_title} onChange={(event) => form.setData('seo_title', event.target.value)} placeholder="Atlas CMS" className="w-full" />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Descripción SEO</span>
                            <InputTextarea value={form.data.seo_description} onChange={(event) => form.setData('seo_description', event.target.value)} autoResize rows={4} placeholder="Resumen optimizado para buscadores." className="w-full" />
                        </label>
                        <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="font-medium text-slate-900">Nota de publicación</p>
                            <p>Las páginas publicadas serán visibles en el sitio público tan pronto su slug esté disponible dentro del tema activo.</p>
                        </div>
                        {page && revisions.length > 0 ? (
                            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div>
                                    <p className="font-medium text-slate-900">Revisiones recientes</p>
                                    <p className="text-sm text-slate-600">Restaura una versión anterior si necesitas volver atrás.</p>
                                </div>
                                <div className="space-y-2">
                                    {revisions.map((revision) => (
                                        <button key={revision.id} type="button" onClick={() => router.post(`/admin/pages/${page.id}/revisions/${revision.id}/restore`)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50">
                                            <span className="text-sm font-medium text-slate-900">{revision.created_at ? new Date(revision.created_at).toLocaleString() : 'Revisión guardada'}</span>
                                            <span className="text-xs text-slate-500">{revision.author_name ?? 'Editor Atlas'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                        <div className="space-y-3">
                            <Button label={page ? 'Actualizar página' : 'Crear página'} icon={page ? 'pi pi-save' : 'pi pi-plus'} type="submit" loading={form.processing} className="w-full rounded-full" />
                            <Link href="/admin/pages" className="block w-full rounded-full border border-slate-300 px-5 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-100">
                                Cancelar
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
