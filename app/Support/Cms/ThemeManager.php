<?php

namespace App\Support\Cms;

use App\Models\Theme;
use Illuminate\Support\Facades\File;

class ThemeManager
{
    public function __construct(
        protected ?CmsHookManager $hooks = null,
    ) {
        $this->hooks = $hooks ?? app(CmsHookManager::class);
    }

    public function active(): ?Theme
    {
        return Theme::query()->where('is_active', true)->first();
    }

    /**
     * Retorna la configuración estructurada del tema activo para el sitio público.
     * Si no existe tema activo en BD, usa el tema por defecto configurado.
     *
     * @return array<string, mixed>
     */
    public function activePayload(): array
    {
        $theme = $this->active();

        if (! $theme) {
            $default = [
                'name' => 'Atlas Default',
                'slug' => config('atlas.default_theme', 'atlas-default'),
                'version' => '1.0.0',
                'settings' => [
                    'accent' => '#2563eb',
                    'surface' => '#ffffff',
                ],
                'zones' => ['header', 'footer', 'sidebar'],
                'templates' => ['home', 'page', 'post'],
            ];

            return $this->hooks->applyFilters('theme.active_payload', $default, null);
        }

        $settings = $theme->settings ?? [];
        $defaults = $settings['defaults'] ?? [];

        $payload = [
            'id' => $theme->id,
            'name' => $theme->name,
            'slug' => $theme->slug,
            'version' => $theme->version,
            'author' => $theme->author,
            'settings' => is_array($defaults) && ! empty($defaults) ? $defaults : ($settings['settings'] ?? []),
            'zones' => $settings['zones'] ?? ['header', 'footer', 'sidebar'],
            'templates' => $settings['templates'] ?? ['home', 'page', 'post'],
        ];

        return $this->hooks->applyFilters('theme.active_payload', $payload, $theme);
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
