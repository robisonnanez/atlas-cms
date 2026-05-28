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
            ->map(fn (string $directory) => $this->normalizeManifest($directory))
            ->values()
            ->all();
    }

    public function syncDiscovered(): array
    {
        $themes = $this->discover();

        foreach ($themes as $theme) {
            Theme::query()->updateOrCreate(
                ['slug' => $theme['slug']],
                [
                    'name' => $theme['name'],
                    'version' => $theme['version'],
                    'author' => $theme['author'],
                    'settings' => [
                        'defaults' => $theme['settings'],
                        'settings_schema' => $theme['settings_schema'],
                        'zones' => $theme['zones'],
                        'templates' => $theme['templates'],
                        'description' => $theme['description'],
                    ],
                ],
            );
        }

        return $themes;
    }

    protected function normalizeManifest(string $directory): array
    {
        $slug = basename($directory);
        $manifestPath = $directory.'/theme.json';
        $manifest = File::exists($manifestPath)
            ? json_decode(File::get($manifestPath), true, 512, JSON_THROW_ON_ERROR)
            : [];

        return [
            'name' => $manifest['name'] ?? str($slug)->headline()->toString(),
            'slug' => $manifest['slug'] ?? $slug,
            'version' => $manifest['version'] ?? '1.0.0',
            'author' => $manifest['author'] ?? 'Unknown author',
            'description' => $manifest['description'] ?? 'No description provided in the theme manifest yet.',
            'zones' => array_values($manifest['zones'] ?? []),
            'templates' => array_values($manifest['templates'] ?? []),
            'settings' => $manifest['settings'] ?? [],
            'settings_schema' => array_values($manifest['settings_schema'] ?? []),
            'path' => $directory,
        ];
    }
}
