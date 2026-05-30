import SiteLayout from '@/components/site-layout';

export default function SiteHome({
    site,
    menu,
    hero,
}: {
    site: { identity?: { name?: string; tagline?: string } };
    menu: Array<{ id: number; label: string; url: string }>;
    hero: null | { title: string; rendered_html: string };
}) {
    return (
        <SiteLayout site={site} menu={menu} title={hero?.title ?? site.identity?.name ?? 'Atlas CMS'}>
            <section className="mx-auto max-w-6xl px-6 py-16">
                <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: hero?.rendered_html ?? '' }} />
            </section>
        </SiteLayout>
    );
}
