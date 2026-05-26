<?php

namespace App\Support\Cms;

use App\Models\Theme;
use Illuminate\Support\Facades\File;

class ThemeManager
{
    public function active(): ?Theme
    {
        return Theme::query()->where('is_active', true)->first();
    }

    public function discover(): array
    {
        $path = resource_path('views/themes');

        if (! File::isDirectory($path)) {
            return [];
        }

        return collect(File::directories($path))
            ->map(function (string $directory): array {
                $slug = basename($directory);
                $manifest = File::exists($directory.'/theme.json')
                    ? json_decode(File::get($directory.'/theme.json'), true, 512, JSON_THROW_ON_ERROR)
                    : ['name' => str($slug)->headline()->toString(), 'slug' => $slug];

                return $manifest + ['slug' => $slug];
            })->all();
    }
}
