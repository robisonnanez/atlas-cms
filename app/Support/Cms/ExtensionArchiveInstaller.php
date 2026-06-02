<?php

namespace App\Support\Cms;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use RuntimeException;
use ZipArchive;

class ExtensionArchiveInstaller
{
    public function installPluginArchive(UploadedFile $archive): array
    {
        return $this->installArchive(
            archive: $archive,
            manifestName: 'plugin.json',
            destinationRoot: config('atlas.plugin_path'),
        );
    }

    public function installThemeArchive(UploadedFile $archive): array
    {
        return $this->installArchive(
            archive: $archive,
            manifestName: 'theme.json',
            destinationRoot: resource_path('views/themes'),
        );
    }

    protected function installArchive(UploadedFile $archive, string $manifestName, string $destinationRoot): array
    {
        if (! class_exists(ZipArchive::class)) {
            throw new RuntimeException('La extensión ZIP no está disponible en el servidor.');
        }

        $tempRoot = storage_path('app/tmp/'.Str::uuid());
        $extractPath = $tempRoot.'/extract';
        File::ensureDirectoryExists($extractPath);

        try {
            $zip = new ZipArchive();
            $status = $zip->open($archive->getRealPath());

            if ($status !== true) {
                throw new RuntimeException('No se pudo abrir el archivo ZIP cargado.');
            }

            $zip->extractTo($extractPath);
            $zip->close();

            $manifestPath = collect(File::allFiles($extractPath))
                ->filter(fn ($file) => $file->getFilename() === $manifestName)
                ->sortBy(fn ($file) => substr_count($file->getPathname(), DIRECTORY_SEPARATOR))
                ->map(fn ($file) => $file->getPathname())
                ->first();

            if (! $manifestPath) {
                throw new RuntimeException("No se encontró {$manifestName} dentro del ZIP.");
            }

            $manifest = json_decode(File::get($manifestPath), true);

            if (! is_array($manifest)) {
                throw new RuntimeException("El archivo {$manifestName} no contiene JSON válido.");
            }

            $packageRoot = dirname($manifestPath);
            $slug = Str::slug($manifest['slug'] ?? basename($packageRoot));
            $targetPath = rtrim($destinationRoot, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.$slug;

            File::ensureDirectoryExists($destinationRoot);

            if (File::isDirectory($targetPath)) {
                File::deleteDirectory($targetPath);
            }

            if (! File::copyDirectory($packageRoot, $targetPath)) {
                throw new RuntimeException('No fue posible copiar el paquete al directorio final.');
            }

            return [
                'slug' => $slug,
                'target_path' => $targetPath,
                'manifest' => $manifest,
            ];
        } finally {
            if (File::isDirectory($tempRoot)) {
                File::deleteDirectory($tempRoot);
            }
        }
    }
}
