<?php

namespace App\Providers;

use App\Domain\Content\Contracts\ContentRendererContract;
use App\Domain\Menus\Contracts\MenuResolverContract;
use App\Models\Plugin;
use App\Support\Cms\CmsHookManager;
use App\Support\Cms\ContentRenderer;
use App\Support\Cms\InstallStateStore;
use App\Support\Cms\MenuResolver;
use App\Support\Cms\PluginAutoloader;
use App\Support\Cms\PluginManager;
use App\Support\Cms\SeoMetadataBuilder;
use App\Support\Cms\ThemeManager;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Throwable;

class CmsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(CmsHookManager::class);
        $this->app->singleton(InstallStateStore::class);
        $this->app->singleton(ThemeManager::class);
        $this->app->singleton(PluginManager::class);
        $this->app->singleton(PluginAutoloader::class);
        $this->app->singleton(SeoMetadataBuilder::class);
        $this->app->singleton(ContentRendererContract::class, ContentRenderer::class);
        $this->app->singleton(MenuResolverContract::class, MenuResolver::class);

        $this->autoloadPlugins();
    }

    public function boot(): void
    {
        $this->registerPluginProviders();
    }

    /**
     * Autocarga dinámica de espacios de nombres para todos los plugins
     * presentes en el directorio de módulos de Atlas CMS.
     */
    protected function autoloadPlugins(): void
    {
        try {
            $pluginPath = config('atlas.plugin_path', base_path('modules/plugins'));
            /** @var PluginAutoloader $autoloader */
            $autoloader = $this->app->make(PluginAutoloader::class);
            $autoloader->registerAll($pluginPath);
        } catch (Throwable) {
            // Silencioso durante etapas tempranas de arranque
        }
    }

    protected function registerPluginProviders(): void
    {
        try {
            if (! Schema::hasTable('plugins')) {
                return;
            }

            $pluginPath = config('atlas.plugin_path', base_path('modules/plugins'));

            Plugin::query()
                ->where('is_active', true)
                ->whereNotNull('provider')
                ->get(['slug', 'provider'])
                ->filter(fn (Plugin $plugin) => ! empty($plugin->provider))
                ->each(function (Plugin $plugin) use ($pluginPath): void {
                    $provider = (string) $plugin->provider;

                    if (! class_exists($provider)) {
                        return;
                    }

                    if (method_exists($this->app, 'providerIsLoaded') && $this->app->providerIsLoaded($provider)) {
                        return;
                    }

                    $this->app->register($provider);

                    // Registro automático de migraciones si el plugin contiene directorio database/migrations
                    $migrationsDir = $pluginPath.'/'.$plugin->slug.'/database/migrations';
                    if (File::isDirectory($migrationsDir)) {
                        $this->loadMigrationsFrom($migrationsDir);
                    }
                });
        } catch (Throwable) {
            // Durante instalación o migraciones iniciales Atlas no debe romper
            // si la tabla de plugins todavía no existe o la BD no está lista.
        }
    }
}
