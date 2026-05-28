import SiteLayout from '@/components/site-layout';

export default function SitePost({
    site,
    menu,
    post,
}: {
    site: { identity?: { name?: string; tagline?: string } };
    menu: Array<{ id: number; label: string; url: string }>;
    post: { title: string; excerpt?: string | null; rendered_html: string };
}) {
    return (
        <SiteLayout site={site} menu={menu} title={post.title}>
            <article className="mx-auto max-w-4xl px-6 py-20">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Articulo</p>
                <h1 className="mt-3 text-4xl font-semibold">{post.title}</h1>
                {post.excerpt && <p className="mt-4 text-lg text-slate-600">{post.excerpt}</p>}
                <div className="prose prose-slate mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: post.rendered_html }} />
            </article>
        </SiteLayout>
    );
}
