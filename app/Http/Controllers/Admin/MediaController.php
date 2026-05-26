<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/media/index', [
            'media' => Media::query()->latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf,svg,doc,docx'],
            'title' => ['nullable', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ]);

        $file = $data['file'];
        $path = $file->store('atlas-media', 'public');

        Media::query()->create([
            'disk' => 'public',
            'path' => $path,
            'filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'extension' => $file->getClientOriginalExtension(),
            'size' => $file->getSize(),
            'title' => $data['title'] ?? $file->getClientOriginalName(),
            'alt_text' => $data['alt_text'] ?? null,
            'metadata' => ['url' => Storage::disk('public')->url($path)],
            'uploaded_by' => $request->user()?->id,
        ]);

        return back()->with('success', 'Media uploaded.');
    }

    public function update(Request $request, Media $medium): RedirectResponse
    {
        $medium->update($request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ]));

        return back()->with('success', 'Media updated.');
    }
}
