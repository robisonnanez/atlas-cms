<?php

namespace App\Support\Cms;

class SeoMetadataBuilder
{
    public function __construct(
        protected ?CmsHookManager $hooks = null,
    ) {
        $this->hooks = $hooks ?? (app()->bound(CmsHookManager::class) ? app(CmsHookManager::class) : null);
    }

    public function forContent(string $title, ?string $description = null, ?string $canonical = null): array
    {
        $payload = [
            'title' => $title,
            'description' => $description ?: config('app.name').' CMS content',
            'canonical' => $canonical,
            'og' => [
                'title' => $title,
                'description' => $description ?: config('app.name'),
            ],
        ];

        if ($this->hooks) {
            $payload = $this->hooks->applyFilters('seo.meta', $payload, $title, $description, $canonical);
        }

        return $payload;
    }
}
