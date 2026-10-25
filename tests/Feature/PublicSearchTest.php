<?php

use App\Models\Page;
use App\Models\Post;
use Inertia\Testing\AssertableInertia as Assert;

it('returns search results matching query on public web', function () {
    Page::query()->create([
        'title' => 'Inicio',
        'slug' => 'home',
        'status' => 'published',
        'template' => 'home',
    ]);

    Post::query()->create([
        'title' => 'Guía de Optimización SEO',
        'slug' => 'guia-seo',
        'status' => 'published',
        'excerpt' => 'Consejos clave para posicionar tu web.',
        'published_at' => now(),
    ]);

    Post::query()->create([
        'title' => 'Novedades de Diseño',
        'slug' => 'novedades-diseno',
        'status' => 'published',
        'excerpt' => 'Tendencias para el próximo año.',
        'published_at' => now(),
    ]);

    $response = $this->get('/search?q=Optimización');
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('site/blog-index')
            ->where('title', 'Resultados para: Optimización')
            ->has('posts.data', 1)
            ->where('posts.data.0.slug', 'guia-seo')
        );
});
