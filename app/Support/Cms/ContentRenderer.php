<?php

namespace App\Support\Cms;

use App\Domain\Content\Contracts\ContentRendererContract;
use App\Models\Media;
use App\Models\Post;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

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
        $data = $block['data'] ?? [];

        return match ($type) {
            'heading' => sprintf('<h2 class="atlas-prose-heading">%s</h2>', e($data['text'] ?? '')),
            'image' => sprintf('<figure><img src="%s" alt="%s" class="atlas-prose-image" /></figure>', e($data['url'] ?? ''), e($data['alt'] ?? '')),
            'video' => sprintf('<div class="atlas-embed"><iframe src="%s" loading="lazy" allowfullscreen></iframe></div>', e($data['url'] ?? '')),
            'button' => sprintf('<p><a href="%s" class="atlas-button">%s</a></p>', e($data['url'] ?? '#'), e($data['label'] ?? 'Action')),
            'columns' => $this->renderColumns($data['columns'] ?? []),
            'embed' => sprintf('<div class="atlas-embed">%s</div>', $data['html'] ?? ''),
            'html' => (string) Str::of($data['html'] ?? '')->trim(),
            'carousel' => $this->renderCarousel(),
            'latest_posts' => $this->renderLatestPosts((int) ($data['limit'] ?? 3)),
            default => sprintf('<p>%s</p>', nl2br(e($data['text'] ?? ''))),
        };
    }

    protected function renderColumns(array $columns): string
    {
        $items = collect($columns)->map(function (array $column): string {
            return sprintf('<div class="atlas-column">%s</div>', $this->render($column['blocks'] ?? []));
        })->implode('');

        return new HtmlString(sprintf('<div class="atlas-columns">%s</div>', $items));
    }

    protected function renderCarousel(): string
    {
        $items = Media::query()
            ->with('directory')
            ->where('mime_type', 'like', 'image/%')
            ->whereHas('directory', fn ($query) => $query->whereIn('slug', ['carousel', 'carrusel']))
            ->latest()
            ->take(5)
            ->get();

        if ($items->isEmpty()) {
            return '<div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">Agrega im?genes al directorio <strong>carousel</strong> para mostrar el carrusel aqu?.</div>';
        }

        $slides = $items->map(function (Media $media): string {
            $url = $media->metadata['url'] ?? Storage::disk($media->disk)->url($media->path);
            $title = e($media->title ?: $media->filename);
            $alt = e($media->alt_text ?: $media->title ?: $media->filename);
            return sprintf('<figure class="space-y-3"><img src="%s" alt="%s" class="w-full rounded-3xl object-cover shadow-sm" /><figcaption class="text-sm text-slate-500">%s</figcaption></figure>', e($url), $alt, $title);
        })->implode('');

        return sprintf('<section class="space-y-4"><div class="flex items-center justify-between"><h2 class="text-3xl font-semibold text-slate-950">Carrusel principal</h2><p class="text-sm text-slate-500">Administrado desde Media &gt; directorio carousel</p></div><div class="grid gap-6">%s</div></section>', $slides);
    }

    protected function renderLatestPosts(int $limit): string
    {
        $items = Post::query()->published()->latest('published_at')->take(max(1, min($limit, 12)))->get();

        if ($items->isEmpty()) {
            return '<div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">Todav?a no hay publicaciones para mostrar.</div>';
        }

        $cards = $items->map(function (Post $post): string {
            return sprintf('<article class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"><h3 class="text-xl font-semibold text-slate-950">%s</h3><p class="mt-3 text-sm text-slate-600">%s</p><a href="/blog/%s" class="mt-6 inline-flex text-sm font-medium text-blue-600">Leer art?culo</a></article>', e($post->title), e($post->excerpt ?? ''), e($post->slug));
        })->implode('');

        return sprintf('<section class="space-y-8"><div><p class="text-sm uppercase tracking-[0.35em] text-slate-400">?ltimas publicaciones</p><h2 class="mt-2 text-3xl font-semibold text-slate-950">Novedades recientes</h2></div><div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">%s</div></section>', $cards);
    }
}
