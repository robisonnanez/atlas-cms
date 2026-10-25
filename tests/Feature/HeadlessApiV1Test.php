<?php

use App\Models\Category;
use App\Models\CmsMenu;
use App\Models\CustomField;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Post;
use App\Models\Setting;
use App\Models\Tag;

it('returns published pages with custom fields in API v1', function () {
    $field = CustomField::query()->create([
        'name' => 'Subtítulo',
        'slug' => 'subtitle',
        'type' => 'text',
        'target_type' => 'page',
    ]);

    $page = Page::query()->create([
        'title' => 'Nuestra Empresa',
        'slug' => 'empresa',
        'status' => 'published',
        'template' => 'about',
        'excerpt' => 'Historia y equipo de la empresa.',
        'published_at' => now(),
    ]);

    $page->setCustomField('subtitle', 'Líderes en tecnología');

    // Listado de páginas
    $response = $this->getJson('/api/v1/pages');
    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonFragment(['slug' => 'empresa']);

    // Detalle de página individual
    $detailResponse = $this->getJson('/api/v1/pages/empresa');
    $detailResponse->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.slug', 'empresa')
        ->assertJsonPath('data.custom_fields.subtitle.value', 'Líderes en tecnología');

    // 404 para página inexistente
    $this->getJson('/api/v1/pages/no-existe')->assertNotFound();
});

it('returns published posts with categories and tags in API v1', function () {
    $cat = Category::query()->create(['name' => 'Tecnología', 'slug' => 'tecnologia']);
    $tag = Tag::query()->create(['name' => 'Laravel', 'slug' => 'laravel']);

    $post = Post::query()->create([
        'title' => 'Lanzamiento de Atlas CMS v1',
        'slug' => 'lanzamiento-atlas-v1',
        'status' => 'published',
        'excerpt' => 'Todo sobre la nueva versión.',
        'published_at' => now(),
    ]);

    $post->categories()->attach($cat->id);
    $post->tags()->attach($tag->id);

    $response = $this->getJson('/api/v1/posts');
    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonFragment(['slug' => 'lanzamiento-atlas-v1']);

    $detailResponse = $this->getJson('/api/v1/posts/lanzamiento-atlas-v1');
    $detailResponse->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.slug', 'lanzamiento-atlas-v1')
        ->assertJsonPath('data.categories.0.slug', 'tecnologia')
        ->assertJsonPath('data.tags.0.slug', 'laravel');
});

it('returns menu tree, settings and search via API v1', function () {
    // Menú
    $menu = CmsMenu::query()->create(['name' => 'Header', 'location' => 'primary']);
    MenuItem::query()->create(['menu_id' => $menu->id, 'label' => 'Inicio', 'url' => '/', 'sort_order' => 1]);

    $menuResponse = $this->getJson('/api/v1/menus/primary');
    $menuResponse->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonFragment(['label' => 'Inicio']);

    // Settings
    Setting::query()->create([
        'group' => 'general',
        'key' => 'site.identity',
        'value' => ['name' => 'Atlas CMS Headless'],
        'is_public' => true,
    ]);

    $settingsResponse = $this->getJson('/api/v1/settings/public');
    $settingsResponse->assertOk()
        ->assertJsonPath('data.identity.name', 'Atlas CMS Headless');

    // Búsqueda
    Post::query()->create([
        'title' => 'Tutorial Especial de Headless',
        'slug' => 'tutorial-headless',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $searchResponse = $this->getJson('/api/v1/search?q=Headless');
    $searchResponse->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonFragment(['slug' => 'tutorial-headless']);
});
