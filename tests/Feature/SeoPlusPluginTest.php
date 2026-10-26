<?php

use App\Models\Category;
use App\Models\Page;
use App\Models\Plugin;
use App\Models\Post;
use App\Models\Setting;
use App\Support\Cms\CmsHookManager;
use App\Support\Cms\SeoMetadataBuilder;
use Illuminate\Support\Facades\Cache;
use Modules\Plugins\SeoPlus\PluginServiceProvider;

beforeEach(function () {
    app()->register(PluginServiceProvider::class);

    Plugin::query()->updateOrCreate(
        ['slug' => 'seo-plus'],
        [
            'name' => 'SEO Plus & Sitemap',
            'provider' => PluginServiceProvider::class,
            'is_active' => true,
            'settings' => [
                'append_brand_suffix' => true,
                'default_og_image' => 'https://example.com/og-default.jpg',
            ],
        ]
    );

    Setting::query()->updateOrCreate(
        ['key' => 'site_name'],
        ['value' => 'Atlas CMS Testing', 'group' => 'general']
    );
});

it('renders sitemap.xml with home, published pages, posts and categories', function () {
    Page::query()->create([
        'title' => 'Página Pública',
        'slug' => 'pagina-publica',
        'status' => Page::STATUS_PUBLISHED,
        'published_at' => now()->subDay(),
    ]);

    Page::query()->create([
        'title' => 'Borrador Oculto',
        'slug' => 'borrador-oculto',
        'status' => Page::STATUS_DRAFT,
    ]);

    $category = Category::query()->create([
        'name' => 'Tecnología',
        'slug' => 'tecnologia',
    ]);

    $post = Post::query()->create([
        'title' => 'Primer Post SEO',
        'slug' => 'primer-post-seo',
        'status' => Post::STATUS_PUBLISHED,
        'published_at' => now()->subHours(2),
    ]);

    $post->categories()->attach($category->id);

    $response = $this->get('/sitemap.xml');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'application/xml; charset=utf-8');

    $content = $response->getContent();
    expect($content)->toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
        ->toContain('/pagina-publica')
        ->not->toContain('/borrador-oculto')
        ->toContain('/blog/primer-post-seo')
        ->toContain('/blog/category/tecnologia');

    expect(Cache::has('atlas_sitemap_xml'))->toBeTrue();
});

it('invalidates sitemap cache when content is saved or status changed', function () {
    Cache::put('atlas_sitemap_xml', '<cached-sitemap/>', 3600);
    expect(Cache::has('atlas_sitemap_xml'))->toBeTrue();

    $hooks = app(CmsHookManager::class);
    $hooks->doAction('content.saved', new Page);
    expect(Cache::has('atlas_sitemap_xml'))->toBeFalse();

    Cache::put('atlas_sitemap_xml', '<cached-sitemap/>', 3600);
    $hooks->doAction('content.status_changed', new Page, 'draft', 'published');
    expect(Cache::has('atlas_sitemap_xml'))->toBeFalse();
});

it('renders robots.txt pointing to sitemap and disallowing admin paths', function () {
    $response = $this->get('/robots.txt');

    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/plain; charset=utf-8');

    $content = $response->getContent();
    expect($content)->toContain('User-agent: *')
        ->toContain('Disallow: /admin/')
        ->toContain('Disallow: /install/')
        ->toContain('Sitemap: '.url('/sitemap.xml'));
});

it('enhances SEO metadata with OpenGraph, Twitter and Schema.org via hook', function () {
    $builder = app(SeoMetadataBuilder::class);

    $meta = $builder->forContent(
        title: 'Acerca de Nosotros',
        description: 'Conoce nuestra historia y valores',
        canonical: 'https://example.com/acerca-de'
    );

    expect($meta['title'])->toBe('Acerca de Nosotros | '.config('app.name'));
    expect($meta)
        ->toHaveKey('og')
        ->toHaveKey('twitter')
        ->toHaveKey('schema');

    expect($meta['og']['title'])->toBe('Acerca de Nosotros | '.config('app.name'));
    expect($meta['og']['description'])->toBe('Conoce nuestra historia y valores');
    expect($meta['og']['image'])->toBe('https://example.com/og-default.jpg');
    expect($meta['twitter']['card'])->toBe('summary_large_image');
    expect($meta['schema']['@context'])->toBe('https://schema.org');
    expect($meta['schema']['@type'])->toBe('WebPage');
});
