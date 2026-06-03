<?php

namespace App\Providers;

use App\Domain\Content\Contracts\ContentRendererContract;
use App\Domain\Menus\Contracts\MenuResolverContract;
use App\Models\Plugin;
use App\Support\Cms\CmsHookManager;
use App\Support\Cms\ContentRenderer;
use App\Support\Cms\InstallStateStore;
use App\Support\Cms\MenuResolver;
use App\Support\Cms\PluginManager;
use App\Support\Cms\SeoMetadataBuilder;
use App\Support\Cms\ThemeManager;
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
        $this->app->singleton(SeoMetadataBuilder::class);
        $this->app->singleton(ContentRendererContract::class, ContentRenderer::class);
        $this->app->singleton(MenuResolverContract::class, MenuResolver::class);
    }

    public function boot(): void
    {
        $this->registerPluginProviders();
    }

    protected function registerPluginProviders(): void
    {
        try {
            if (! Schema::hasTable('plugins')) {
                return;
            }

            Plugin::query()
                ->whereNotNull('provider')
                ->pluck('provider')
                ->filter()
                ->unique()
                ->each(function (string $provider): void {
                    if (! class_exists($provider)) {
                        return;
                    }

                    if (method_exists($this->app, 'providerIsLoaded') && $this->app->providerIsLoaded($provider)) {
                        return;
                    }

                    $this->app->register($provider);
                });
        } catch (Throwable) {
            // Durante instalación o migraciones iniciales Atlas no debe romper
            // si la tabla de plugins todavía no existe o la BD no está lista.
        }
    }
}
