<?php

use App\Domain\Content\Contracts\ContentRendererContract;
use App\Domain\Menus\Contracts\MenuResolverContract;
use App\Models\CmsMenu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Setting;
use App\Models\Theme;
use App\Support\Cms\CmsHookManager;
use App\Support\Cms\ThemeManager;

it('allows plugins to intercept and render custom block types in ContentRenderer', function () {
    /** @var CmsHookManager $hooks */
    $hooks = app(CmsHookManager::class);

    // Registra un bloque personalizado 'callout'
    $hooks->addFilter('content.render_block', function ($rendered, array $block) {
        if (($block['type'] ?? '') === 'callout') {
            $text = e($block['data']['text'] ?? '');

            return sprintf('<div class="atlas-callout-box">%s</div>', $text);
        }

        return $rendered;
    });

    /** @var ContentRendererContract $renderer */
    $renderer = app(ContentRendererContract::class);

    $blocks = [
        ['type' => 'heading', 'data' => ['text' => 'Título de prueba']],
        ['type' => 'callout', 'data' => ['text' => 'Mensaje de advertencia']],
    ];

    $html = $renderer->render($blocks);

    expect($html)
        ->toContain('<h2 class="atlas-prose-heading">Título de prueba</h2>')
        ->toContain('<div class="atlas-callout-box">Mensaje de advertencia</div>');

    $hooks->removeAllFilters('content.render_block');
});

it('allows filtering menu resolution through hooks', function () {
    $menu = CmsMenu::query()->create([
        'name' => 'Principal',
        'location' => 'primary',
    ]);

    MenuItem::query()->create([
        'menu_id' => $menu->id,
        'label' => 'Inicio',
        'url' => '/',
        'sort_order' => 1,
    ]);

    /** @var CmsHookManager $hooks */
    $hooks = app(CmsHookManager::class);

    $hooks->addFilter('menu.resolved', function (array $items, string $location) {
        if ($location === 'primary') {
            $items[] = [
                'id' => 9999,
                'label' => 'Enlace Inyectado',
                'url' => '/inyectado',
                'target' => '_blank',
                'children' => [],
            ];
        }

        return $items;
    });

    /** @var MenuResolverContract $resolver */
    $resolver = app(MenuResolverContract::class);
    $resolved = $resolver->resolve('primary');

    expect(collect($resolved)->pluck('label')->all())
        ->toContain('Inicio')
        ->toContain('Enlace Inyectado');

    $hooks->removeAllFilters('menu.resolved');
});

it('provides active theme payload in public site props', function () {
    Theme::query()->create([
        'name' => 'Tema Corporativo Atlas',
        'slug' => 'tema-corporativo',
        'version' => '1.2.0',
        'author' => 'Robison',
        'is_active' => true,
        'settings' => [
            'defaults' => [
                'accent' => '#10b981',
                'surface' => '#0f172a',
            ],
            'zones' => ['header', 'footer', 'sidebar', 'hero'],
            'templates' => ['home', 'page'],
        ],
    ]);

    Setting::query()->create([
        'group' => 'general',
        'key' => 'site.identity',
        'value' => ['name' => 'Atlas CMS'],
        'is_public' => true,
    ]);

    Page::query()->create([
        'title' => 'Inicio',
        'slug' => 'home',
        'status' => 'published',
        'template' => 'home',
        'content_html' => '<p>Home</p>',
        'published_at' => now(),
    ]);

    /** @var ThemeManager $themeManager */
    $themeManager = app(ThemeManager::class);
    $activeTheme = $themeManager->activePayload();

    expect($activeTheme['name'])->toBe('Tema Corporativo Atlas');
    expect($activeTheme['slug'])->toBe('tema-corporativo');
    expect($activeTheme['settings']['accent'])->toBe('#10b981');
    expect($activeTheme['zones'])->toContain('hero');

    $response = $this->get('/');
    $response->assertOk();
});
