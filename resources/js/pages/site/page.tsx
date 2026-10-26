import ContentBlockRenderer from '@/components/content-block-renderer';
import SiteLayout from '@/components/site-layout';
import ThemePosition, { PositionModule } from '@/components/theme-position';
import type { AtlasBlock, AtlasLatestPostPreview, AtlasMediaAsset, AtlasMediaDirectory } from '@/types/atlas-content';

export default function SitePage({
    site,
    menu,
    page,
    mediaLibrary,
    latestPosts,
}: {
    site: { identity?: { name?: string; tagline?: string }; locale?: string; positions?: Record<string, PositionModule[]> };
    menu: Array<{ id: number; label: string; url: string }>;
    page: { title: string; rendered_html: string; content_json?: AtlasBlock[] };
    mediaLibrary: { directories: AtlasMediaDirectory[]; assets: AtlasMediaAsset[] };
    latestPosts: AtlasLatestPostPreview[];
}) {
    const hasSidebar = !!site.positions?.sidebar?.length;

    return (
        <SiteLayout site={site} menu={menu} title={page.title}>
            <div className="mx-auto max-w-6xl px-6 py-16">
                {site.positions?.content_top?.length ? (
                    <div className="mb-10">
                        <ThemePosition position="content_top" modules={site.positions.content_top} />
                    </div>
                ) : null}

                <div className={hasSidebar ? 'grid grid-cols-1 lg:grid-cols-12 gap-12' : ''}>
                    <article className={hasSidebar ? 'lg:col-span-8' : 'mx-auto max-w-4xl'}>
                        <h1 className="text-4xl font-semibold tracking-tight">{page.title}</h1>
                        <div className="mt-10">
                            {page.content_json?.length ? (
                                <ContentBlockRenderer blocks={page.content_json} mediaAssets={mediaLibrary.assets} latestPosts={latestPosts} />
                            ) : (
                                <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: page.rendered_html }} />
                            )}
                        </div>
                    </article>

                    {hasSidebar && (
                        <aside className="lg:col-span-4 space-y-8">
                            <ThemePosition position="sidebar" modules={site.positions.sidebar} moduleClassName="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm" />
                        </aside>
                    )}
                </div>

                {site.positions?.content_bottom?.length ? (
                    <div className="mt-12">
                        <ThemePosition position="content_bottom" modules={site.positions.content_bottom} />
                    </div>
                ) : null}
            </div>
        </SiteLayout>
    );
}