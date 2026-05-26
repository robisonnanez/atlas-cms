<?php

namespace App\Support\Cms;

class SeoMetadataBuilder
{
    public function forContent(string $title, ?string $description = null, ?string $canonical = null): array
    {
        return [
            'title' => $title,
            'description' => $description ?: config('app.name').' CMS content',
            'canonical' => $canonical,
            'og' => [
                'title' => $title,
                'description' => $description ?: config('app.name'),
            ],
        ];
    }
}
