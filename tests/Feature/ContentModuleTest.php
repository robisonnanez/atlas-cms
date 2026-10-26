<?php

use App\Domain\Modules\Contracts\ContentModuleManagerContract;
use App\Models\Category;
use App\Models\CmsMenu;
use App\Models\ContentModule;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Permission;
use App\Models\Post;
use App\Models\User;
use App\Support\Cms\CmsHookManager;
use Spatie\Activitylog\Models\Activity;

beforeEach(function () {
    Permission::findOrCreate('atlas.content_modules.view', 'web');
    Permission::findOrCreate('atlas.content_modules.manage', 'web');
});

it('discovers standard positions and theme zones through ContentModuleManager', function () {
    /** @var ContentModuleManagerContract $manager */
    $manager = app(ContentModuleManagerContract::class);

    $positions = $manager->getAvailablePositions();

    expect($positions)->toBeArray();
    $keys = collect($positions)->pluck('key')->all();

    expect($keys)->toContain('sidebar')
        ->toContain('header')
        ->toContain('footer')
        ->toContain('top_bar')
        ->toContain('banner')
        ->toContain('content_top')
        ->toContain('content_bottom');
});

it('provides built-in module types and allows plugins to register new types via hook', function () {
    /** @var ContentModuleManagerContract $manager */
    $manager = app(ContentModuleManagerContract::class);

    $types = $manager->getAvailableTypes();
    expect($types)->toHaveKey('custom_html')
        ->toHaveKey('menu')
        ->toHaveKey('recent_posts')
        ->toHaveKey('categories')
        ->toHaveKey('search_bar')
        ->toHaveKey('contact_info');

    // Register a custom widget type via hook
    $hooks = app(CmsHookManager::class);
    $hooks->addFilter('modules.types', function (array $allTypes) {
        $allTypes['newsletter'] = [
            'type' => 'newsletter',
            'label' => 'Boletín de Noticias',
            'description' => 'Formulario de suscripción',
            'icon' => 'pi pi-envelope',
            'default_content' => ['provider' => 'mailchimp'],
        ];

        return $allTypes;
    });

    $extendedTypes = $manager->getAvailableTypes();
    expect($extendedTypes)->toHaveKey('newsletter');

    $hooks->removeAllFilters('modules.types');
});

it('correctly evaluates assignment rules for modules across different contexts', function () {
    /** @var ContentModuleManagerContract $manager */
    $manager = app(ContentModuleManagerContract::class);

    $modAll = new ContentModule([
        'title' => 'Módulo Global',
        'type' => 'custom_html',
        'position' => 'sidebar',
        'assignment' => ['rule' => 'all'],
    ]);

    $modHome = new ContentModule([
        'title' => 'Solo Portada',
        'type' => 'custom_html',
        'position' => 'banner',
        'assignment' => ['rule' => 'home_only'],
    ]);

    $modBlog = new ContentModule([
        'title' => 'Solo Blog',
        'type' => 'custom_html',
        'position' => 'sidebar',
        'assignment' => ['rule' => 'blog_only'],
    ]);

    $modSpecific = new ContentModule([
        'title' => 'Páginas Específicas',
        'type' => 'custom_html',
        'position' => 'sidebar',
        'assignment' => ['rule' => 'specific_pages', 'pages' => ['nosotros', 'servicios']],
    ]);

    $modExcept = new ContentModule([
        'title' => 'Excepto Contacto',
        'type' => 'custom_html',
        'position' => 'sidebar',
        'assignment' => ['rule' => 'except_pages', 'pages' => ['contacto']],
    ]);

    // Test context: home
    expect($manager->matchesAssignment($modAll, 'home', 'home'))->toBeTrue();
    expect($manager->matchesAssignment($modHome, 'home', 'home'))->toBeTrue();
    expect($manager->matchesAssignment($modBlog, 'home', 'home'))->toBeFalse();
    expect($manager->matchesAssignment($modSpecific, 'home', 'home'))->toBeFalse();
    expect($manager->matchesAssignment($modExcept, 'home', 'home'))->toBeTrue();

    // Test context: blog
    expect($manager->matchesAssignment($modHome, 'blog'))->toBeFalse();
    expect($manager->matchesAssignment($modBlog, 'blog'))->toBeTrue();

    // Test context: specific page 'nosotros'
    expect($manager->matchesAssignment($modSpecific, 'page', 'nosotros'))->toBeTrue();
    expect($manager->matchesAssignment($modSpecific, 'page', 'otra-pagina'))->toBeFalse();

    // Test context: except page 'contacto'
    expect($manager->matchesAssignment($modExcept, 'page', 'contacto'))->toBeFalse();
    expect($manager->matchesAssignment($modExcept, 'page', 'otra-pagina'))->toBeTrue();
});

it('resolves dynamic module data for custom_html, menu, recent_posts, categories, search_bar and contact_info', function () {
    /** @var ContentModuleManagerContract $manager */
    $manager = app(ContentModuleManagerContract::class);

    // 1. Custom HTML module
    $htmlMod = ContentModule::query()->create([
        'title' => 'Banner Promo',
        'type' => 'custom_html',
        'position' => 'top_bar',
        'content' => ['html' => '<strong>Oferta especial</strong>'],
    ]);
    $htmlPayload = $manager->resolveModulePayload($htmlMod);
    expect($htmlPayload['data']['html'])->toBe('<strong>Oferta especial</strong>');

    // 2. Menu module
    $menu = CmsMenu::query()->create(['name' => 'Menú Lateral', 'location' => 'sidebar_nav']);
    MenuItem::query()->create(['menu_id' => $menu->id, 'label' => 'Inicio', 'url' => '/', 'sort_order' => 1]);
    MenuItem::query()->create(['menu_id' => $menu->id, 'label' => 'Blog', 'url' => '/blog', 'sort_order' => 2]);

    $menuMod = ContentModule::query()->create([
        'title' => 'Navegación Lateral',
        'type' => 'menu',
        'position' => 'sidebar',
        'content' => ['menu_id' => $menu->id, 'layout' => 'vertical'],
    ]);
    $menuPayload = $manager->resolveModulePayload($menuMod);
    expect($menuPayload['data']['menu_id'])->toBe($menu->id);
    expect($menuPayload['data']['items'])->toHaveCount(2);

    // 3. Recent posts module
    Post::query()->create(['title' => 'Post 1', 'slug' => 'post-1', 'status' => Post::STATUS_PUBLISHED, 'published_at' => now()->subDay()]);
    Post::query()->create(['title' => 'Post 2', 'slug' => 'post-2', 'status' => Post::STATUS_PUBLISHED, 'published_at' => now()]);

    $postsMod = ContentModule::query()->create([
        'title' => 'Últimas Noticias',
        'type' => 'recent_posts',
        'position' => 'sidebar',
        'content' => ['limit' => 3, 'show_date' => true],
    ]);
    $postsPayload = $manager->resolveModulePayload($postsMod);
    expect($postsPayload['data']['posts'])->toHaveCount(2);
    expect($postsPayload['data']['posts'][0]['title'])->toBe('Post 2');

    // 4. Categories module
    $cat = Category::query()->create(['name' => 'Diseño', 'slug' => 'diseno']);
    $post = Post::query()->first();
    $post->categories()->attach($cat->id);

    $catMod = ContentModule::query()->create([
        'title' => 'Temas del Blog',
        'type' => 'categories',
        'position' => 'sidebar',
        'content' => ['show_count' => true],
    ]);
    $catPayload = $manager->resolveModulePayload($catMod);
    expect($catPayload['data']['categories'])->toHaveCount(1);
    expect($catPayload['data']['categories'][0]['name'])->toBe('Diseño');

    // 5. Search bar module
    $searchMod = ContentModule::query()->create([
        'title' => 'Buscar',
        'type' => 'search_bar',
        'position' => 'header',
        'content' => ['placeholder' => 'Buscar artículos...'],
    ]);
    $searchPayload = $manager->resolveModulePayload($searchMod);
    expect($searchPayload['data']['placeholder'])->toBe('Buscar artículos...');

    // 6. Contact info module
    $contactMod = ContentModule::query()->create([
        'title' => 'Atención',
        'type' => 'contact_info',
        'position' => 'footer',
        'content' => ['email' => 'soporte@atlas.com', 'phone' => '+123456789'],
    ]);
    $contactPayload = $manager->resolveModulePayload($contactMod);
    expect($contactPayload['data']['email'])->toBe('soporte@atlas.com');
});

it('injects active modules by position into public site props', function () {
    ContentModule::query()->create([
        'title' => 'Banner Superior',
        'type' => 'custom_html',
        'position' => 'top_bar',
        'order' => 1,
        'is_active' => true,
        'content' => ['html' => '<span>Notificación del sitio</span>'],
        'assignment' => ['rule' => 'all'],
    ]);

    ContentModule::query()->create([
        'title' => 'Módulo Desactivado',
        'type' => 'custom_html',
        'position' => 'top_bar',
        'order' => 2,
        'is_active' => false,
        'content' => ['html' => '<span>Oculto</span>'],
    ]);

    $response = $this->get('/');
    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->has('site.positions.top_bar', 1)
        ->where('site.positions.top_bar.0.title', 'Banner Superior')
    );
});

it('exposes theme positions and modules via Headless API v1 endpoints', function () {
    ContentModule::query()->create([
        'title' => 'Widget Lateral',
        'type' => 'custom_html',
        'position' => 'sidebar',
        'is_active' => true,
        'content' => ['html' => '<p>Contenido API</p>'],
        'assignment' => ['rule' => 'all'],
    ]);

    // All positions
    $response = $this->getJson('/api/v1/positions');
    $response->assertOk();
    $response->assertJsonStructure([
        'status',
        'data' => [
            'sidebar',
        ],
    ]);

    // Single position
    $singleResponse = $this->getJson('/api/v1/positions/sidebar');
    $singleResponse->assertOk();
    $singleResponse->assertJson([
        'status' => 'success',
        'position' => 'sidebar',
    ]);
    expect($singleResponse->json('data'))->toHaveCount(1);
    expect($singleResponse->json('data.0.title'))->toBe('Widget Lateral');
});

it('protects admin content-modules endpoints with authentication and permissions', function () {
    $this->get('/admin/content-modules')->assertRedirect('/login');

    $user = User::factory()->create();

    // Without permission -> 403 Forbidden
    $this->actingAs($user)->get('/admin/content-modules')->assertForbidden();

    // With view permission -> 200 OK
    $user->givePermissionTo('atlas.content_modules.view');
    $this->actingAs($user)->get('/admin/content-modules')->assertOk();
});

it('allows authorized users to create, update, reorder, toggle and delete content modules', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('atlas.content_modules.view', 'atlas.content_modules.manage');

    // 1. Create module
    $storeResponse = $this->actingAs($user)->post('/admin/content-modules', [
        'title' => 'Nuevo Módulo de Prueba',
        'show_title' => true,
        'type' => 'custom_html',
        'position' => 'sidebar',
        'order' => 1,
        'is_active' => true,
        'content' => ['html' => '<p>Hola Mundo</p>'],
        'assignment' => ['rule' => 'all'],
    ]);

    $storeResponse->assertRedirect(route('admin.content-modules.index'));
    $this->assertDatabaseHas('content_modules', [
        'title' => 'Nuevo Módulo de Prueba',
        'position' => 'sidebar',
        'is_active' => true,
    ]);

    $module = ContentModule::query()->where('title', 'Nuevo Módulo de Prueba')->first();
    expect($module)->not->toBeNull();

    // 2. Update module
    $updateResponse = $this->actingAs($user)->put("/admin/content-modules/{$module->id}", [
        'title' => 'Módulo Actualizado',
        'show_title' => false,
        'type' => 'custom_html',
        'position' => 'footer',
        'order' => 2,
        'is_active' => true,
        'content' => ['html' => '<p>Modificado</p>'],
        'assignment' => ['rule' => 'home_only'],
    ]);

    $updateResponse->assertRedirect(route('admin.content-modules.index'));
    expect($module->fresh()->title)->toBe('Módulo Actualizado');
    expect($module->fresh()->position)->toBe('footer');
    expect($module->fresh()->show_title)->toBeFalse();

    // 3. Toggle active
    $toggleResponse = $this->actingAs($user)->post("/admin/content-modules/{$module->id}/toggle");
    $toggleResponse->assertRedirect();
    expect($module->fresh()->is_active)->toBeFalse();

    // 4. Reorder
    $module2 = ContentModule::query()->create([
        'title' => 'Módulo 2',
        'type' => 'custom_html',
        'position' => 'footer',
        'order' => 10,
    ]);

    $reorderResponse = $this->actingAs($user)->post('/admin/content-modules/reorder', [
        'items' => [
            ['id' => $module->id, 'order' => 5, 'position' => 'footer'],
            ['id' => $module2->id, 'order' => 1, 'position' => 'footer'],
        ],
    ]);
    $reorderResponse->assertRedirect();
    expect($module->fresh()->order)->toBe(5);
    expect($module2->fresh()->order)->toBe(1);

    // 5. Delete module
    $deleteResponse = $this->actingAs($user)->delete("/admin/content-modules/{$module->id}");
    $deleteResponse->assertRedirect(route('admin.content-modules.index'));
    $this->assertDatabaseMissing('content_modules', ['id' => $module->id]);

    // 6. Verify activity log
    $activity = Activity::query()
        ->where('log_name', 'content_modules')
        ->latest('id')
        ->first();
    expect($activity)->not->toBeNull();
});
