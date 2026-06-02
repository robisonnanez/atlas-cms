import ContentBlockRenderer from '@/components/content-block-renderer';
import SiteLayout from '@/components/site-layout';
import type { AtlasBlock, AtlasLatestPostPreview, AtlasMediaAsset, AtlasMediaDirectory } from '@/types/atlas-content';

export default function SitePage({
    site,
    menu,
    page,
    mediaLibrary,
    latestPosts,
}: {
    site: { identity?: { name?: string; tagline?: string }; locale?: string };
    menu: Array<{ id: number; label: string; url: string }>;
    page: { title: string; rendered_html: string; content_json?: AtlasBlock[] };
    mediaLibrary: { directories: AtlasMediaDirectory[]; assets: AtlasMediaAsset[] };
    latestPosts: AtlasLatestPostPreview[];
}) {
    return (
        <SiteLayout site={site} menu={menu} title={page.title}>
            <article className="mx-auto max-w-5xl px-6 py-20">
                <h1 className="text-4xl font-semibold tracking-tight">{page.title}</h1>
                <div className="mt-10">
                    {page.content_json?.length ? <ContentBlockRenderer blocks={page.content_json} mediaAssets={mediaLibrary.assets} latestPosts={latestPosts} /> : <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: page.rendered_html }} />}
                </div>
            </article>
        </SiteLayout>
    );
}
