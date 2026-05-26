<?php

namespace App\Providers;

use App\Domain\Content\Contracts\ContentRendererContract;
use App\Domain\Menus\Contracts\MenuResolverContract;
use App\Support\Cms\CmsHookManager;
use App\Support\Cms\ContentRenderer;
use App\Support\Cms\InstallStateStore;
use App\Support\Cms\MenuResolver;
use App\Support\Cms\PluginManager;
use App\Support\Cms\SeoMetadataBuilder;
use App\Support\Cms\ThemeManager;
use Illuminate\Support\ServiceProvider;

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
}
