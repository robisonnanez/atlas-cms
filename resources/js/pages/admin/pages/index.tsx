import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PagesIndex({ pages }: { pages: Array<{ id: number; title: string; slug: string; status: string; updated_at: string }> }) {
    return (
        <>
            <Head title="Pages" />
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Pages</CardTitle>
                    </div>
                    <Link href="/admin/pages/create" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
                        New page
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-2xl border">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Slug</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pages.map((page) => (
                                    <tr key={page.id} className="border-t">
                                        <td className="px-4 py-3 font-medium">{page.title}</td>
                                        <td className="px-4 py-3 text-slate-500">{page.slug}</td>
                                        <td className="px-4 py-3 capitalize">{page.status}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3">
                                                <Link href={`/admin/pages/${page.id}/edit`} className="text-blue-600">Edit</Link>
                                                <button className="text-rose-600" onClick={() => router.delete(`/admin/pages/${page.id}`)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
