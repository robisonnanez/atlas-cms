<?php

namespace App\Support\Cms;

use App\Domain\Content\Contracts\ContentRendererContract;
use Illuminate\Support\HtmlString;
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
        $data = $block['data'] ?? [];

        return match ($type) {
            'heading' => sprintf('<h2 class="atlas-prose-heading">%s</h2>', e($data['text'] ?? '')),
            'image' => sprintf('<figure><img src="%s" alt="%s" class="atlas-prose-image" /></figure>', e($data['url'] ?? ''), e($data['alt'] ?? '')),
            'video' => sprintf('<div class="atlas-embed"><iframe src="%s" loading="lazy" allowfullscreen></iframe></div>', e($data['url'] ?? '')),
            'button' => sprintf('<p><a href="%s" class="atlas-button">%s</a></p>', e($data['url'] ?? '#'), e($data['label'] ?? 'Action')),
            'columns' => $this->renderColumns($data['columns'] ?? []),
            'embed' => sprintf('<div class="atlas-embed">%s</div>', $data['html'] ?? ''),
            'html' => (string) Str::of($data['html'] ?? '')->trim(),
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
}
