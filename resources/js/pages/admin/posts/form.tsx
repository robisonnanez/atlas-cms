import BlockEditor from '@/editor/block-editor';
import type { AtlasBlock, AtlasLatestPostPreview, AtlasMediaAsset, AtlasMediaDirectory } from '@/types/atlas-content';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

type Option = { id: number; name: string };

export default function PostForm({
    post,
    categories,
    tags,
    revisions = [],
    editorMedia,
    latestPostsPreview,
}: {
    post: null | {
        id: number;
        title: string;
        slug: string;
        status: string;
        excerpt: string | null;
        content_json: AtlasBlock[] | null;
        seo_title: string | null;
        seo_description: string | null;
        primary_category_id: number | null;
        categories?: Array<{ id: number }>;
        tags?: Array<{ id: number }>;
    };
    categories: Option[];
    tags: Option[];
    revisions?: Array<{ id: number; created_at: string | null; author_name: string | null }>;
    editorMedia: { directories: AtlasMediaDirectory[]; assets: AtlasMediaAsset[] };
    latestPostsPreview: AtlasLatestPostPreview[];
}) {
    const form = useForm({
        title: post?.title ?? '',
        slug: post?.slug ?? '',
        status: post?.status ?? 'draft',
        excerpt: post?.excerpt ?? '',
        content_json: post?.content_json ?? [],
        seo_title: post?.seo_title ?? '',
        seo_description: post?.seo_description ?? '',
        primary_category_id: post?.primary_category_id ?? '',
        category_ids: post?.categories?.map((category) => category.id) ?? [],
        tag_ids: post?.tags?.map((tag) => tag.id) ?? [],
    });

    return (
        <>
            <Head title={post ? 'Editar entrada' : 'Crear entrada'} />

            <form
                className="space-y-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    if (post) {
                        form.put(`/admin/posts/${post.id}`);
                        return;
                    }
                    form.post('/admin/posts');
                }}
            >
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas entradas</p>
                            <h1 className="text-3xl font-semibold text-slate-950">{post ? 'Editar entrada' : 'Crear entrada'}</h1>
                            <p className="max-w-2xl text-sm text-slate-600">
                                Redacta art?culos, clasif?calos y prepara la metadata de b?squeda desde una sola superficie editorial.
                            </p>
                        </div>
                        <div className="flex w-full gap-3 lg:w-auto">
                            <Link href="/admin/posts" className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 lg:w-auto">
                                Cancelar
                            </Link>
                            <Button label={post ? 'Actualizar entrada' : 'Crear entrada'} icon={post ? 'pi pi-save' : 'pi pi-plus'} type="submit" loading={form.processing} className="w-full rounded-full lg:w-auto" />
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">T?tulo</span>
                            <InputText value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} placeholder="Resumen del lanzamiento de Atlas" className="w-full" />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Slug</span>
                            <InputText value={form.data.slug} onChange={(event) => form.setData('slug', event.target.value)} placeholder="resumen-lanzamiento-atlas" className="w-full" />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Extracto</span>
                            <InputTextarea value={form.data.excerpt} onChange={(event) => form.setData('excerpt', event.target.value)} rows={4} autoResize placeholder="Texto breve para listados y vistas previas." className="w-full" />
                        </label>
                        <BlockEditor value={form.data.content_json} onChange={(blocks) => form.setData('content_json', blocks)} directories={editorMedia.directories} mediaAssets={editorMedia.assets} latestPostsPreview={latestPostsPreview} />
                    </div>

                    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Estado</span>
                            <Dropdown value={form.data.status} options={[{ label: 'Borrador', value: 'draft' }, { label: 'Publicado', value: 'published' }]} onChange={(event) => form.setData('status', event.value)} className="w-full" />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Categor?a principal</span>
                            <Dropdown value={form.data.primary_category_id} options={categories.map((category) => ({ label: category.name, value: category.id }))} onChange={(event) => form.setData('primary_category_id', event.value ?? '')} placeholder="Selecciona una categor?a principal" showClear className="w-full" />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Categorías</span>
                            <MultiSelect value={form.data.category_ids} options={categories.map((category) => ({ label: category.name, value: category.id }))} onChange={(event) => form.setData('category_ids', event.value)} placeholder="Elige categor?as" display="chip" className="w-full" />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Etiquetas</span>
                            <MultiSelect value={form.data.tag_ids} options={tags.map((tag) => ({ label: tag.name, value: tag.id }))} onChange={(event) => form.setData('tag_ids', event.value)} placeholder="Elige etiquetas" display="chip" className="w-full" />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">T?tulo SEO</span>
                            <InputText value={form.data.seo_title} onChange={(event) => form.setData('seo_title', event.target.value)} placeholder="Resumen del lanzamiento de Atlas" className="w-full" />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Descripci?n SEO</span>
                            <InputTextarea value={form.data.seo_description} onChange={(event) => form.setData('seo_description', event.target.value)} rows={4} autoResize placeholder="Resumen optimizado para buscadores." className="w-full" />
                        </label>
                        <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="font-medium text-slate-900">Nota editorial</p>
                            <p>
                                Las categor?as y etiquetas mejoran el descubrimiento del contenido en el blog, los listados y futuras integraciones.
                            </p>
                        </div>
                        {post && revisions.length > 0 && (
                            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div>
                                    <p className="font-medium text-slate-900">Revisiones recientes</p>
                                    <p className="text-sm text-slate-600">Restaura una versi?n anterior del art?culo, incluyendo categor?as y etiquetas.</p>
                                </div>
                                <div className="space-y-2">
                                    {revisions.map((revision) => (
                                        <button key={revision.id} type="button" onClick={() => router.post(`/admin/posts/${post.id}/revisions/${revision.id}/restore`)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50">
                                            <span className="text-sm font-medium text-slate-900">{revision.created_at ? new Date(revision.created_at).toLocaleString() : 'Revisi?n guardada'}</span>
                                            <span className="text-xs text-slate-500">{revision.author_name ?? 'Editor Atlas'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="space-y-3">
                            <Button label={post ? 'Actualizar entrada' : 'Crear entrada'} icon={post ? 'pi pi-save' : 'pi pi-plus'} type="submit" loading={form.processing} className="w-full rounded-full" />
                            <Link href="/admin/posts" className="block w-full rounded-full border border-slate-300 px-5 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-100">
                                Cancelar
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
