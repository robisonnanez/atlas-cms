<?php

namespace Modules\Plugins\SeoPlus;

use App\Support\Cms\CmsHookManager;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;
use Modules\Plugins\SeoPlus\Services\SeoEnhancer;

class PluginServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(SeoEnhancer::class);
    }

    public function boot(): void
    {
        $routesPath = __DIR__.'/../routes/web.php';
        if (file_exists($routesPath)) {
            $this->loadRoutesFrom($routesPath);
        }

        if ($this->app->bound(CmsHookManager::class)) {
            /** @var CmsHookManager $hooks */
            $hooks = $this->app->make(CmsHookManager::class);

            $hooks->addFilter('seo.meta', function (array $payload, string $title, ?string $description = null, ?string $canonical = null): array {
                /** @var SeoEnhancer $enhancer */
                $enhancer = $this->app->make(SeoEnhancer::class);

                return $enhancer->enhance($payload, $title, $description, $canonical);
            }, 10);

            $clearSitemap = function (): void {
                Cache::forget('atlas_sitemap_xml');
            };

            $hooks->addAction('content.saved', $clearSitemap);
            $hooks->addAction('content.status_changed', $clearSitemap);
        }
    }
}
