import SiteLayout from '@/components/site-layout';

export default function SitePage({
    site,
    menu,
    page,
}: {
    site: { identity?: { name?: string; tagline?: string } };
    menu: Array<{ id: number; label: string; url: string }>;
    page: { title: string; rendered_html: string };
}) {
    return (
        <SiteLayout site={site} menu={menu} title={page.title}>
            <article className="mx-auto max-w-4xl px-6 py-20">
                <h1 className="text-4xl font-semibold tracking-tight">{page.title}</h1>
                <div className="prose prose-slate mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: page.rendered_html }} />
            </article>
        </SiteLayout>
    );
}
