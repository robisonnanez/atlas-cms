<?php

namespace App\Support\Cms;

use Composer\Autoload\ClassLoader;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Facades\File;

class PluginAutoloader
{
    protected ?ClassLoader $composerLoader = null;

    /**
     * @var array<string, array<int, string>>
     */
    protected array $registeredNamespaces = [];

    public function __construct()
    {
        $this->resolveComposerLoader();
    }

    protected function resolveComposerLoader(): void
    {
        foreach (spl_autoload_functions() as $function) {
            if (is_array($function) && isset($function[0]) && $function[0] instanceof ClassLoader) {
                $this->composerLoader = $function[0];
                break;
            }
        }

        if (! $this->composerLoader) {
            $autoloadPath = function_exists('base_path') && app() instanceof Application
                ? base_path('vendor/autoload.php')
                : dirname(__DIR__, 4).'/vendor/autoload.php';

            if (file_exists($autoloadPath)) {
                $loader = require $autoloadPath;
                if ($loader instanceof ClassLoader) {
                    $this->composerLoader = $loader;
                }
            }
        }
    }

    /**
     * Registra automáticamente el espacio de nombres de todos los plugins
     * presentes en el directorio indicado.
     *
     * @return array<string, array<string, string>>
     */
    public function registerAll(string $pluginsPath): array
    {
        if (! File::isDirectory($pluginsPath)) {
            return [];
        }

        $directories = File::directories($pluginsPath);
        $registered = [];

        foreach ($directories as $directory) {
            $result = $this->registerPluginDirectory($directory);
            if ($result) {
                $registered[basename($directory)] = $result;
            }
        }

        return $registered;
    }

    /**
     * Registra un plugin específico a partir de su manifiesto plugin.json
     * o por convención de su proveedor (provider).
     *
     * @return array<string, string>|null
     */
    public function registerPluginDirectory(string $directory): ?array
    {
        $manifestPath = $directory.'/plugin.json';
        if (! File::exists($manifestPath)) {
            return null;
        }

        try {
            $manifest = json_decode(File::get($manifestPath), true, 512, JSON_THROW_ON_ERROR);
        } catch (\Throwable) {
            return null;
        }

        if (! is_array($manifest)) {
            return null;
        }

        $registered = [];

        // 1. Registro explícito en plugin.json mediante autoload.psr-4
        if (isset($manifest['autoload']['psr-4']) && is_array($manifest['autoload']['psr-4'])) {
            foreach ($manifest['autoload']['psr-4'] as $prefix => $subPath) {
                $cleanPrefix = rtrim($prefix, '\\').'\\';
                $fullPath = rtrim($directory.'/'.ltrim((string) $subPath, '/\\'), '/\\');
                if (File::isDirectory($fullPath)) {
                    $this->addPsr4($cleanPrefix, $fullPath);
                    $registered[$cleanPrefix] = $fullPath;
                }
            }
        }

        // 2. Registro inferido por convención desde el campo 'provider'
        if (empty($registered) && ! empty($manifest['provider'])) {
            $providerClass = (string) $manifest['provider'];
            $parts = explode('\\', $providerClass);
            if (count($parts) > 1) {
                array_pop($parts); // Remueve el nombre de la clase Provider
                $namespacePrefix = implode('\\', $parts).'\\';
                $srcPath = File::isDirectory($directory.'/src')
                    ? $directory.'/src'
                    : $directory;

                $this->addPsr4($namespacePrefix, $srcPath);
                $registered[$namespacePrefix] = $srcPath;
            }
        }

        return $registered ?: null;
    }

    /**
     * Agrega un mapeo PSR-4 en Composer y en el autoloader SPL como respaldo.
     */
    public function addPsr4(string $prefix, string $path): void
    {
        $prefix = rtrim($prefix, '\\').'\\';
        $path = rtrim($path, '/\\');

        if (isset($this->registeredNamespaces[$prefix]) && in_array($path, $this->registeredNamespaces[$prefix], true)) {
            return;
        }

        $this->registeredNamespaces[$prefix][] = $path;

        if ($this->composerLoader) {
            $this->composerLoader->addPsr4($prefix, $path, true);
        }

        // Respaldo dinámico mediante spl_autoload_register
        spl_autoload_register(function (string $class) use ($prefix, $path): bool {
            if (str_starts_with($class, $prefix)) {
                $relativeClass = substr($class, strlen($prefix));
                $file = $path.'/'.str_replace('\\', '/', $relativeClass).'.php';
                if (file_exists($file)) {
                    require_once $file;

                    return true;
                }
            }

            return false;
        }, true, true);
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function getRegisteredNamespaces(): array
    {
        return $this->registeredNamespaces;
    }
}
