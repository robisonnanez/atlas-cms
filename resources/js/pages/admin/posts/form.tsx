import BlockEditor, { type AtlasBlock } from '@/editor/block-editor';
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
            <Head title={post ? 'Edit post' : 'Create post'} />

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
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas posts</p>
                            <h1 className="text-3xl font-semibold text-slate-950">{post ? 'Edit post' : 'Create post'}</h1>
                            <p className="max-w-2xl text-sm text-slate-600">
                                Write articles, classify them and prepare search metadata from one editorial surface.
                            </p>
                        </div>
                        <div className="flex w-full gap-3 lg:w-auto">
                            <Link
                                href="/admin/posts"
                                className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 lg:w-auto"
                            >
                                Cancel
                            </Link>
                            <Button
                                label={post ? 'Update post' : 'Create post'}
                                icon={post ? 'pi pi-save' : 'pi pi-plus'}
                                type="submit"
                                loading={form.processing}
                                className="w-full rounded-full lg:w-auto"
                            />
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Title</span>
                            <InputText
                                value={form.data.title}
                                onChange={(event) => form.setData('title', event.target.value)}
                                placeholder="Atlas launch recap"
                                className="w-full"
                            />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Slug</span>
                            <InputText
                                value={form.data.slug}
                                onChange={(event) => form.setData('slug', event.target.value)}
                                placeholder="atlas-launch-recap"
                                className="w-full"
                            />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Excerpt</span>
                            <InputTextarea
                                value={form.data.excerpt}
                                onChange={(event) => form.setData('excerpt', event.target.value)}
                                rows={4}
                                autoResize
                                placeholder="Short teaser for archive pages and social previews."
                                className="w-full"
                            />
                        </label>
                        <BlockEditor value={form.data.content_json} onChange={(blocks) => form.setData('content_json', blocks)} />
                    </div>

                    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Status</span>
                            <Dropdown
                                value={form.data.status}
                                options={[
                                    { label: 'Draft', value: 'draft' },
                                    { label: 'Published', value: 'published' },
                                ]}
                                onChange={(event) => form.setData('status', event.value)}
                                className="w-full"
                            />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Primary category</span>
                            <Dropdown
                                value={form.data.primary_category_id}
                                options={categories.map((category) => ({ label: category.name, value: category.id }))}
                                onChange={(event) => form.setData('primary_category_id', event.value ?? '')}
                                placeholder="Select a primary category"
                                showClear
                                className="w-full"
                            />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Categories</span>
                            <MultiSelect
                                value={form.data.category_ids}
                                options={categories.map((category) => ({ label: category.name, value: category.id }))}
                                onChange={(event) => form.setData('category_ids', event.value)}
                                placeholder="Choose categories"
                                display="chip"
                                className="w-full"
                            />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">Tags</span>
                            <MultiSelect
                                value={form.data.tag_ids}
                                options={tags.map((tag) => ({ label: tag.name, value: tag.id }))}
                                onChange={(event) => form.setData('tag_ids', event.value)}
                                placeholder="Choose tags"
                                display="chip"
                                className="w-full"
                            />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">SEO title</span>
                            <InputText
                                value={form.data.seo_title}
                                onChange={(event) => form.setData('seo_title', event.target.value)}
                                placeholder="Atlas launch recap"
                                className="w-full"
                            />
                        </label>
                        <label className="grid gap-2">
                            <span className="text-sm font-medium text-slate-700">SEO description</span>
                            <InputTextarea
                                value={form.data.seo_description}
                                onChange={(event) => form.setData('seo_description', event.target.value)}
                                rows={4}
                                autoResize
                                placeholder="Search-friendly summary of the article."
                                className="w-full"
                            />
                        </label>
                        <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="font-medium text-slate-900">Editorial note</p>
                            <p>
                                Tags and categories improve discovery across the blog, archive pages and future plugin integrations.
                            </p>
                        </div>
                        {post && revisions.length > 0 && (
                            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div>
                                    <p className="font-medium text-slate-900">Recent revisions</p>
                                    <p className="text-sm text-slate-600">Restore an earlier article snapshot, including categories and tags.</p>
                                </div>
                                <div className="space-y-2">
                                    {revisions.map((revision) => (
                                        <button
                                            key={revision.id}
                                            type="button"
                                            onClick={() => router.post(`/admin/posts/${post.id}/revisions/${revision.id}/restore`)}
                                            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
                                        >
                                            <span className="text-sm font-medium text-slate-900">
                                                {revision.created_at ? new Date(revision.created_at).toLocaleString() : 'Saved revision'}
                                            </span>
                                            <span className="text-xs text-slate-500">{revision.author_name ?? 'Atlas editor'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="space-y-3">
                            <Button
                                label={post ? 'Update post' : 'Create post'}
                                icon={post ? 'pi pi-save' : 'pi pi-plus'}
                                type="submit"
                                loading={form.processing}
                                className="w-full rounded-full"
                            />
                            <Link
                                href="/admin/posts"
                                className="block w-full rounded-full border border-slate-300 px-5 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                Cancel
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
