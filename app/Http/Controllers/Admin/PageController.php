<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Revision;
use App\Domain\Content\Contracts\ContentRendererContract;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PageController extends Controller
{
    public function __construct(
        protected ContentRendererContract $renderer,
    ) {
    }

    public function index(): Response
    {
        return Inertia::render('admin/pages/index', [
            'pages' => Page::query()->latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/pages/form', [
            'page' => null,
            'revisions' => [],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $page = Page::query()->create($this->payload($request) + [
            'author_id' => $request->user()?->id,
        ]);

        $this->storeRevision($page, $request);

        return redirect()->route('admin.pages.index')->with('success', 'Page created.');
    }

    public function edit(Page $page): Response
    {
        return Inertia::render('admin/pages/form', [
            'page' => $page,
            'revisions' => $page->revisions()
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

    public function update(Request $request, Page $page): RedirectResponse
    {
        $page->update($this->payload($request));
        $this->storeRevision($page, $request);

        return redirect()->route('admin.pages.index')->with('success', 'Page updated.');
    }

    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        return redirect()->route('admin.pages.index')->with('success', 'Page deleted.');
    }

    public function restoreRevision(Request $request, Page $page, Revision $revision): RedirectResponse
    {
        if ($revision->revisable_type !== Page::class || $revision->revisable_id !== $page->id) {
            throw new NotFoundHttpException();
        }

        $snapshot = $revision->snapshot ?? [];
        $blocks = $snapshot['content_json'] ?? [];

        $page->update([
            'title' => $snapshot['title'] ?? $page->title,
            'slug' => $snapshot['slug'] ?? $page->slug,
            'status' => $snapshot['status'] ?? $page->status,
            'template' => $snapshot['template'] ?? $page->template,
            'excerpt' => $snapshot['excerpt'] ?? $page->excerpt,
            'content_json' => $blocks,
            'content_html' => $this->renderer->render($blocks),
            'seo_title' => $snapshot['seo_title'] ?? $page->seo_title,
            'seo_description' => $snapshot['seo_description'] ?? $page->seo_description,
            'published_at' => ($snapshot['status'] ?? $page->status) === 'published' ? now() : null,
        ]);

        $this->storeRevision($page, $request);

        return back()->with('success', 'Page restored from revision.');
    }

    protected function payload(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255'],
            'status' => ['required', 'string', 'max:50'],
            'template' => ['nullable', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'content_json' => ['nullable', 'array'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
        ]);

        $blocks = $data['content_json'] ?? [];
        $data['content_html'] = $this->renderer->render($blocks);
        $data['published_at'] = $data['status'] === 'published' ? now() : null;

        return $data;
    }

    protected function storeRevision(Page $page, Request $request): void
    {
        Revision::query()->create([
            'revisable_type' => Page::class,
            'revisable_id' => $page->id,
            'snapshot' => $page->fresh()->only(['title', 'slug', 'status', 'template', 'excerpt', 'content_json', 'seo_title', 'seo_description']),
            'author_id' => $request->user()?->id,
        ]);
    }
}
