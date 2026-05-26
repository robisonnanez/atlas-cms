<?php

namespace App\Http\Controllers;

use App\Domain\Content\Contracts\ContentRendererContract;
use App\Domain\Menus\Contracts\MenuResolverContract;
use App\Models\Category;
use App\Models\Page;
use App\Models\Post;
use App\Models\Setting;
use App\Support\Cms\SeoMetadataBuilder;
use Inertia\Inertia;
use Inertia\Response;

class PublicSiteController extends Controller
{
    public function __construct(
        protected ContentRendererContract $renderer,
        protected MenuResolverContract $menus,
        protected SeoMetadataBuilder $seo,
    ) {
    }

    public function home(): Response
    {
        $page = Page::query()->where('slug', 'home')->first();

        return Inertia::render('site/home', [
            'site' => $this->siteProps(),
            'menu' => $this->menus->resolve('primary'),
            'hero' => $page ? $this->serializePage($page) : null,
            'posts' => Post::query()->published()->latest('published_at')->take(6)->get(),
        ]);
    }

    public function page(Page $page): Response
    {
        abort_unless($page->status === 'published', 404);

        return Inertia::render('site/page', [
            'site' => $this->siteProps(),
            'menu' => $this->menus->resolve('primary'),
            'page' => $this->serializePage($page),
            'seo' => $this->seo->forContent($page->seo_title ?: $page->title, $page->seo_description, url('/'.$page->slug)),
        ]);
    }

    public function blog(): Response
    {
        return Inertia::render('site/blog-index', [
            'site' => $this->siteProps(),
            'menu' => $this->menus->resolve('primary'),
            'posts' => Post::query()->published()->latest('published_at')->paginate(12),
        ]);
    }

    public function post(Post $post): Response
    {
        abort_unless($post->status === 'published', 404);

        return Inertia::render('site/post', [
            'site' => $this->siteProps(),
            'menu' => $this->menus->resolve('primary'),
            'post' => [
                ...$post->toArray(),
                'rendered_html' => $post->content_html ?: $this->renderer->render($post->content_json ?? []),
            ],
            'seo' => $this->seo->forContent($post->seo_title ?: $post->title, $post->seo_description, url('/blog/'.$post->slug)),
        ]);
    }

    public function category(Category $category): Response
    {
        return Inertia::render('site/blog-index', [
            'site' => $this->siteProps(),
            'menu' => $this->menus->resolve('primary'),
            'posts' => Post::query()->published()->whereHas('categories', fn ($query) => $query->whereKey($category->id))->latest('published_at')->paginate(12),
            'title' => $category->name,
        ]);
    }

    public function tag(string $slug): Response
    {
        return Inertia::render('site/blog-index', [
            'site' => $this->siteProps(),
            'menu' => $this->menus->resolve('primary'),
            'posts' => Post::query()->published()->whereHas('tags', fn ($query) => $query->where('slug', $slug))->latest('published_at')->paginate(12),
            'title' => '#'.$slug,
        ]);
    }

    protected function siteProps(): array
    {
        return [
            'identity' => Setting::query()->where('key', 'site.identity')->first()?->value ?? ['name' => 'Atlas CMS'],
            'seo' => Setting::query()->where('key', 'site.seo')->first()?->value ?? [],
        ];
    }

    protected function serializePage(Page $page): array
    {
        return [
            ...$page->toArray(),
            'rendered_html' => $page->content_html ?: $this->renderer->render($page->content_json ?? []),
        ];
    }
}
