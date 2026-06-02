<?php

namespace App\Support\Cms;

use App\Domain\Content\Contracts\ContentRendererContract;
use App\Models\Media;
use App\Models\Post;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ContentRenderer implements ContentRendererContract
{
    public function render(array $blocks): string
    {
        return collect($blocks)
            ->map(fn (array $block): string => $this->renderBlock($block))
            ->implode("\n");
    }

    protected function renderBlock(array $block): string
    {
        $type = $block['type'] ?? 'paragraph';
        $data = is_array($block['data'] ?? null) ? $block['data'] : [];

        return match ($type) {
            'heading' => sprintf('<h2 class="atlas-prose-heading">%s</h2>', e($data['text'] ?? '')),
            'image' => sprintf('<figure><img src="%s" alt="%s" class="atlas-prose-image" /></figure>', e($data['url'] ?? ''), e($data['alt'] ?? '')),
            'video' => sprintf('<div class="atlas-embed"><iframe src="%s" loading="lazy" allowfullscreen></iframe></div>', e($data['url'] ?? '')),
            'button' => sprintf('<p><a href="%s" class="atlas-button">%s</a></p>', e($data['url'] ?? '#'), e($data['label'] ?? 'Acci?n')),
            'columns' => $this->renderColumns($data['columns'] ?? []),
            'embed' => $this->renderEmbed($data),
            'html' => $this->sanitizeHtml((string) ($data['html'] ?? '')),
            'rich_text', 'paragraph' => $this->renderRichText($data),
            'carousel' => $this->renderCarousel($data),
            'gallery' => $this->renderGallery($data),
            'latest_posts' => $this->renderLatestPosts($data),
            default => sprintf('<p>%s</p>', nl2br(e((string) ($data['text'] ?? '')))),
        };
    }

    protected function renderRichText(array $data): string
    {
        $html = (string) ($data['html'] ?? '');

        if ($html !== '') {
            return $this->sanitizeHtml($html);
        }

        return sprintf('<p>%s</p>', nl2br(e((string) ($data['text'] ?? ''))));
    }

    protected function renderEmbed(array $data): string
    {
        $html = $this->sanitizeHtml((string) ($data['html'] ?? ''));

        if ($html === '') {
            return '<div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">Agrega aquí un iframe, widget o snippet embebido para mostrarlo en la página.</div>';
        }

        return sprintf('<div class="atlas-embed">%s</div>', $html);
    }

    protected function sanitizeHtml(string $html): string
    {
        return (string) Str::of($html)
            ->replaceMatches('/<!doctype[^>]*>/i', '')
            ->replaceMatches('/<html[^>]*>/i', '')
            ->replace('</html>', '')
            ->replaceMatches('/<body[^>]*>/i', '')
            ->replace('</body>', '')
            ->replaceMatches('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/is', '')
            ->trim();
    }

    protected function renderColumns(array $columns): string
    {
        $items = collect($columns)->map(function (array $column): string {
            return sprintf('<div class="atlas-column">%s</div>', $this->render($column['blocks'] ?? []));
        })->implode('');

        return sprintf('<div class="atlas-columns">%s</div>', $items);
    }

    protected function renderCarousel(array $data): string
    {
        $items = $this->resolveMediaItems($data, 8);

        if ($items->isEmpty()) {
            return '<div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">Configura un directorio o selecciona im?genes para este carrusel.</div>';
        }

        $title = e((string) ($data['title'] ?? 'Carrusel principal'));
        $showCaptions = filter_var($data['show_captions'] ?? true, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE);
        $showCaptions = $showCaptions !== false;

        $slides = $items->map(function (Media $media) use ($showCaptions): string {
            $url = Storage::disk($media->disk)->url($media->path);
            $title = e($media->title ?: $media->filename);
            $alt = e($media->alt_text ?: $media->title ?: $media->filename);
            $caption = $showCaptions ? sprintf('<figcaption class="mt-3 text-sm text-slate-500">%s</figcaption>', $title) : '';

            return sprintf('<figure class="space-y-2"><img src="%s" alt="%s" class="w-full rounded-3xl object-cover shadow-sm" />%s</figure>', e($url), $alt, $caption);
        })->implode('');

        return sprintf('<section class="space-y-5"><div class="flex items-center justify-between gap-4"><h2 class="text-3xl font-semibold text-slate-950">%s</h2></div><div class="grid gap-6">%s</div></section>', $title, $slides);
    }

    protected function renderGallery(array $data): string
    {
        $items = $this->resolveMediaItems($data, 18);

        if ($items->isEmpty()) {
            return '<div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">Configura un directorio o selecciona im?genes para esta galer?a.</div>';
        }

        $title = e((string) ($data['title'] ?? 'Galer?a de im?genes'));

        $cards = $items->map(function (Media $media): string {
            $url = Storage::disk($media->disk)->url($media->path);
            $alt = e($media->alt_text ?: $media->title ?: $media->filename);
            return sprintf('<figure class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><img src="%s" alt="%s" class="h-64 w-full object-cover" /></figure>', e($url), $alt);
        })->implode('');

        return sprintf('<section class="space-y-5"><div class="flex items-center justify-between gap-4"><h2 class="text-3xl font-semibold text-slate-950">%s</h2></div><div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">%s</div></section>', $title, $cards);
    }

    protected function renderLatestPosts(array $data): string
    {
        $limit = max(1, min((int) ($data['limit'] ?? 3), 12));
        $items = Post::query()->published()->latest('published_at')->take($limit)->get();

        if ($items->isEmpty()) {
            return '<div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">Todav?a no hay publicaciones para mostrar.</div>';
        }

        $title = e((string) ($data['title'] ?? 'Novedades recientes'));
        $cards = $items->map(function (Post $post): string {
            return sprintf('<article class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"><h3 class="text-xl font-semibold text-slate-950">%s</h3><p class="mt-3 text-sm text-slate-600">%s</p><a href="/blog/%s" class="mt-6 inline-flex text-sm font-medium text-blue-600">Leer art?culo</a></article>', e($post->title), e($post->excerpt ?? ''), e($post->slug));
        })->implode('');

        return sprintf('<section class="space-y-8"><div><p class="text-sm uppercase tracking-[0.35em] text-slate-400">Blog</p><h2 class="mt-2 text-3xl font-semibold text-slate-950">%s</h2></div><div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">%s</div></section>', $title, $cards);
    }

    protected function resolveMediaItems(array $data, int $limit)
    {
        $sourceMode = $data['source_mode'] ?? 'directory';
        $query = Media::query()->where('mime_type', 'like', 'image/%')->with('directory');

        if ($sourceMode === 'manual') {
            $ids = collect($data['media_ids'] ?? [])->map(fn ($id) => (int) $id)->filter()->values()->all();

            if ($ids === []) {
                return collect();
            }

            return $query->whereIn('id', $ids)->get()->sortBy(fn (Media $media) => array_search($media->id, $ids, true))->values()->take($limit);
        }

        $directoryId = (int) ($data['directory_id'] ?? 0);
        if ($directoryId > 0) {
            return $query->where('directory_id', $directoryId)->latest()->take($limit)->get();
        }

        return $query->whereHas('directory', fn ($builder) => $builder->whereIn('slug', ['carousel', 'carrusel', 'galeria', 'gallery']))->latest()->take($limit)->get();
    }
}
