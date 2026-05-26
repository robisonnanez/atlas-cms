import { Link } from '@inertiajs/react';
import SiteLayout from '@/components/site-layout';

export default function SiteHome({
    site,
    menu,
    hero,
    posts,
}: {
    site: { identity?: { name?: string; tagline?: string } };
    menu: Array<{ id: number; label: string; url: string }>;
    hero: null | { title: string; excerpt?: string | null; rendered_html: string };
    posts: Array<{ id: number; title: string; slug: string; excerpt: string | null }>;
}) {
    return (
        <SiteLayout site={site} menu={menu}>
            <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-blue-600">Atlas CMS</p>
                    <h1 className="mt-4 text-5xl font-semibold tracking-tight text-slate-950">
                        Publish structured content with the speed of a product dashboard.
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg text-slate-600">{hero?.excerpt ?? 'Editorial control for pages, posts, media, themes and plugins.'}</p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/blog" className="rounded-full bg-slate-950 px-5 py-3 font-medium text-white">Read the blog</Link>
                        <Link href="/login" className="rounded-full border border-slate-300 px-5 py-3 font-medium text-slate-700">Open admin</Link>
                    </div>
                </div>
                <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-blue-100/40">
                    <div dangerouslySetInnerHTML={{ __html: hero?.rendered_html ?? '' }} className="prose prose-slate max-w-none" />
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 pb-20">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Latest posts</p>
                        <h2 className="mt-2 text-3xl font-semibold">Fresh updates from Atlas</h2>
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {posts.map((post) => (
                        <article key={post.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-xl font-semibold">{post.title}</h3>
                            <p className="mt-3 text-sm text-slate-600">{post.excerpt}</p>
                            <Link href={`/blog/${post.slug}`} className="mt-6 inline-flex text-sm font-medium text-blue-600">Read article</Link>
                        </article>
                    ))}
                </div>
            </section>
        </SiteLayout>
    );
}
