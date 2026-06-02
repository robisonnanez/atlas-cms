import AtlasForgeEditor from '@/components/atlas-forge-editor';
import ContentBlockRenderer from '@/components/content-block-renderer';
import type { AtlasBlock, AtlasLatestPostPreview, AtlasMediaAsset, AtlasMediaDirectory } from '@/types/atlas-content';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { useMemo } from 'react';

const BLOCK_TYPES = [
    { type: 'heading', label: 'Título', icon: 'pi pi-heading' },
    { type: 'rich_text', label: 'Texto', icon: 'pi pi-align-left' },
    { type: 'image', label: 'Imagen', icon: 'pi pi-image' },
    { type: 'video', label: 'Video', icon: 'pi pi-play-circle' },
    { type: 'button', label: 'Botón', icon: 'pi pi-link' },
    { type: 'carousel', label: 'Carrusel', icon: 'pi pi-images' },
    { type: 'gallery', label: 'Galería', icon: 'pi pi-images' },
    { type: 'latest_posts', label: 'Últimas publicaciones', icon: 'pi pi-file-edit' },
    { type: 'embed', label: 'Código embebido', icon: 'pi pi-code' },
    { type: 'html', label: 'HTML libre', icon: 'pi pi-code' },
] as const;

const sourceModeOptions = [
    { label: 'Usar un directorio', value: 'directory' },
    { label: 'Seleccionar imágenes', value: 'manual' },
];

function fieldValue<T>(value: unknown, fallback: T): T {
    return (value as T) ?? fallback;
}

export default function BlockEditor({
    value,
    onChange,
    directories = [],
    mediaAssets = [],
    latestPostsPreview = [],
}: {
    value: AtlasBlock[];
    onChange: (blocks: AtlasBlock[]) => void;
    directories?: AtlasMediaDirectory[];
    mediaAssets?: AtlasMediaAsset[];
    latestPostsPreview?: AtlasLatestPostPreview[];
}) {
    const directoryOptions = useMemo(
        () => directories.map((directory) => ({ label: `${directory.name} (${directory.slug})`, value: directory.id })),
        [directories],
    );

    const mediaOptions = useMemo(
        () => mediaAssets.map((asset) => ({ label: asset.directory_name ? `${asset.title} · ${asset.directory_name}` : asset.title, value: asset.id })),
        [mediaAssets],
    );

    function updateBlock(index: number, next: AtlasBlock) {
        onChange(value.map((block, current) => (current === index ? next : block)));
    }

    function initialData(type: string): Record<string, unknown> {
        if (type === 'carousel') {
            const defaultDirectory = directories.find((directory) => ['carousel', 'carrusel'].includes(directory.slug));
            return {
                source_mode: 'directory',
                directory_id: defaultDirectory?.id ?? null,
                media_ids: [],
                title: 'Carrusel principal',
                autoplay_interval: 5000,
                show_captions: true,
            };
        }

        if (type === 'gallery') {
            const defaultDirectory = directories.find((directory) => ['gallery', 'galeria'].includes(directory.slug));
            return {
                source_mode: 'directory',
                directory_id: defaultDirectory?.id ?? null,
                media_ids: [],
                title: 'Galería destacada',
                thumbnails: true,
                show_indicators: true,
            };
        }

        if (type === 'latest_posts') {
            return { title: 'Novedades recientes', limit: 3 };
        }

        if (type === 'rich_text') {
            return { html: '<p>Escribe aquí tu contenido.</p>' };
        }

        if (type === 'html') {
            return { html: '' };
        }

        if (type === 'embed') {
            return { html: '' };
        }

        if (type === 'button') {
            return { label: 'Más información', url: '#' };
        }

        return { text: '' };
    }

    function addBlock(type = 'rich_text') {
        onChange([...value, { type, data: initialData(type) }]);
    }

    function removeBlock(index: number) {
        onChange(value.filter((_, current) => current !== index));
    }

    function updateBlockData(index: number, patch: Record<string, unknown>) {
        const current = value[index];
        updateBlock(index, { ...current, data: { ...current.data, ...patch } });
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-950">Editor visual</h3>
                    <p className="text-sm text-slate-500">Combina bloques estructurados, Atlas Forge Editor y previsualización en vivo.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {BLOCK_TYPES.map((block) => (
                        <Button key={block.type} type="button" outlined className="border-slate-300 bg-white text-slate-800" onClick={() => addBlock(block.type)}>
                            <i className={`${block.icon} mr-2`} />
                            {block.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-4">
                    {value.map((block, index) => {
                        const sourceMode = String(fieldValue(block.data.source_mode, 'directory'));

                        return (
                            <div key={`${block.type}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <div className="grid flex-1 gap-2">
                                        <label htmlFor={`block-type-${index}`} className="text-sm font-medium text-slate-700">Tipo de bloque</label>
                                        <Dropdown
                                            id={`block-type-${index}`}
                                            value={block.type}
                                            options={BLOCK_TYPES.map((type) => ({ label: type.label, value: type.type }))}
                                            onChange={(event) => updateBlock(index, { type: event.value, data: initialData(event.value) })}
                                            className="w-full"
                                        />
                                    </div>
                                    <Button type="button" text severity="danger" icon="pi pi-trash" rounded onClick={() => removeBlock(index)} />
                                </div>

                                {block.type === 'heading' && (
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-slate-700">Título</label>
                                        <InputText
                                            value={String(fieldValue(block.data.text, ''))}
                                            onChange={(event) => updateBlockData(index, { text: event.target.value })}
                                            placeholder="Título de la sección"
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                {block.type === 'image' && (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2 md:col-span-2">
                                            <label className="text-sm font-medium text-slate-700">URL de la imagen</label>
                                            <InputText
                                                value={String(fieldValue(block.data.url, ''))}
                                                onChange={(event) => updateBlockData(index, { url: event.target.value })}
                                                placeholder="https://..."
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium text-slate-700">Texto alternativo</label>
                                            <InputText
                                                value={String(fieldValue(block.data.alt, ''))}
                                                onChange={(event) => updateBlockData(index, { alt: event.target.value })}
                                                placeholder="Descripción accesible"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium text-slate-700">Etiqueta interna</label>
                                            <InputText
                                                value={String(fieldValue(block.data.label, ''))}
                                                onChange={(event) => updateBlockData(index, { label: event.target.value })}
                                                placeholder="Imagen principal"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {block.type === 'video' && (
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium text-slate-700">URL del video o embed</label>
                                            <InputText
                                                value={String(fieldValue(block.data.url, ''))}
                                                onChange={(event) => updateBlockData(index, { url: event.target.value })}
                                                placeholder="https://www.youtube.com/embed/..."
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium text-slate-700">Título del video</label>
                                            <InputText
                                                value={String(fieldValue(block.data.title, ''))}
                                                onChange={(event) => updateBlockData(index, { title: event.target.value })}
                                                placeholder="Video institucional"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {block.type === 'button' && (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium text-slate-700">Texto del botón</label>
                                            <InputText
                                                value={String(fieldValue(block.data.label, ''))}
                                                onChange={(event) => updateBlockData(index, { label: event.target.value })}
                                                placeholder="Leer más"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium text-slate-700">URL</label>
                                            <InputText
                                                value={String(fieldValue(block.data.url, ''))}
                                                onChange={(event) => updateBlockData(index, { url: event.target.value })}
                                                placeholder="/contacto"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {block.type === 'rich_text' && (
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-slate-700">Texto editorial</label><p className="text-xs text-slate-500">Úsalo para párrafos, citas y contenido normal del sitio.</p>
                                        <AtlasForgeEditor
                                            value={String(fieldValue(block.data.html, ''))}
                                            onChange={(html) => updateBlockData(index, { html })}
                                            placeholder="Escribe aquí el contenido del bloque."
                                            config={{ defaultHeight: 360, stickyToolbar: true, allowHtmlMode: true, allowTables: true, allowMedia: true }}
                                        />
                                    </div>
                                )}

                                {(block.type === 'html' || block.type === 'embed') && (
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-slate-700">{block.type === 'html' ? 'HTML libre' : 'Código embebido'}</label>
                                        <AtlasForgeEditor
                                            value={String(fieldValue(block.data.html, ''))}
                                            onChange={(html) => updateBlockData(index, { html })}
                                            placeholder={block.type === 'html' ? 'Pega o construye aquí tu HTML.' : 'Pega aquí el código embed.'}
                                            config={{ defaultHeight: 320, stickyToolbar: true, allowHtmlMode: true, allowTables: true, allowMedia: true }}
                                        />
                                        <p className="text-xs text-slate-500">{block.type === 'html' ? 'HTML libre para layouts o secciones personalizadas.' : 'Embeds para iframes, widgets o componentes de terceros.'}</p>
                                    </div>
                                )}

                                {(block.type === 'carousel' || block.type === 'gallery') && (
                                    <div className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium text-slate-700">Título del bloque</label>
                                                <InputText
                                                    value={String(fieldValue(block.data.title, ''))}
                                                    onChange={(event) => updateBlockData(index, { title: event.target.value })}
                                                    placeholder={block.type === 'carousel' ? 'Carrusel principal' : 'Galería destacada'}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium text-slate-700">Fuente de imágenes</label>
                                                <Dropdown
                                                    value={sourceMode}
                                                    options={sourceModeOptions}
                                                    onChange={(event) => updateBlockData(index, {
                                                        source_mode: event.value,
                                                        directory_id: event.value === 'directory' ? fieldValue(block.data.directory_id, null) : null,
                                                        media_ids: event.value === 'manual' ? fieldValue(block.data.media_ids, []) : [],
                                                    })}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>

                                        {sourceMode === 'directory' ? (
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium text-slate-700">Directorio</label>
                                                <Dropdown
                                                    value={fieldValue(block.data.directory_id, null)}
                                                    options={directoryOptions}
                                                    onChange={(event) => updateBlockData(index, { directory_id: event.value })}
                                                    placeholder={block.type === 'carousel' ? 'Selecciona el directorio del carrusel' : 'Selecciona el directorio de la galería'}
                                                    className="w-full"
                                                />
                                            </div>
                                        ) : (
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium text-slate-700">Imágenes seleccionadas</label>
                                                <MultiSelect
                                                    value={Array.isArray(block.data.media_ids) ? block.data.media_ids : []}
                                                    options={mediaOptions}
                                                    onChange={(event) => updateBlockData(index, { media_ids: event.value ?? [] })}
                                                    placeholder="Selecciona una o varias imágenes"
                                                    display="chip"
                                                    filter
                                                    className="w-full"
                                                />
                                            </div>
                                        )}

                                        {block.type === 'carousel' ? (
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium text-slate-700">Autoplay (ms)</label>
                                                    <InputNumber
                                                        value={Number(fieldValue(block.data.autoplay_interval, 5000))}
                                                        onValueChange={(event) => updateBlockData(index, { autoplay_interval: Number(event.value ?? 0) })}
                                                        min={0}
                                                        max={20000}
                                                        useGrouping={false}
                                                        className="w-full"
                                                        inputClassName="w-full"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                                    <span className="text-sm font-medium text-slate-700">Mostrar pie de imagen</span>
                                                    <InputSwitch
                                                        checked={Boolean(fieldValue(block.data.show_captions, true))}
                                                        onChange={(event) => updateBlockData(index, { show_captions: Boolean(event.value) })}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                                    <span className="text-sm font-medium text-slate-700">Miniaturas</span>
                                                    <InputSwitch
                                                        checked={Boolean(fieldValue(block.data.thumbnails, true))}
                                                        onChange={(event) => updateBlockData(index, { thumbnails: Boolean(event.value) })}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                                    <span className="text-sm font-medium text-slate-700">Indicadores</span>
                                                    <InputSwitch
                                                        checked={Boolean(fieldValue(block.data.show_indicators, true))}
                                                        onChange={(event) => updateBlockData(index, { show_indicators: Boolean(event.value) })}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {block.type === 'latest_posts' && (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium text-slate-700">Título del bloque</label>
                                            <InputText
                                                value={String(fieldValue(block.data.title, ''))}
                                                onChange={(event) => updateBlockData(index, { title: event.target.value })}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium text-slate-700">Cantidad de publicaciones</label>
                                            <InputNumber
                                                value={Number(fieldValue(block.data.limit, 3))}
                                                onValueChange={(event) => updateBlockData(index, { limit: Number(event.value ?? 3) })}
                                                min={1}
                                                max={12}
                                                useGrouping={false}
                                                className="w-full"
                                                inputClassName="w-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {value.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                            Todavía no hay bloques. Empieza por un título, texto enriquecido, carrusel o galería.
                        </div>
                    ) : null}
                </div>

                <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-24">
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Previsualización</h4>
                        <p className="mt-1 text-sm text-slate-500">Así se verá públicamente el contenido mientras lo editas.</p>
                    </div>
                    <div className="space-y-5">
                        {value.length > 0 ? (
                            <ContentBlockRenderer blocks={value} mediaAssets={mediaAssets} latestPosts={latestPostsPreview} preview />
                        ) : (
                            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">La previsualización aparecerá cuando agregues bloques.</div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
