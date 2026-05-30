<?php

use App\Models\Page;
use App\Models\Setting;

it('renders structured header and footer content from public settings', function () {
    Setting::query()->create([
        'group' => 'general',
        'key' => 'site.identity',
        'value' => ['name' => 'Atlas CMS', 'tagline' => 'Demo'],
        'is_public' => true,
    ]);

    Setting::query()->create([
        'group' => 'theme',
        'key' => 'site.chrome',
        'value' => [
            'header' => [
                'notice_label' => 'Comunidad',
                'notice_text' => 'Inscripciones abiertas',
                'cta_label' => 'Ver convocatoria',
                'cta_url' => '/convocatorias',
            ],
            'footer' => [
                'intro_title' => 'Atlas Institucional',
                'intro_body' => 'Portal informativo de la comunidad educativa.',
                'columns' => [
                    ['title' => 'Contacto', 'body' => "info@atlas.test\n+57 300 000 0000"],
                    ['title' => 'Horario', 'body' => "Lunes a viernes\n7:00 a.m. - 4:00 p.m."],
                    ['title' => 'Ubicacion', 'body' => "Carrera 10 # 20-30\nBogota, Colombia"],
                ],
                'bottom_text' => 'Administrado desde Atlas CMS.',
            ],
        ],
        'is_public' => true,
    ]);

    Page::query()->create([
        'title' => 'Inicio',
        'slug' => 'home',
        'status' => 'published',
        'template' => 'home',
        'excerpt' => 'Demo',
        'content_html' => '<p>Contenido demo</p>',
        'seo_title' => 'Inicio',
        'seo_description' => 'Demo',
        'published_at' => now(),
    ]);

    $this->get('/')
        ->assertOk()
        ->assertSee('Comunidad')
        ->assertSee('Inscripciones abiertas')
        ->assertSee('Ver convocatoria')
        ->assertSee('Atlas Institucional')
        ->assertSee('info@atlas.test')
        ->assertSee('Administrado desde Atlas CMS.');
});
