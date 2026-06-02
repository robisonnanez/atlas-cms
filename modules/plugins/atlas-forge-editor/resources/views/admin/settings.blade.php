@extends('layouts.admin')

@section('title', 'Atlas Forge Editor')

@section('content')
    <div class="mx-auto max-w-5xl space-y-6">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p class="text-sm font-semibold uppercase tracking-wide text-indigo-600">Plugin activo</p>
            <h1 class="mt-2 text-2xl font-bold text-slate-950">{{ $editor['name'] }}</h1>
            <p class="mt-2 text-slate-600">{{ $editor['description'] }}</p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-slate-950">Integración</h2>
            <p class="mt-2 text-sm text-slate-600">
                Publica los assets con <code>php artisan vendor:publish --tag=atlas-forge-editor-assets</code>
                y registra el componente React en el editor administrativo de páginas/posts.
            </p>
        </div>
    </div>
@endsection
