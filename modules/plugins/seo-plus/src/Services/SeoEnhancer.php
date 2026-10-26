<?php

namespace Modules\Plugins\SeoPlus\Services;

use App\Models\Plugin;

class SeoEnhancer
{
    public function enhance(array $payload, string $title, ?string $description = null, ?string $canonical = null): array
    {
        $plugin = Plugin::query()->where('slug', 'seo-plus')->first();
        $settings = $plugin?->settings ?? [];

        $appendSuffix = (bool) ($settings['append_brand_suffix'] ?? true);
        $defaultOgImage = $settings['default_og_image'] ?? null;
        $appName = config('app.name', 'Atlas CMS');

        // Brand suffix on title
        $enhancedTitle = $title;
        if ($appendSuffix && ! str_contains($title, $appName)) {
            $enhancedTitle = "{$title} | {$appName}";
        }

        $payload['title'] = $enhancedTitle;

        // OpenGraph
        $payload['og'] = array_merge($payload['og'] ?? [], [
            'title' => $enhancedTitle,
            'description' => $description ?: "{$appName} content",
            'type' => 'website',
            'url' => $canonical ?: url()->current(),
            'site_name' => $appName,
        ]);

        if ($defaultOgImage && empty($payload['og']['image'])) {
            $payload['og']['image'] = $defaultOgImage;
        }

        // Twitter Cards
        $payload['twitter'] = [
            'card' => ! empty($payload['og']['image']) ? 'summary_large_image' : 'summary',
            'title' => $enhancedTitle,
            'description' => $description ?: "{$appName} content",
            'image' => $payload['og']['image'] ?? null,
        ];

        // Schema.org JSON-LD
        $payload['schema'] = [
            '@context' => 'https://schema.org',
            '@type' => 'WebPage',
            'name' => $title,
            'description' => $description ?: "{$appName} content",
            'url' => $canonical ?: url()->current(),
            'isPartOf' => [
                '@type' => 'WebSite',
                'name' => $appName,
                'url' => url('/'),
            ],
        ];

        return $payload;
    }
}
