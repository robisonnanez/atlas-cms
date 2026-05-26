import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
            <Head title="Taxonomies" />
            <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={(event) => {
                            event.preventDefault();
                            categoryForm.post('/admin/categories');
                        }} className="grid gap-3 rounded-2xl border p-4">
                            <input className="rounded-xl border px-4 py-3" placeholder="Name" value={categoryForm.data.name} onChange={(event) => categoryForm.setData('name', event.target.value)} />
                            <input className="rounded-xl border px-4 py-3" placeholder="Slug" value={categoryForm.data.slug} onChange={(event) => categoryForm.setData('slug', event.target.value)} />
                            <textarea className="rounded-xl border px-4 py-3" placeholder="Description" value={categoryForm.data.description} onChange={(event) => categoryForm.setData('description', event.target.value)} />
                            <button className="rounded-full bg-slate-950 px-4 py-3 text-white">Add category</button>
                        </form>
                        <div className="space-y-3">
                            {categories.map((category) => (
                                <div key={category.id} className="rounded-2xl border p-4">
                                    <p className="font-medium">{category.name}</p>
                                    <p className="text-muted-foreground text-sm">{category.slug}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={(event) => {
                            event.preventDefault();
                            tagForm.post('/admin/tags');
                        }} className="grid gap-3 rounded-2xl border p-4">
                            <input className="rounded-xl border px-4 py-3" placeholder="Name" value={tagForm.data.name} onChange={(event) => tagForm.setData('name', event.target.value)} />
                            <input className="rounded-xl border px-4 py-3" placeholder="Slug" value={tagForm.data.slug} onChange={(event) => tagForm.setData('slug', event.target.value)} />
                            <textarea className="rounded-xl border px-4 py-3" placeholder="Description" value={tagForm.data.description} onChange={(event) => tagForm.setData('description', event.target.value)} />
                            <button className="rounded-full bg-slate-950 px-4 py-3 text-white">Add tag</button>
                        </form>
                        <div className="space-y-3">
                            {tags.map((tag) => (
                                <div key={tag.id} className="rounded-2xl border p-4">
                                    <p className="font-medium">{tag.name}</p>
                                    <p className="text-muted-foreground text-sm">{tag.slug}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
