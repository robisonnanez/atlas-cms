<?php

namespace App\Http\Controllers;

use App\Domain\Content\Contracts\ContentRendererContract;
use App\Domain\Menus\Contracts\MenuResolverContract;
use App\Models\Category;
use App\Models\Media;
use App\Models\MediaDirectory;
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
            'mediaLibrary' => $this->mediaLibrary(),
            'latestPosts' => $this->latestPosts(),
        ]);
    }

    public function page(Page $page): Response
    {
        abort_unless($page->status === 'published', 404);

        return Inertia::render('site/page', [
            'site' => $this->siteProps(),
            'menu' => $this->menus->resolve('primary'),
            'page' => $this->serializePage($page),
            'mediaLibrary' => $this->mediaLibrary(),
            'latestPosts' => $this->latestPosts(),
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
                'content_json' => $post->content_json ?? [],
                'rendered_html' => $post->content_html ?: $this->renderer->render($post->content_json ?? []),
            ],
            'mediaLibrary' => $this->mediaLibrary(),
            'latestPosts' => $this->latestPosts(),
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
            'locale' => app()->getLocale(),
        ];
    }

    protected function serializePage(Page $page): array
    {
        return [
            ...$page->toArray(),
            'content_json' => $page->content_json ?? [],
            'rendered_html' => $page->content_html ?: $this->renderer->render($page->content_json ?? []),
        ];
    }

    protected function latestPosts(): array
    {
        return Post::query()
            ->published()
            ->latest('published_at')
            ->take(6)
            ->get(['id', 'title', 'slug', 'excerpt'])
            ->map(fn (Post $post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'url' => '/blog/'.$post->slug,
            ])
            ->values()
            ->all();
    }

    protected function mediaLibrary(): array
    {
        return [
            'directories' => MediaDirectory::query()
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->map(fn (MediaDirectory $directory) => [
                    'id' => $directory->id,
                    'name' => $directory->name,
                    'slug' => $directory->slug,
                ])
                ->values(),
            'assets' => Media::query()
                ->with('directory')
                ->where('mime_type', 'like', 'image/%')
                ->latest()
                ->get()
                ->map(fn (Media $media) => [
                    'id' => $media->id,
                    'title' => $media->title ?: $media->filename,
                    'alt' => $media->alt_text ?: $media->title ?: $media->filename,
                    'url' => $media->metadata['url'] ?? Storage::disk($media->disk)->url($media->path),
                    'directory_id' => $media->directory?->id,
                    'directory_name' => $media->directory?->name,
                ])
                ->values(),
        ];
    }
}
