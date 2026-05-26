<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Content\Contracts\ContentRendererContract;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Post;
use App\Models\Revision;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PostController extends Controller
{
    public function __construct(
        protected ContentRendererContract $renderer,
    ) {
    }

    public function index(): Response
    {
        return Inertia::render('admin/posts/index', [
            'posts' => Post::query()->with('author')->latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/posts/form', [
            'post' => null,
            'categories' => Category::query()->orderBy('name')->get(),
            'tags' => Tag::query()->orderBy('name')->get(),
            'revisions' => [],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $post = Post::query()->create($this->payload($request) + [
            'author_id' => $request->user()?->id,
        ]);

        $post->categories()->sync($request->input('category_ids', []));
        $post->tags()->sync($request->input('tag_ids', []));
        $this->storeRevision($post, $request);

        return redirect()->route('admin.posts.index')->with('success', 'Post created.');
    }

    public function edit(Post $post): Response
    {
        $post->load(['categories:id', 'tags:id']);

        return Inertia::render('admin/posts/form', [
            'post' => $post,
            'categories' => Category::query()->orderBy('name')->get(),
            'tags' => Tag::query()->orderBy('name')->get(),
            'revisions' => $post->revisions()
                ->with('author:id,name')
                ->latest()
                ->take(8)
                ->get()
                ->map(fn (Revision $revision) => [
                    'id' => $revision->id,
                    'created_at' => $revision->created_at?->toIso8601String(),
                    'author_name' => $revision->author?->name,
                ]),
        ]);
    }

    public function update(Request $request, Post $post): RedirectResponse
    {
        $post->update($this->payload($request));
        $post->categories()->sync($request->input('category_ids', []));
        $post->tags()->sync($request->input('tag_ids', []));
        $this->storeRevision($post, $request);

        return redirect()->route('admin.posts.index')->with('success', 'Post updated.');
    }

    public function destroy(Post $post): RedirectResponse
    {
        $post->delete();

        return redirect()->route('admin.posts.index')->with('success', 'Post deleted.');
    }

    public function restoreRevision(Request $request, Post $post, Revision $revision): RedirectResponse
    {
        if ($revision->revisable_type !== Post::class || $revision->revisable_id !== $post->id) {
            throw new NotFoundHttpException();
        }

        $snapshot = $revision->snapshot ?? [];
        $blocks = $snapshot['content_json'] ?? [];

        $post->update([
            'title' => $snapshot['title'] ?? $post->title,
            'slug' => $snapshot['slug'] ?? $post->slug,
            'status' => $snapshot['status'] ?? $post->status,
            'excerpt' => $snapshot['excerpt'] ?? $post->excerpt,
            'content_json' => $blocks,
            'content_html' => $this->renderer->render($blocks),
            'seo_title' => $snapshot['seo_title'] ?? $post->seo_title,
            'seo_description' => $snapshot['seo_description'] ?? $post->seo_description,
            'primary_category_id' => $snapshot['primary_category_id'] ?? $post->primary_category_id,
            'published_at' => ($snapshot['status'] ?? $post->status) === 'published' ? now() : null,
        ]);

        $post->categories()->sync($snapshot['category_ids'] ?? []);
        $post->tags()->sync($snapshot['tag_ids'] ?? []);
        $this->storeRevision($post, $request);

        return back()->with('success', 'Post restored from revision.');
    }

    protected function payload(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255'],
            'status' => ['required', 'string', 'max:50'],
            'excerpt' => ['nullable', 'string'],
            'content_json' => ['nullable', 'array'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'primary_category_id' => ['nullable', 'integer'],
        ]);

        $blocks = $data['content_json'] ?? [];
        $data['content_html'] = $this->renderer->render($blocks);
        $data['published_at'] = $data['status'] === 'published' ? now() : null;

        return $data;
    }

    protected function storeRevision(Post $post, Request $request): void
    {
        Revision::query()->create([
            'revisable_type' => Post::class,
            'revisable_id' => $post->id,
            'snapshot' => [
                ...$post->fresh()->only(['title', 'slug', 'status', 'excerpt', 'content_json', 'seo_title', 'seo_description', 'primary_category_id']),
                'category_ids' => $post->categories()->pluck('categories.id')->all(),
                'tag_ids' => $post->tags()->pluck('tags.id')->all(),
            ],
            'author_id' => $request->user()?->id,
        ]);
    }
}
