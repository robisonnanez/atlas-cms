import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PostsIndex({ posts }: { posts: Array<{ id: number; title: string; slug: string; status: string }> }) {
    return (
        <>
            <Head title="Posts" />
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Posts</CardTitle>
                    <Link href="/admin/posts/create" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
                        New post
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
                                {posts.map((post) => (
                                    <tr key={post.id} className="border-t">
                                        <td className="px-4 py-3 font-medium">{post.title}</td>
                                        <td className="px-4 py-3 text-slate-500">{post.slug}</td>
                                        <td className="px-4 py-3 capitalize">{post.status}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3">
                                                <Link href={`/admin/posts/${post.id}/edit`} className="text-blue-600">Edit</Link>
                                                <button className="text-rose-600" onClick={() => router.delete(`/admin/posts/${post.id}`)}>Delete</button>
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
