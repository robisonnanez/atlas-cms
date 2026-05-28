import SiteLayout from '@/components/site-layout';

export default function BlogIndex({
    site,
    menu,
    posts,
    title,
}: {
    site: { identity?: { name?: string; tagline?: string } };
    menu: Array<{ id: number; label: string; url: string }>;
    posts: { data?: Array<{ id: number; title: string; slug: string; excerpt: string | null }> } | Array<{ id: number; title: string; slug: string; excerpt: string | null }>;
    title?: string;
}) {
    const items = Array.isArray(posts) ? posts : (posts.data ?? []);

    return (
        <SiteLayout site={site} menu={menu} title={title ?? 'Blog'}>
            <section className="mx-auto max-w-5xl px-6 py-20">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Atlas Journal</p>
                <h1 className="mt-3 text-4xl font-semibold">{title ?? 'Ultimas historias'}</h1>
                <div className="mt-10 space-y-6">
                    {items.map((post) => (
                        <article key={post.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
                            <h2 className="text-2xl font-semibold">{post.title}</h2>
                            <p className="mt-3 text-slate-600">{post.excerpt}</p>
                            <a href={`/blog/${post.slug}`} className="mt-5 inline-flex text-sm font-medium text-blue-600">
                                Leer articulo
                            </a>
                        </article>
                    ))}
                </div>
            </section>
        </SiteLayout>
    );
}
