import { Carousel as PrimeCarousel } from 'primereact/carousel';
import { Galleria } from 'primereact/galleria';
import type { AtlasBlock, AtlasLatestPostPreview, AtlasMediaAsset } from '@/types/atlas-content';

function normalizePreviewHtml(html: string): string {
    return html
        .replace(/<!doctype[^>]*>/gi, '')
        .replace(/<html[^>]*>/gi, '')
        .replace(/<\/html>/gi, '')
        .replace(/<body[^>]*>/gi, '')
        .replace(/<\/body>/gi, '')
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gis, '')
        .trim();
}

function resolveMedia(block: AtlasBlock, mediaAssets: AtlasMediaAsset[]): AtlasMediaAsset[] {
    const sourceMode = String(block.data.source_mode ?? 'directory');

    if (sourceMode === 'manual') {
        const ids = Array.isArray(block.data.media_ids) ? block.data.media_ids.map((value) => Number(value)).filter(Boolean) : [];
        return ids.map((id) => mediaAssets.find((asset) => asset.id === id)).filter((asset): asset is AtlasMediaAsset => Boolean(asset));
    }

    const directoryId = Number(block.data.directory_id ?? 0);
    if (directoryId > 0) {
        return mediaAssets.filter((asset) => Number(asset.directory_id ?? 0) === directoryId);
    }

    return mediaAssets.filter((asset) => ['carousel', 'carrusel', 'galeria', 'gallery'].includes(String(asset.directory_name ?? '').toLowerCase()));
}

function renderRichHtml(block: AtlasBlock) {
    const html = String(block.data.html ?? block.data.text ?? '');
    const normalized = normalizePreviewHtml(html);

    if (!normalized) {
        return <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Agrega contenido enriquecido para ver la previsualización.</div>;
    }

    return <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: normalized }} />;
}

export default function ContentBlockRenderer({
    blocks,
    mediaAssets = [],
    latestPosts = [],
    preview = false,
}: {
    blocks: AtlasBlock[];
    mediaAssets?: AtlasMediaAsset[];
    latestPosts?: AtlasLatestPostPreview[];
    preview?: boolean;
}) {
    return (
        <div className="space-y-8">
            {blocks.map((block, index) => {
                const key = `${block.type}-${index}`;
                const text = String(block.data.text ?? '');
                const url = String(block.data.url ?? '');
                const alt = String(block.data.alt ?? '');
                const label = String(block.data.label ?? 'Acción');
                const title = String(block.data.title ?? '');

                switch (block.type) {
                    case 'heading':
                        return <h2 key={key} className="text-3xl font-semibold tracking-tight text-slate-950">{text || 'Título del bloque'}</h2>;
                    case 'image':
                        return (
                            <figure key={key} className="space-y-3">
                                {url ? (
                                    <img src={url} alt={alt || label} className="w-full rounded-3xl object-cover shadow-sm" />
                                ) : (
                                    <div className="flex h-56 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                                        Selecciona o escribe una imagen para este bloque.
                                    </div>
                                )}
                                {alt ? <figcaption className="text-sm text-slate-500">{alt}</figcaption> : null}
                            </figure>
                        );
                    case 'video':
                        return (
                            <div key={key} className="overflow-hidden rounded-3xl bg-slate-950 shadow-sm">
                                {url ? (
                                    <iframe src={url} className="aspect-video w-full" allowFullScreen loading="lazy" title={title || 'Video'} />
                                ) : (
                                    <div className="flex aspect-video items-center justify-center text-sm text-slate-300">Ingresa la URL del video o embed.</div>
                                )}
                            </div>
                        );
                    case 'button':
                        return (
                            <div key={key}>
                                <a href={url || '#'} className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                                    {label}
                                </a>
                            </div>
                        );
                    case 'rich_text':
                    case 'paragraph':
                    case 'html':
                    case 'embed':
                        return <section key={key}>{renderRichHtml(block)}</section>;
                    case 'carousel': {
                        const items = resolveMedia(block, mediaAssets);
                        const autoPlayInterval = Math.max(0, Number(block.data.autoplay_interval ?? 0));
                        const showCaptions = Boolean(block.data.show_captions ?? true);

                        if (!items.length) {
                            return <div key={key} className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">Selecciona un directorio o imágenes específicas para el carrusel.</div>;
                        }

                        return (
                            <section key={key} className="space-y-4">
                                {title ? (
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Carrusel</p>
                                        <h3 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h3>
                                    </div>
                                ) : null}
                                <PrimeCarousel
                                    value={items}
                                    numVisible={1}
                                    numScroll={1}
                                    circular={items.length > 1}
                                    autoplayInterval={autoPlayInterval > 0 ? autoPlayInterval : undefined}
                                    itemTemplate={(item: AtlasMediaAsset) => (
                                        <figure className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                                            <img src={item.url} alt={item.alt || item.title} className="h-[24rem] w-full object-cover" />
                                            {showCaptions ? <figcaption className="px-6 py-4 text-sm text-slate-600">{item.title}</figcaption> : null}
                                        </figure>
                                    )}
                                />
                            </section>
                        );
                    }
                    case 'gallery': {
                        const items = resolveMedia(block, mediaAssets);
                        if (!items.length) {
                            return <div key={key} className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">Selecciona un directorio o imágenes específicas para la galería.</div>;
                        }

                        return (
                            <section key={key} className="space-y-4">
                                {title ? (
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Galería</p>
                                        <h3 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h3>
                                    </div>
                                ) : null}
                                <Galleria
                                    value={items}
                                    numVisible={Math.min(items.length, 5)}
                                    circular={items.length > 1}
                                    showThumbnails={Boolean(block.data.thumbnails ?? true)}
                                    showIndicators={Boolean(block.data.show_indicators ?? true)}
                                    item={(item: AtlasMediaAsset) => <img src={item.url} alt={item.alt || item.title} className="h-[28rem] w-full rounded-[2rem] object-cover" />}
                                    thumbnail={(item: AtlasMediaAsset) => <img src={item.url} alt={item.alt || item.title} className="h-20 w-full rounded-2xl object-cover" />}
                                />
                            </section>
                        );
                    }
                    case 'latest_posts': {
                        const limit = Math.max(1, Number(block.data.limit ?? 3));
                        const items = latestPosts.slice(0, limit);

                        if (!items.length) {
                            return <div key={key} className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">Todavía no hay publicaciones para mostrar.</div>;
                        }

                        return (
                            <section key={key} className="space-y-8">
                                <div>
                                    <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Blog</p>
                                    <h3 className="mt-2 text-3xl font-semibold text-slate-950">{title || 'Novedades recientes'}</h3>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {items.map((item) => (
                                        <article key={item.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                                            <h4 className="text-xl font-semibold text-slate-950">{item.title}</h4>
                                            {item.excerpt ? <p className="mt-3 text-sm text-slate-600">{item.excerpt}</p> : null}
                                            {!preview && item.url ? <a href={item.url} className="mt-5 inline-flex text-sm font-semibold text-blue-600">Leer artículo</a> : null}
                                        </article>
                                    ))}
                                </div>
                            </section>
                        );
                    }
                    default:
                        return <p key={key} className="text-base leading-7 text-slate-700">{text}</p>;
                }
            })}
        </div>
    );
}
