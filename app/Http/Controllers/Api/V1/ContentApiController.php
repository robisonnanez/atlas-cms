<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Content\Contracts\ContentRendererContract;
use App\Domain\Menus\Contracts\MenuResolverContract;
use App\Domain\Modules\Contracts\ContentModuleManagerContract;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Page;
use App\Models\Post;
use App\Models\Setting;
use App\Models\Tag;
use App\Support\Cms\CmsHookManager;
use App\Support\Cms\SeoMetadataBuilder;
use App\Support\Cms\ThemeManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentApiController extends Controller
{
    public function __construct(
        protected ContentRendererContract $renderer,
        protected MenuResolverContract $menus,
        protected SeoMetadataBuilder $seo,
        protected ThemeManager $themes,
        protected ?CmsHookManager $hooks = null,
        protected ?ContentModuleManagerContract $modules = null,
    ) {
        $this->hooks = $hooks ?? app(CmsHookManager::class);
        $this->modules = $modules ?? (app()->bound(ContentModuleManagerContract::class) ? app(ContentModuleManagerContract::class) : null);
    }

    public function pages(Request $request): JsonResponse
    {
        $limit = min((int) ($request->query('limit', 15)), 50);

        $pages = Page::query()
            ->published()
            ->with(['author:id,name'])
            ->latest('published_at')
            ->paginate($limit);

        $pages->getCollection()->transform(fn (Page $page) => [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'excerpt' => $page->excerpt,
            'published_at' => $page->published_at?->toIso8601String(),
            'author' => $page->author?->name,
            'custom_fields' => $page->customFieldsPayload(),
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $pages->items(),
            'meta' => [
                'current_page' => $pages->currentPage(),
                'last_page' => $pages->lastPage(),
                'total' => $pages->total(),
            ],
        ]);
    }

    public function page(string $slug): JsonResponse
    {
        $page = Page::query()
            ->published()
            ->with(['author:id,name'])
            ->where('slug', $slug)
            ->firstOrFail();

        $payload = [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'template' => $page->template,
            'excerpt' => $page->excerpt,
            'content_json' => $page->content_json ?? [],
            'content_html' => $page->content_html ?: $this->renderer->render($page->content_json ?? []),
            'published_at' => $page->published_at?->toIso8601String(),
            'author' => $page->author?->name,
            'seo' => $this->seo->forContent($page->seo_title ?: $page->title, $page->seo_description, url('/'.$page->slug)),
            'custom_fields' => $page->customFieldsPayload(),
        ];

        $payload = $this->hooks->applyFilters('api.page_payload', $payload, $page);

        return response()->json([
            'status' => 'success',
            'data' => $payload,
        ]);
    }

    public function posts(Request $request): JsonResponse
    {
        $limit = min((int) ($request->query('limit', 12)), 50);

        $query = Post::query()
            ->published()
            ->with(['author:id,name', 'categories:id,name,slug', 'tags:id,name,slug'])
            ->latest('published_at');

        if ($cat = $request->query('category')) {
            $query->whereHas('categories', fn ($q) => $q->where('slug', $cat));
        }

        if ($tag = $request->query('tag')) {
            $query->whereHas('tags', fn ($q) => $q->where('slug', $tag));
        }

        $posts = $query->paginate($limit);

        $posts->getCollection()->transform(fn (Post $post) => [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'published_at' => $post->published_at?->toIso8601String(),
            'author' => $post->author?->name,
            'categories' => $post->categories->map(fn ($c) => ['id' => $c->id, 'name' => $c->name, 'slug' => $c->slug]),
            'tags' => $post->tags->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'slug' => $t->slug]),
            'custom_fields' => $post->customFieldsPayload(),
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    public function post(string $slug): JsonResponse
    {
        $post = Post::query()
            ->published()
            ->with(['author:id,name', 'categories:id,name,slug', 'tags:id,name,slug'])
            ->where('slug', $slug)
            ->firstOrFail();

        $payload = [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'content_json' => $post->content_json ?? [],
            'content_html' => $post->content_html ?: $this->renderer->render($post->content_json ?? []),
            'published_at' => $post->published_at?->toIso8601String(),
            'author' => $post->author?->name,
            'categories' => $post->categories->map(fn ($c) => ['id' => $c->id, 'name' => $c->name, 'slug' => $c->slug]),
            'tags' => $post->tags->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'slug' => $t->slug]),
            'seo' => $this->seo->forContent($post->seo_title ?: $post->title, $post->seo_description, url('/blog/'.$post->slug)),
            'custom_fields' => $post->customFieldsPayload(),
        ];

        $payload = $this->hooks->applyFilters('api.post_payload', $payload, $post);

        return response()->json([
            'status' => 'success',
            'data' => $payload,
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = Category::query()
            ->withCount(['posts' => fn ($q) => $q->published()])
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description']);

        return response()->json([
            'status' => 'success',
            'data' => $categories,
        ]);
    }

    public function tags(): JsonResponse
    {
        $tags = Tag::query()
            ->withCount(['posts' => fn ($q) => $q->published()])
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description']);

        return response()->json([
            'status' => 'success',
            'data' => $tags,
        ]);
    }

    public function menu(string $location = 'primary'): JsonResponse
    {
        $items = $this->menus->resolve($location);

        return response()->json([
            'status' => 'success',
            'location' => $location,
            'data' => $items,
        ]);
    }

    public function positions(Request $request): JsonResponse
    {
        $context = (string) $request->query('context', 'general');
        $page = $request->query('page');
        $positions = $this->modules ? $this->modules->resolvePositionsForContext($context, $page) : [];

        return response()->json([
            'status' => 'success',
            'data' => $positions,
        ]);
    }

    public function position(string $position, Request $request): JsonResponse
    {
        $context = (string) $request->query('context', 'general');
        $page = $request->query('page');
        $positions = $this->modules ? $this->modules->resolvePositionsForContext($context, $page) : [];
        $modules = $positions[$position] ?? [];

        return response()->json([
            'status' => 'success',
            'position' => $position,
            'data' => $modules,
        ]);
    }

    public function settings(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'identity' => Setting::query()->where('key', 'site.identity')->first()?->value ?? ['name' => 'Atlas CMS'],
                'seo' => Setting::query()->where('key', 'site.seo')->first()?->value ?? [],
                'theme' => $this->themes->activePayload(),
                'locale' => app()->getLocale(),
            ],
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('q', ''));

        if (mb_strlen($query) < 2) {
            return response()->json([
                'status' => 'success',
                'query' => $query,
                'data' => ['pages' => [], 'posts' => []],
            ]);
        }

        $pages = Page::query()
            ->published()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('excerpt', 'like', "%{$query}%");
            })
            ->latest('published_at')
            ->take(8)
            ->get(['id', 'title', 'slug', 'excerpt']);

        $posts = Post::query()
            ->published()
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('excerpt', 'like', "%{$query}%");
            })
            ->latest('published_at')
            ->take(8)
            ->get(['id', 'title', 'slug', 'excerpt']);

        return response()->json([
            'status' => 'success',
            'query' => $query,
            'data' => [
                'pages' => $pages->map(fn ($p) => [
                    'id' => $p->id,
                    'title' => $p->title,
                    'slug' => $p->slug,
                    'url' => '/'.$p->slug,
                    'excerpt' => $p->excerpt,
                ]),
                'posts' => $posts->map(fn ($p) => [
                    'id' => $p->id,
                    'title' => $p->title,
                    'slug' => $p->slug,
                    'url' => '/blog/'.$p->slug,
                    'excerpt' => $p->excerpt,
                ]),
            ],
        ]);
    }
}
