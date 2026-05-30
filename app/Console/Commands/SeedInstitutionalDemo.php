<?php

namespace App\Console\Commands;

use App\Models\CmsMenu;
use App\Models\Media;
use App\Models\MediaDirectory;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Post;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SeedInstitutionalDemo extends Command
{
    protected $signature = 'atlas:seed-institutional-demo';
    protected $description = 'Carga una demo institucional tipo colegio con paginas, menu, media y portada publica.';

    public function handle(): int
    {
        $user = User::query()->first();
        if (! $user) {
            $this->error('No existe ningun usuario para asociar el contenido demo.');
            return self::FAILURE;
        }

        DB::transaction(function () use ($user): void {
            Setting::query()->updateOrCreate(['key' => 'site.identity'], ['group' => 'general', 'value' => ['name' => 'Institucion Educativa Sumapaz Demo', 'tagline' => 'Formacion integral, comunicacion clara y gestion publica moderna con Atlas CMS'], 'is_public' => true]);
            Setting::query()->updateOrCreate(['key' => 'site.seo'], ['group' => 'general', 'value' => ['title' => 'Institucion Educativa Sumapaz Demo', 'description' => 'Demo institucional construida con Atlas CMS para colegios, instituciones educativas y portales informativos.'], 'is_public' => true]);
            Setting::query()->updateOrCreate(['key' => 'site.chrome'], ['group' => 'theme', 'value' => [
                'header' => [
                    'notice_label' => 'Comunidad',
                    'notice_text' => 'Conoce circulares, convocatorias y noticias recientes desde el portal institucional.',
                    'cta_label' => 'Ver convocatorias',
                    'cta_url' => '/convocatorias',
                ],
                'footer' => [
                    'intro_title' => 'Institucion Educativa Sumapaz Demo',
                    'intro_body' => 'Sitio administrado con Atlas CMS para contenidos institucionales, noticias y recursos publicos.',
                    'columns' => [
                        ['title' => 'Contacto', 'body' => "Carrera 10 # 20-30\nsumapaz-demo@atlascms.test\n+57 300 000 0000"],
                        ['title' => 'Horario', 'body' => "Lunes a viernes\n7:00 a.m. - 4:00 p.m."],
                        ['title' => 'Servicios', 'body' => "Noticias institucionales\nConvocatorias\nRecursos para la comunidad"],
                    ],
                    'bottom_text' => 'Contenido, men?s, media y publicaciones administradas desde Atlas CMS.',
                ],
            ], 'is_public' => true]);

            $carouselDirectory = MediaDirectory::query()->firstOrCreate(['slug' => 'carousel'], ['name' => 'Carousel', 'description' => 'Imagenes principales del home y banners institucionales.', 'created_by' => $user->id]);
            $slides = [
                ['title' => 'Vida estudiantil', 'url' => 'https://sumapaz.edu.co/wp-content/uploads/2025/07/FB_IMG_1750868909643.jpg', 'alt' => 'Comunidad educativa'],
                ['title' => 'Educacion para adultos', 'url' => 'https://sumapaz.edu.co/wp-content/uploads/2025/04/educacion-adultos-2048x767.jpg', 'alt' => 'Oferta educativa'],
                ['title' => 'Aliados institucionales', 'url' => 'https://sumapaz.edu.co/wp-content/uploads/2025/06/SED_GOB-TOL.jpg', 'alt' => 'Aliados institucionales'],
            ];

            foreach ($slides as $slide) {
                $slug = Str::slug($slide['title']);
                $extension = pathinfo(parse_url($slide['url'], PHP_URL_PATH) ?? '', PATHINFO_EXTENSION) ?: 'jpg';
                $filename = $slug.'.'.$extension;
                $path = 'atlas-media/'.$carouselDirectory->slug.'/'.$filename;
                if (! Storage::disk('public')->exists($path)) {
                    $response = Http::timeout(20)->get($slide['url']);
                    if ($response->successful()) Storage::disk('public')->put($path, $response->body());
                }
                if (! Storage::disk('public')->exists($path)) continue;
                Media::query()->updateOrCreate(['path' => $path], ['directory_id' => $carouselDirectory->id, 'disk' => 'public', 'filename' => $filename, 'mime_type' => Storage::disk('public')->mimeType($path) ?: 'image/jpeg', 'extension' => $extension, 'size' => Storage::disk('public')->size($path) ?: 0, 'title' => $slide['title'], 'alt_text' => $slide['alt'], 'metadata' => ['url' => Storage::disk('public')->url($path), 'directory' => $carouselDirectory->slug], 'uploaded_by' => $user->id]);
            }

            $homeHtml = <<<'HTML'
<section class="grid gap-8 lg:grid-cols-2 items-center"><div><span class="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-4 py-1 text-sm font-semibold mb-4">Institucion educativa</span><h2 class="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Institucion Educativa Sumapaz Demo</h2><p class="text-lg text-slate-600 mb-6">Esta portada demuestra como Atlas CMS puede sostener el sitio de una institucion educativa con contenido institucional, carrusel multimedia, enlaces rapidos, publicaciones y menu jerarquico.</p><div class="flex flex-wrap gap-3"><a href="/institucional" class="inline-flex rounded-full bg-blue-600 px-6 py-3 text-white font-semibold">Conocer la institucion</a><a href="/contactenos" class="inline-flex rounded-full border border-slate-300 px-6 py-3 text-slate-700 font-semibold">Contactenos</a></div></div><div class="rounded-3xl bg-slate-50 border border-slate-200 p-6"><h3 class="text-xl font-semibold text-slate-900 mb-3">Portal institucional administrable</h3><ul class="space-y-3 text-slate-600"><li>Noticias y comunicados actualizados desde Posts.</li><li>Paginas institucionales con editor visual y bloques HTML.</li><li>Menu publico jerarquico con subniveles para areas y procesos.</li><li>Carrusel superior alimentado por la biblioteca multimedia.</li></ul></div></section><section class="mt-12"><h3 class="text-2xl font-semibold text-slate-900 mb-4">Accesos rapidos</h3><div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><a href="/institucional" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><strong class="block text-slate-900 mb-2">Institucional</strong><span class="text-sm text-slate-600">Mision, vision, PEI y documentos base.</span></a><a href="/academico" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><strong class="block text-slate-900 mb-2">Academico</strong><span class="text-sm text-slate-600">Procesos, cronogramas y recursos pedagogicos.</span></a><a href="/convocatorias" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><strong class="block text-slate-900 mb-2">Convocatorias</strong><span class="text-sm text-slate-600">Noticias, circulares y avisos oficiales.</span></a><a href="/contactenos" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><strong class="block text-slate-900 mb-2">Contactenos</strong><span class="text-sm text-slate-600">Canales de atencion y ubicacion institucional.</span></a></div></section>
HTML;

            $pages = [
                ['title' => 'Institucion Educativa Sumapaz Demo', 'slug' => 'home', 'template' => 'home', 'excerpt' => 'Formacion integral y comunicacion institucional administrada con Atlas CMS.', 'html' => $homeHtml],
                ['title' => 'Institucional', 'slug' => 'institucional', 'template' => 'page', 'excerpt' => 'Informacion institucional, PEI, historia y documentos base.', 'html' => '<h2>Institucional</h2><p>En esta seccion se organizan historia, mision, vision, PEI, equipo de trabajo y documentos de gobierno escolar.</p>'],
                ['title' => 'Equipo de Trabajo', 'slug' => 'equipo-de-trabajo', 'template' => 'page', 'excerpt' => 'Conoce el equipo directivo, docente y administrativo.', 'html' => '<h2>Equipo de Trabajo</h2><p>Contamos con un equipo comprometido con la excelencia academica, el bienestar estudiantil y el desarrollo institucional.</p>'],
                ['title' => 'Pacto Manual de Convivencia', 'slug' => 'pacto-manual-de-convivencia', 'template' => 'page', 'excerpt' => 'Consulta el manual de convivencia institucional.', 'html' => '<h2>Manual de Convivencia</h2><p>Espacio para alojar documentos, reglamentos y orientaciones para la comunidad educativa.</p>'],
                ['title' => 'Resena Historica', 'slug' => 'resena-historica', 'template' => 'page', 'excerpt' => 'Historia y trayectoria institucional.', 'html' => '<h2>Resena Historica</h2><p>Aqui se presenta la historia de la institucion, su origen y su evolucion dentro de la comunidad.</p>'],
                ['title' => 'Mision Vision y Valores', 'slug' => 'mision-vision-y-valores', 'template' => 'page', 'excerpt' => 'Proposito institucional y principios formativos.', 'html' => '<h2>Mision, Vision y Valores</h2><p>Publica la propuesta educativa, la identidad institucional y los principios de formacion.</p>'],
                ['title' => 'Proyecto Educativo Institucional', 'slug' => 'proyecto-educativo-institucional', 'template' => 'page', 'excerpt' => 'Consulta el PEI de la institucion.', 'html' => '<h2>Proyecto Educativo Institucional</h2><p>Esta pagina puede alojar el PEI, anexos, manuales y documentos complementarios.</p>'],
                ['title' => 'Circulares', 'slug' => 'circulares', 'template' => 'page', 'excerpt' => 'Circulares y comunicados internos.', 'html' => '<h2>Circulares</h2><p>Listado de circulares, avisos y comunicados para estudiantes, acudientes y docentes.</p>'],
                ['title' => 'Academico', 'slug' => 'academico', 'template' => 'page', 'excerpt' => 'Plan de estudios, gestion academica y recursos pedagogicos.', 'html' => '<h2>Academico</h2><p>Publica plan de estudios, cronogramas, FAQ y enlaces a sistemas academicos externos.</p>'],
                ['title' => 'Plan de Estudios', 'slug' => 'plan-de-estudios', 'template' => 'page', 'excerpt' => 'Consulta las areas, niveles y componentes de formacion.', 'html' => '<h2>Plan de Estudios</h2><p>Describe la estructura curricular por niveles, proyectos transversales y evaluacion.</p>'],
                ['title' => 'Preguntas Frecuentes', 'slug' => 'preguntas-frecuentes', 'template' => 'page', 'excerpt' => 'Dudas comunes sobre matriculas, horarios y procesos institucionales.', 'html' => '<h2>Preguntas Frecuentes</h2><p>Responde dudas frecuentes de padres, estudiantes y comunidad educativa.</p>'],
                ['title' => 'Convocatorias', 'slug' => 'convocatorias', 'template' => 'page', 'excerpt' => 'Convocatorias y avisos oficiales.', 'html' => '<h2>Convocatorias</h2><p>Seccion dedicada a procesos de seleccion, invitaciones publicas y anuncios oficiales.</p>'],
                ['title' => 'Contactenos', 'slug' => 'contactenos', 'template' => 'page', 'excerpt' => 'Canales de atencion y ubicacion.', 'html' => '<h2>Contactenos</h2><p>Direccion, telefonos, correo institucional y redes sociales de la comunidad educativa.</p>'],
            ];

            foreach ($pages as $pageData) {
                Page::query()->updateOrCreate(['slug' => $pageData['slug']], ['title' => $pageData['title'], 'status' => 'published', 'template' => $pageData['template'], 'excerpt' => $pageData['excerpt'], 'content_json' => [], 'content_html' => $pageData['html'], 'seo_title' => $pageData['title'], 'seo_description' => $pageData['excerpt'], 'published_at' => now(), 'author_id' => $user->id]);
            }

            $posts = [
                ['title' => 'Invitacion publica seleccion de regimen especial - Demo', 'slug' => 'invitacion-publica-seleccion-regimen-especial-demo', 'excerpt' => 'Ejemplo de noticia institucional o convocatoria creada desde Atlas CMS.', 'html' => '<p>Esta es una publicacion demo para mostrar como Atlas puede manejar noticias, publicaciones y convocatorias institucionales.</p>'],
                ['title' => 'Cronograma de matriculas 2026', 'slug' => 'cronograma-de-matriculas-2026', 'excerpt' => 'Fechas clave del proceso de inscripcion, renovacion y formalizacion de matriculas.', 'html' => '<p>Publicacion de ejemplo para presentar cronogramas, fechas y requisitos del proceso de matricula.</p>'],
                ['title' => 'Jornada pedagogica con la comunidad educativa', 'slug' => 'jornada-pedagogica-comunidad-educativa', 'excerpt' => 'Resumen de actividades institucionales, encuentros con acudientes y proyectos transversales.', 'html' => '<p>Ejemplo de noticia institucional sobre actividades pedagogicas, convivencia y participacion comunitaria.</p>'],
            ];

            foreach ($posts as $postData) {
                Post::query()->updateOrCreate(['slug' => $postData['slug']], ['title' => $postData['title'], 'status' => 'published', 'excerpt' => $postData['excerpt'], 'content_json' => [], 'content_html' => $postData['html'], 'seo_title' => $postData['title'], 'seo_description' => $postData['excerpt'], 'published_at' => now(), 'author_id' => $user->id]);
            }

            $menu = CmsMenu::query()->updateOrCreate(['location' => 'primary'], ['name' => 'Primary Navigation', 'description' => 'Main public navigation']);
            MenuItem::query()->where('menu_id', $menu->id)->delete();
            MenuItem::query()->create(['menu_id' => $menu->id, 'type' => 'custom', 'label' => 'Inicio', 'url' => '/', 'target' => '_self', 'sort_order' => 1]);
            $institucional = MenuItem::query()->create(['menu_id' => $menu->id, 'type' => 'custom', 'label' => 'Institucional', 'url' => '/institucional', 'target' => '_self', 'sort_order' => 2]);
            $academico = MenuItem::query()->create(['menu_id' => $menu->id, 'type' => 'custom', 'label' => 'Academico', 'url' => '/academico', 'target' => '_self', 'sort_order' => 3]);
            $publicaciones = MenuItem::query()->create(['menu_id' => $menu->id, 'type' => 'custom', 'label' => 'Noticias y Publicaciones', 'url' => '/blog', 'target' => '_self', 'sort_order' => 4]);
            $contacto = MenuItem::query()->create(['menu_id' => $menu->id, 'type' => 'custom', 'label' => 'Contactenos', 'url' => '/contactenos', 'target' => '_self', 'sort_order' => 5]);
            $convocatorias = MenuItem::query()->create(['menu_id' => $menu->id, 'type' => 'custom', 'label' => 'Convocatorias', 'url' => '/convocatorias', 'target' => '_self', 'sort_order' => 6]);

            foreach ([['label' => 'Equipo de Trabajo', 'url' => '/equipo-de-trabajo'], ['label' => 'Pacto Manual de Convivencia', 'url' => '/pacto-manual-de-convivencia'], ['label' => 'Resena Historica', 'url' => '/resena-historica'], ['label' => 'Mision Vision y Valores', 'url' => '/mision-vision-y-valores'], ['label' => 'Proyecto Educativo Institucional', 'url' => '/proyecto-educativo-institucional'], ['label' => 'Circulares', 'url' => '/circulares']] as $index => $item) {
                MenuItem::query()->create(['menu_id' => $menu->id, 'parent_id' => $institucional->id, 'type' => 'custom', 'label' => $item['label'], 'url' => $item['url'], 'target' => '_self', 'sort_order' => $index + 1]);
            }

            foreach ([['label' => 'Plan de Estudios', 'url' => '/plan-de-estudios'], ['label' => 'Sistema de Gestion Academica', 'url' => 'https://syscolegios.com/'], ['label' => 'Preguntas Frecuentes', 'url' => '/preguntas-frecuentes']] as $index => $item) {
                MenuItem::query()->create(['menu_id' => $menu->id, 'parent_id' => $academico->id, 'type' => 'custom', 'label' => $item['label'], 'url' => $item['url'], 'target' => str_starts_with($item['url'], 'http') ? '_blank' : '_self', 'sort_order' => $index + 1]);
            }

            MenuItem::query()->create(['menu_id' => $menu->id, 'parent_id' => $publicaciones->id, 'type' => 'custom', 'label' => 'Blog Institucional', 'url' => '/blog', 'target' => '_self', 'sort_order' => 1]);
            MenuItem::query()->create(['menu_id' => $menu->id, 'parent_id' => $convocatorias->id, 'type' => 'custom', 'label' => 'Noticias recientes', 'url' => '/blog', 'target' => '_self', 'sort_order' => 1]);
        });

        $this->info('Demo institucional cargada correctamente en Atlas.');
        return self::SUCCESS;
    }
}
