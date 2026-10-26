<?php

namespace App\Support\Cms;

use App\Domain\Menus\Contracts\MenuResolverContract;
use App\Domain\Modules\Contracts\ContentModuleManagerContract;
use App\Models\Category;
use App\Models\CmsMenu;
use App\Models\ContentModule;
use App\Models\Post;

class ContentModuleManager implements ContentModuleManagerContract
{
    public function __construct(
        protected ?CmsHookManager $hooks = null,
        protected ?ThemeManager $themeManager = null,
        protected ?MenuResolverContract $menuResolver = null,
    ) {
        $this->hooks = $hooks ?? app(CmsHookManager::class);
        $this->themeManager = $themeManager ?? app(ThemeManager::class);
        $this->menuResolver = $menuResolver ?? app(MenuResolverContract::class);
    }

    public function getAvailablePositions(?string $themeSlug = null): array
    {
        $themePayload = $this->themeManager->activePayload();
        $themeZones = $themePayload['zones'] ?? ['header', 'footer', 'sidebar'];

        $standardPositions = [
            'top_bar' => ['key' => 'top_bar', 'label' => 'Barra Superior', 'description' => 'Franja informativa superior del sitio'],
            'header' => ['key' => 'header', 'label' => 'Encabezado', 'description' => 'Zona del encabezado junto a la navegación'],
            'banner' => ['key' => 'banner', 'label' => 'Banner Principal', 'description' => 'Zona destacada antes del contenido'],
            'content_top' => ['key' => 'content_top', 'label' => 'Superior de Contenido', 'description' => 'Inmediatamente antes del cuerpo del contenido'],
            'sidebar' => ['key' => 'sidebar', 'label' => 'Barra Lateral', 'description' => 'Columna lateral para widgets y navegación'],
            'content_bottom' => ['key' => 'content_bottom', 'label' => 'Inferior de Contenido', 'description' => 'Inmediatamente después del cuerpo del contenido'],
            'footer' => ['key' => 'footer', 'label' => 'Pie de Página', 'description' => 'Zona inferior del sitio'],
        ];

        $positions = $standardPositions;

        foreach ($themeZones as $zone) {
            $key = (string) $zone;
            if (! isset($positions[$key])) {
                $positions[$key] = [
                    'key' => $key,
                    'label' => str($key)->replace(['_', '-'], ' ')->headline()->toString(),
                    'description' => "Posición específica del tema: {$key}",
                ];
            }
        }

        $result = array_values($positions);

        return $this->hooks->applyFilters('modules.positions', $result, $themeSlug);
    }

    public function getAvailableTypes(): array
    {
        $types = [
            'custom_html' => [
                'type' => 'custom_html',
                'label' => 'HTML Personalizado',
                'description' => 'Contenido HTML libre, enlaces enriquecidos o scripts embebidos',
                'icon' => 'pi pi-code',
                'default_content' => ['html' => ''],
            ],
            'menu' => [
                'type' => 'menu',
                'label' => 'Menú de Navegación',
                'description' => 'Renderiza un menú de navegación creado en Atlas CMS',
                'icon' => 'pi pi-bars',
                'default_content' => ['menu_id' => null, 'layout' => 'vertical'],
            ],
            'recent_posts' => [
                'type' => 'recent_posts',
                'label' => 'Publicaciones Recientes',
                'description' => 'Muestra las últimas entradas del blog con fecha y resumen',
                'icon' => 'pi pi-list',
                'default_content' => ['limit' => 5, 'show_date' => true, 'show_excerpt' => false],
            ],
            'categories' => [
                'type' => 'categories',
                'label' => 'Listado de Categorías',
                'description' => 'Lista de categorías con cantidad de publicaciones publicadas',
                'icon' => 'pi pi-folder',
                'default_content' => ['show_count' => true],
            ],
            'search_bar' => [
                'type' => 'search_bar',
                'label' => 'Buscador',
                'description' => 'Caja de búsqueda rápida para el sitio público',
                'icon' => 'pi pi-search',
                'default_content' => ['placeholder' => 'Buscar en el sitio...'],
            ],
            'contact_info' => [
                'type' => 'contact_info',
                'label' => 'Información de Contacto',
                'description' => 'Tarjeta con teléfono, correo, dirección y enlaces sociales',
                'icon' => 'pi pi-phone',
                'default_content' => ['email' => '', 'phone' => '', 'address' => '', 'title' => 'Contacto'],
            ],
        ];

        return $this->hooks->applyFilters('modules.types', $types);
    }

    public function matchesAssignment(ContentModule $module, string $contextType, ?string $pageSlug = null): bool
    {
        $assignment = $module->assignment ?? [];
        $rule = $assignment['rule'] ?? 'all';
        $pages = (array) ($assignment['pages'] ?? []);

        $matches = match ($rule) {
            'all' => true,
            'home_only' => $contextType === 'home' || $pageSlug === 'home',
            'blog_only' => in_array($contextType, ['blog', 'post', 'category', 'tag'], true),
            'specific_pages' => in_array($pageSlug, $pages, true) || ($contextType === 'home' && in_array('home', $pages, true)),
            'except_pages' => ! in_array($pageSlug, $pages, true) && ! ($contextType === 'home' && in_array('home', $pages, true)),
            default => true,
        };

        return (bool) $this->hooks->applyFilters('modules.matches_assignment', $matches, $module, $contextType, $pageSlug);
    }

    public function resolveModulePayload(ContentModule $module): array
    {
        $content = $module->content ?? [];
        $data = [];

        switch ($module->type) {
            case 'custom_html':
                $rawHtml = (string) ($content['html'] ?? '');
                $html = $this->hooks->applyFilters('modules.render_html', $rawHtml, $module);
                $data = ['html' => $html];
                break;

            case 'menu':
                $menuId = ! empty($content['menu_id']) ? (int) $content['menu_id'] : null;
                $menuItems = [];
                $menuName = null;

                if ($menuId) {
                    $menuItems = $this->menuResolver->resolveById($menuId);
                    $menu = CmsMenu::query()->find($menuId);
                    $menuName = $menu?->name;
                }

                $data = [
                    'menu_id' => $menuId,
                    'menu_name' => $menuName,
                    'layout' => $content['layout'] ?? 'vertical',
                    'items' => $menuItems,
                ];
                break;

            case 'recent_posts':
                $limit = max(1, min(20, (int) ($content['limit'] ?? 5)));
                $posts = Post::query()
                    ->published()
                    ->latest('published_at')
                    ->take($limit)
                    ->get(['id', 'title', 'slug', 'published_at', 'excerpt'])
                    ->map(fn (Post $post) => [
                        'id' => $post->id,
                        'title' => $post->title,
                        'slug' => $post->slug,
                        'url' => '/blog/'.$post->slug,
                        'published_at' => $post->published_at?->toIso8601String(),
                        'excerpt' => $post->excerpt,
                    ])
                    ->all();

                $data = [
                    'posts' => $posts,
                    'limit' => $limit,
                    'show_date' => (bool) ($content['show_date'] ?? true),
                    'show_excerpt' => (bool) ($content['show_excerpt'] ?? false),
                ];
                break;

            case 'categories':
                $showCount = (bool) ($content['show_count'] ?? true);
                $categories = Category::query()
                    ->whereHas('posts', fn ($q) => $q->published())
                    ->withCount(['posts' => fn ($q) => $q->published()])
                    ->orderBy('name')
                    ->get(['id', 'name', 'slug'])
                    ->map(fn (Category $cat) => [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                        'url' => '/category/'.$cat->slug,
                        'posts_count' => $cat->posts_count ?? 0,
                    ])
                    ->all();

                $data = [
                    'categories' => $categories,
                    'show_count' => $showCount,
                ];
                break;

            case 'search_bar':
                $data = [
                    'placeholder' => $content['placeholder'] ?? 'Buscar en el sitio...',
                    'action' => url('/search'),
                ];
                break;

            case 'contact_info':
                $data = [
                    'title' => $content['title'] ?? 'Contacto',
                    'email' => $content['email'] ?? null,
                    'phone' => $content['phone'] ?? null,
                    'address' => $content['address'] ?? null,
                    'hours' => $content['hours'] ?? null,
                ];
                break;

            default:
                $data = $this->hooks->applyFilters("modules.resolve_payload.{$module->type}", $content, $module);
                break;
        }

        $payload = [
            'id' => $module->id,
            'title' => $module->title,
            'show_title' => (bool) $module->show_title,
            'type' => $module->type,
            'position' => $module->position,
            'custom_classes' => $module->custom_classes,
            'data' => $data,
        ];

        return $this->hooks->applyFilters('modules.resolve_payload', $payload, $module);
    }

    public function resolvePositionsForContext(string $contextType, ?string $pageSlug = null, ?string $themeSlug = null): array
    {
        if ($themeSlug === null) {
            $activeTheme = $this->themeManager->active();
            $themeSlug = $activeTheme?->slug;
        }

        $modules = ContentModule::query()
            ->active()
            ->forTheme($themeSlug)
            ->ordered()
            ->get();

        $grouped = [];

        foreach ($modules as $module) {
            if (! $this->matchesAssignment($module, $contextType, $pageSlug)) {
                continue;
            }

            $pos = (string) $module->position;
            if (! isset($grouped[$pos])) {
                $grouped[$pos] = [];
            }

            $grouped[$pos][] = $this->resolveModulePayload($module);
        }

        return $this->hooks->applyFilters('modules.resolved_positions', $grouped, $contextType, $pageSlug);
    }
}
