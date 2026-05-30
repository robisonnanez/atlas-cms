import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Code2, Heading1, ImageIcon, Images, Link2, ListTree, Newspaper, PlayCircle, Quote, Trash2 } from 'lucide-react';

export type AtlasBlock = {
    type: string;
    data: Record<string, string | number | AtlasBlock[]>;
};

const BLOCK_TYPES = [
    { type: 'heading', label: 'Heading', icon: Heading1 },
    { type: 'paragraph', label: 'Paragraph', icon: Quote },
    { type: 'image', label: 'Image', icon: ImageIcon },
    { type: 'video', label: 'Video', icon: PlayCircle },
    { type: 'button', label: 'Button', icon: Link2 },
    { type: 'carousel', label: 'Carousel', icon: Images },
    { type: 'latest_posts', label: 'Latest posts', icon: Newspaper },
    { type: 'embed', label: 'Embed', icon: ListTree },
    { type: 'html', label: 'HTML', icon: Code2 },
] as const;

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

function renderPreviewBlock(block: AtlasBlock, index: number) {
    const text = String(block.data.text ?? '');
    const url = String(block.data.url ?? '');
    const alt = String(block.data.alt ?? '');
    const label = String(block.data.label ?? 'Action');
    const html = String(block.data.html ?? '');
    const limit = Number(block.data.limit ?? 3);
    const previewHtml = normalizePreviewHtml(html);

    switch (block.type) {
        case 'heading':
            return <h2 key={index} className="text-2xl font-semibold text-slate-950">{text || 'Heading block'}</h2>;
        case 'image':
            return <figure key={index} className="space-y-2"><div className="flex h-48 items-center justify-center rounded-2xl border border-dashed bg-slate-50 text-sm text-slate-400">{url || 'Image URL preview'}</div>{alt && <figcaption className="text-sm text-slate-500">{alt}</figcaption>}</figure>;
        case 'video':
            return <div key={index} className="rounded-2xl bg-slate-950 px-5 py-10 text-center text-sm text-slate-200">{url || 'Video embed URL preview'}</div>;
        case 'button':
            return <div key={index}><span className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">{label}</span></div>;
        case 'carousel':
            return <div key={index} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Carousel block</p><p className="mt-2 text-sm text-slate-600">Usar? autom?ticamente las im?genes del directorio <strong>carousel</strong> en Media.</p></div>;
        case 'latest_posts':
            return <div key={index} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Latest posts</p><p className="mt-2 text-sm text-slate-600">Mostrar? hasta {limit} publicaciones recientes del blog en la portada p?blica.</p></div>;
        case 'embed':
        case 'html':
            return <div key={index} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="max-h-[36rem] overflow-auto p-6">{previewHtml ? <div className="max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} /> : <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">HTML preview will appear here.</div>}</div></div>;
        default:
            return <p key={index} className="text-base leading-7 text-slate-700">{text || 'Paragraph block'}</p>;
    }
}

export default function BlockEditor({ value, onChange }: { value: AtlasBlock[]; onChange: (blocks: AtlasBlock[]) => void; }) {
    function updateBlock(index: number, next: AtlasBlock) {
        onChange(value.map((block, current) => (current === index ? next : block)));
    }

    function initialData(type: string): Record<string, string | number | AtlasBlock[]> {
        if (type === 'carousel') return { source: 'carousel' };
        if (type === 'latest_posts') return { limit: 3 };
        return { text: '' };
    }

    function addBlock(type = 'paragraph') {
        onChange([...value, { type, data: initialData(type) }]);
    }

    function removeBlock(index: number) {
        onChange(value.filter((_, current) => current !== index));
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-950">Visual editor</h3>
                    <p className="text-sm text-slate-500">Compose content with simple reusable blocks and preview the result as you write.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {BLOCK_TYPES.map((block) => (
                        <Button key={block.type} type="button" variant="outline" className="border-slate-300 bg-white text-slate-800 hover:bg-slate-100" onClick={() => addBlock(block.type)}>
                            <block.icon className="size-4" />
                            {block.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-4">
                    {value.map((block, index) => (
                        <div key={`${block.type}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor={`block-type-${index}`} className="text-sm font-medium text-slate-700">Block type</Label>
                                    <select id={`block-type-${index}`} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950" value={block.type} onChange={(event) => updateBlock(index, { type: event.target.value, data: block.data })}>
                                        {BLOCK_TYPES.map((type) => <option key={type.type} value={type.type}>{type.label}</option>)}
                                    </select>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="text-slate-500 hover:text-rose-600" onClick={() => removeBlock(index)}><Trash2 className="size-4" /></Button>
                            </div>

                            {(block.type === 'heading' || block.type === 'paragraph') && <div className="grid gap-2"><Label htmlFor={`block-text-${index}`} className="text-sm font-medium text-slate-700">Text</Label><textarea id={`block-text-${index}`} className="min-h-24 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 placeholder:text-slate-400" value={String(block.data.text ?? '')} onChange={(event) => updateBlock(index, { ...block, data: { ...block.data, text: event.target.value } })} /></div>}

                            {(block.type === 'image' || block.type === 'video') && <div className="grid gap-4 md:grid-cols-2"><div className="grid gap-2"><Label htmlFor={`block-url-${index}`} className="text-sm font-medium text-slate-700">URL</Label><Input id={`block-url-${index}`} className="h-11 border-slate-300 bg-white text-slate-950 placeholder:text-slate-400" value={String(block.data.url ?? '')} onChange={(event) => updateBlock(index, { ...block, data: { ...block.data, url: event.target.value } })} /></div><div className="grid gap-2"><Label htmlFor={`block-alt-${index}`} className="text-sm font-medium text-slate-700">Alt / caption</Label><Input id={`block-alt-${index}`} className="h-11 border-slate-300 bg-white text-slate-950 placeholder:text-slate-400" value={String(block.data.alt ?? '')} onChange={(event) => updateBlock(index, { ...block, data: { ...block.data, alt: event.target.value } })} /></div></div>}

                            {block.type === 'button' && <div className="grid gap-4 md:grid-cols-2"><div className="grid gap-2"><Label htmlFor={`block-label-${index}`} className="text-sm font-medium text-slate-700">Label</Label><Input id={`block-label-${index}`} className="h-11 border-slate-300 bg-white text-slate-950 placeholder:text-slate-400" value={String(block.data.label ?? '')} onChange={(event) => updateBlock(index, { ...block, data: { ...block.data, label: event.target.value } })} /></div><div className="grid gap-2"><Label htmlFor={`block-link-${index}`} className="text-sm font-medium text-slate-700">Link</Label><Input id={`block-link-${index}`} className="h-11 border-slate-300 bg-white text-slate-950 placeholder:text-slate-400" value={String(block.data.url ?? '')} onChange={(event) => updateBlock(index, { ...block, data: { ...block.data, url: event.target.value } })} /></div></div>}

                            {block.type === 'carousel' && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Este bloque mostrar? autom?ticamente las im?genes que est?n dentro del directorio <strong>carousel</strong> en la biblioteca multimedia.</div>}

                            {block.type === 'latest_posts' && <div className="grid gap-2"><Label htmlFor={`block-limit-${index}`} className="text-sm font-medium text-slate-700">Cantidad de publicaciones</Label><Input id={`block-limit-${index}`} type="number" min={1} max={12} className="h-11 border-slate-300 bg-white text-slate-950 placeholder:text-slate-400" value={String(block.data.limit ?? 3)} onChange={(event) => updateBlock(index, { ...block, data: { ...block.data, limit: Number(event.target.value || 3) } })} /></div>}

                            {(block.type === 'embed' || block.type === 'html') && <div className="grid gap-2"><Label htmlFor={`block-html-${index}`} className="text-sm font-medium text-slate-700">HTML / embed</Label><textarea id={`block-html-${index}`} className="min-h-72 rounded-xl border border-slate-300 bg-white px-3 py-3 font-mono text-sm text-slate-950 placeholder:text-slate-400" value={String(block.data.html ?? '')} onChange={(event) => updateBlock(index, { ...block, data: { ...block.data, html: event.target.value } })} /></div>}
                        </div>
                    ))}

                    {value.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">No blocks yet. Start with a heading or paragraph.</div>}
                </div>

                <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-24">
                    <div className="mb-4"><h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Live preview</h4><p className="mt-1 text-sm text-slate-500">A fast approximation of how this content will render publicly.</p></div>
                    <div className="space-y-5">{value.length > 0 ? value.map((block, index) => renderPreviewBlock(block, index)) : <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Your preview will appear here as soon as you add content blocks.</div>}</div>
                </aside>
            </div>
        </div>
    );
}
