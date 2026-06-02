import ContentBlockRenderer from '@/components/content-block-renderer';
import SiteLayout from '@/components/site-layout';
import type { AtlasBlock, AtlasLatestPostPreview, AtlasMediaAsset, AtlasMediaDirectory } from '@/types/atlas-content';

export default function SiteHome({
    site,
    menu,
    hero,
    mediaLibrary,
    latestPosts,
}: {
    site: { identity?: { name?: string; tagline?: string }; locale?: string };
    menu: Array<{ id: number; label: string; url: string }>;
    hero: null | { title: string; rendered_html: string; content_json?: AtlasBlock[] };
    mediaLibrary: { directories: AtlasMediaDirectory[]; assets: AtlasMediaAsset[] };
    latestPosts: AtlasLatestPostPreview[];
}) {
    return (
        <SiteLayout site={site} menu={menu} title={hero?.title ?? site.identity?.name ?? 'Atlas CMS'}>
            <section className="mx-auto max-w-6xl px-6 py-16">
                {hero?.content_json?.length ? <ContentBlockRenderer blocks={hero.content_json} mediaAssets={mediaLibrary.assets} latestPosts={latestPosts} /> : <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: hero?.rendered_html ?? '' }} />}
            </section>
        </SiteLayout>
    );
}
