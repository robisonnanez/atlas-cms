<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\MediaDirectory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/media/index', [
            'media' => Media::query()
                ->with('directory')
                ->latest()
                ->get()
                ->map(fn (Media $media) => [
                    ...$media->toArray(),
                    'preview_url' => $this->previewUrl(Storage::disk($media->disk)->url($media->path)),
                ])
                ->values(),
            'directories' => MediaDirectory::query()->withCount('media')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf,svg,doc,docx'],
            'title' => ['nullable', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'directory_id' => ['nullable', 'exists:media_directories,id'],
        ]);

        $file = $data['file'];
        $directory = isset($data['directory_id']) ? MediaDirectory::query()->find($data['directory_id']) : null;
        $targetPath = $directory ? 'atlas-media/'.$directory->slug : 'atlas-media';
        $path = $file->store($targetPath, 'public');

        Media::query()->create([
            'directory_id' => $directory?->id,
            'disk' => 'public',
            'path' => $path,
            'filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'extension' => $file->getClientOriginalExtension(),
            'size' => $file->getSize(),
            'title' => $data['title'] ?? $file->getClientOriginalName(),
            'alt_text' => $data['alt_text'] ?? null,
            'metadata' => [
                'url' => $this->previewUrl(Storage::disk('public')->url($path)),
                'directory' => $directory?->slug,
            ],
            'uploaded_by' => $request->user()?->id,
        ]);

        return back()->with('success', 'Archivo multimedia cargado correctamente.');
    }

    public function update(Request $request, Media $medium): RedirectResponse
    {
        $medium->update($request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'directory_id' => ['nullable', 'exists:media_directories,id'],
        ]));

        $medium->refresh();
        $medium->update([
            'metadata' => array_merge($medium->metadata ?? [], [
                'directory' => $medium->directory?->slug,
                'url' => $this->previewUrl(Storage::disk($medium->disk)->url($medium->path)),
            ]),
        ]);

        return back()->with('success', 'Metadata actualizada correctamente.');
    }

    public function storeDirectory(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $slug = Str::slug($data['name']);
        $baseSlug = $slug;
        $suffix = 1;

        while (MediaDirectory::query()->where('slug', $slug)->exists()) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        MediaDirectory::query()->create([
            'name' => $data['name'],
            'slug' => $slug,
            'description' => $data['description'] ?? null,
            'created_by' => $request->user()?->id,
        ]);

        return back()->with('success', 'Directorio creado correctamente.');
    }

    public function destroyDirectory(MediaDirectory $directory): RedirectResponse
    {
        if ($directory->media()->exists()) {
            return back()->with('error', 'El directorio todavía contiene archivos. Muévelos o elimínalos primero.');
        }

        $directory->delete();

        return back()->with('success', 'Directorio eliminado correctamente.');
    }

    protected function previewUrl(string $url): string
    {
        $parts = parse_url($url);

        if (is_array($parts) && isset($parts['path'])) {
            $path = $parts['path'];
            $query = Arr::exists($parts, 'query') ? ('?'.$parts['query']) : '';

            return $path.$query;
        }

        return $url;
    }

    public function destroy(Media $medium): RedirectResponse
    {
        if ($medium->disk && $medium->path && Storage::disk($medium->disk)->exists($medium->path)) {
            Storage::disk($medium->disk)->delete($medium->path);
        }

        $medium->delete();

        return back()->with('success', 'Archivo multimedia eliminado correctamente.');
    }
}
