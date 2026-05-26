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
            ->map(function (string $directory): array {
                $manifestPath = $directory.'/plugin.json';

                if (! File::exists($manifestPath)) {
                    return [
                        'name' => basename($directory),
                        'slug' => basename($directory),
                        'version' => '0.1.0',
                    ];
                }

                return json_decode(File::get($manifestPath), true, 512, JSON_THROW_ON_ERROR);
            })->all();
    }
}
