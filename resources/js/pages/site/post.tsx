import ContentBlockRenderer from '@/components/content-block-renderer';
import SiteLayout from '@/components/site-layout';
import ThemePosition, { PositionModule } from '@/components/theme-position';
import type { AtlasBlock, AtlasLatestPostPreview, AtlasMediaAsset, AtlasMediaDirectory } from '@/types/atlas-content';

export default function SitePost({
    site,
    menu,
    post,
    mediaLibrary,
    latestPosts,
}: {
    site: { identity?: { name?: string; tagline?: string }; locale?: string; positions?: Record<string, PositionModule[]> };
    menu: Array<{ id: number; label: string; url: string }>;
    post: { title: string; excerpt?: string | null; rendered_html: string; content_json?: AtlasBlock[] };
    mediaLibrary: { directories: AtlasMediaDirectory[]; assets: AtlasMediaAsset[] };
    latestPosts: AtlasLatestPostPreview[];
}) {
    const hasSidebar = !!site.positions?.sidebar?.length;

    return (
        <SiteLayout site={site} menu={menu} title={post.title}>
            <div className="mx-auto max-w-6xl px-6 py-16">
                {site.positions?.content_top?.length ? (
                    <div className="mb-10">
                        <ThemePosition position="content_top" modules={site.positions.content_top} />
                    </div>
                ) : null}

                <div className={hasSidebar ? 'grid grid-cols-1 lg:grid-cols-12 gap-12' : ''}>
                    <article className={hasSidebar ? 'lg:col-span-8' : 'mx-auto max-w-4xl'}>
                        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Artículo</p>
                        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{post.title}</h1>
                        {post.excerpt && <p className="mt-4 text-lg text-slate-600">{post.excerpt}</p>}
                        <div className="mt-10">
                            {post.content_json?.length ? (
                                <ContentBlockRenderer blocks={post.content_json} mediaAssets={mediaLibrary.assets} latestPosts={latestPosts} />
                            ) : (
                                <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: post.rendered_html }} />
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