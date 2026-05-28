<?php

namespace App\Support\Cms;

use App\Models\Plugin;
use Illuminate\Support\Facades\File;

class PluginManager
{
    public function active(): array
    {
        return Plugin::query()->where('is_active', true)->get()->all();
    }

    public function discover(): array
    {
        $path = config('atlas.plugin_path');

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
        $plugins = $this->discover();

        foreach ($plugins as $plugin) {
            Plugin::query()->updateOrCreate(
                ['slug' => $plugin['slug']],
                [
                    'name' => $plugin['name'],
                    'version' => $plugin['version'],
                    'description' => $plugin['description'],
                    'provider' => $plugin['provider'],
                    'settings' => [
                        'author' => $plugin['author'],
                        'requires' => $plugin['requires'],
                        'hooks' => $plugin['hooks'],
                        'settings_schema' => $plugin['settings_schema'],
                    ],
                ],
            );
        }

        return $plugins;
    }

    protected function normalizeManifest(string $directory): array
    {
        $slug = basename($directory);
        $manifestPath = $directory.'/plugin.json';
        $manifest = File::exists($manifestPath)
            ? json_decode(File::get($manifestPath), true, 512, JSON_THROW_ON_ERROR)
            : [];

        return [
            'name' => $manifest['name'] ?? str($slug)->headline()->toString(),
            'slug' => $manifest['slug'] ?? $slug,
            'version' => $manifest['version'] ?? '0.1.0',
            'description' => $manifest['description'] ?? 'No description provided in the plugin manifest yet.',
            'provider' => $manifest['provider'] ?? null,
            'author' => $manifest['author'] ?? 'Unknown author',
            'requires' => array_values($manifest['requires'] ?? []),
            'hooks' => array_values($manifest['hooks'] ?? []),
            'settings_schema' => array_values($manifest['settings_schema'] ?? []),
            'path' => $directory,
        ];
    }
}
