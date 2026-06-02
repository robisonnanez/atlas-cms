<?php

namespace Modules\Plugins\AtlasForgeEditor\Support;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class AtlasForgeEditor
{
    public function definition(): array
    {
        return [
            'key' => 'atlas-forge-editor',
            'name' => 'Atlas Forge Editor',
            'component' => 'AtlasForgeEditor',
            'description' => 'Editor WYSIWYG modular con toolbar, HTML, tablas, enlaces, imágenes, preview y limpieza de contenido.',
            'supports' => ['html', 'media', 'tables', 'code', 'preview', 'autosave'],
            'config' => $this->publicConfig(),
        ];
    }

    public function publicConfig(): array
    {
        return [
            'defaultHeight' => (int) config('atlas-forge-editor.default_height', 560),
            'stickyToolbar' => (bool) config('atlas-forge-editor.sticky_toolbar', true),
            'allowHtmlMode' => (bool) config('atlas-forge-editor.allow_html_mode', true),
            'allowTables' => (bool) config('atlas-forge-editor.allow_tables', true),
            'allowMedia' => (bool) config('atlas-forge-editor.allow_media', true),
            'contentCss' => config('atlas-forge-editor.content_css', ''),
        ];
    }

    public function assets(): array
    {
        return [
            'js' => ['resources/js/plugins/atlas-forge-editor/plugin.js'],
            'css' => ['resources/css/plugins/atlas-forge-editor/editor.css'],
        ];
    }

    public function assetsHtml(): string
    {
        return '<link rel="stylesheet" href="/build/assets/atlas-forge-editor.css"><script type="module" src="/build/assets/atlas-forge-editor.js"></script>';
    }

    public function settingsSchema(): array
    {
        $manifest = json_decode((string) file_get_contents(__DIR__ . '/../../plugin.json'), true) ?: [];

        return [[
            'group' => 'atlas-forge-editor',
            'label' => 'Atlas Forge Editor',
            'fields' => Arr::get($manifest, 'settings_schema', []),
        ]];
    }

    public function navigationItems(): array
    {
        return [[
            'label' => 'Editor visual',
            'route' => 'admin.plugins.atlas-forge-editor.settings',
            'icon' => 'pi pi-pencil',
            'permission' => 'atlas.plugins.view',
            'group' => 'Sistema',
        ]];
    }

    public function sanitizePayload(array $payload): array
    {
        if (! config('atlas-forge-editor.sanitize_on_save', true)) {
            return $payload;
        }

        foreach (['content', 'body', 'excerpt'] as $field) {
            if (isset($payload[$field]) && is_string($payload[$field])) {
                $payload[$field] = $this->sanitizeHtml($payload[$field]);
            }
        }

        return $payload;
    }

    public function sanitizeHtml(string $html): string
    {
        $allowedTags = '<' . implode('><', config('atlas-forge-editor.allowed_tags', [])) . '>';
        $html = strip_tags($html, $allowedTags);

        // Limpieza básica contra scripts inline. Para producción estricta se recomienda HTMLPurifier.
        $html = preg_replace('/\s+on[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $html) ?? $html;
        $html = preg_replace('/javascript\s*:/i', '', $html) ?? $html;

        return trim($html);
    }
}
