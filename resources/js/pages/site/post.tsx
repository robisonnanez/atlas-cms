import ContentBlockRenderer from '@/components/content-block-renderer';
import SiteLayout from '@/components/site-layout';
import type { AtlasBlock, AtlasLatestPostPreview, AtlasMediaAsset, AtlasMediaDirectory } from '@/types/atlas-content';

export default function SitePost({
    site,
    menu,
    post,
    mediaLibrary,
    latestPosts,
}: {
    site: { identity?: { name?: string; tagline?: string }; locale?: string };
    menu: Array<{ id: number; label: string; url: string }>;
    post: { title: string; excerpt?: string | null; rendered_html: string; content_json?: AtlasBlock[] };
    mediaLibrary: { directories: AtlasMediaDirectory[]; assets: AtlasMediaAsset[] };
    latestPosts: AtlasLatestPostPreview[];
}) {
    return (
        <SiteLayout site={site} menu={menu} title={post.title}>
            <article className="mx-auto max-w-5xl px-6 py-20">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Art?culo</p>
                <h1 className="mt-3 text-4xl font-semibold">{post.title}</h1>
                {post.excerpt && <p className="mt-4 text-lg text-slate-600">{post.excerpt}</p>}
                <div className="mt-10">
                    {post.content_json?.length ? <ContentBlockRenderer blocks={post.content_json} mediaAssets={mediaLibrary.assets} latestPosts={latestPosts} /> : <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: post.rendered_html }} />}
                </div>
            </article>
        </SiteLayout>
    );
}
