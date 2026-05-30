<?php

namespace App\Http\Controllers;

use App\Domain\Content\Contracts\ContentRendererContract;
use App\Domain\Menus\Contracts\MenuResolverContract;
use App\Models\Category;
use App\Models\Media;
use App\Models\Page;
use App\Models\Post;
use App\Models\Setting;
use App\Support\Cms\SeoMetadataBuilder;
use Illuminate\Support\Facades\Storage;
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
            'carousel' => $this->carouselMedia(),
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
            'chrome' => Setting::query()->where('key', 'site.chrome')->first()?->value ?? [],
        ];
    }

    protected function serializePage(Page $page): array
    {
        return [
            ...$page->toArray(),
            'rendered_html' => $page->content_html ?: $this->renderer->render($page->content_json ?? []),
        ];
    }

    protected function carouselMedia(): array
    {
        $preferred = Media::query()
            ->with('directory')
            ->where('mime_type', 'like', 'image/%')
            ->whereHas('directory', fn ($query) => $query->whereIn('slug', ['carousel', 'carrusel']))
            ->latest()
            ->take(5)
            ->get();

        $collection = $preferred->isNotEmpty()
            ? $preferred
            : Media::query()->with('directory')->where('mime_type', 'like', 'image/%')->latest()->take(5)->get();

        return $collection
            ->map(fn (Media $media) => [
                'id' => $media->id,
                'title' => $media->title ?: $media->filename,
                'alt' => $media->alt_text ?: $media->title ?: $media->filename,
                'url' => $media->metadata['url'] ?? Storage::disk($media->disk)->url($media->path),
            ])
            ->values()
            ->all();
    }
}
