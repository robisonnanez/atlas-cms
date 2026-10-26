<?php

namespace Modules\Plugins\SeoPlus\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Page;
use App\Models\Post;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $xml = Cache::remember('atlas_sitemap_xml', 3600, function (): string {
            return $this->buildSitemapXml();
        });

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=utf-8',
        ]);
    }

    protected function buildSitemapXml(): string
    {
        $baseUrl = rtrim(config('app.url', url('/')), '/');
        $now = now()->toIso8601String();

        $items = [];

        // 1. Home
        $items[] = [
            'loc' => $baseUrl.'/',
            'lastmod' => $now,
            'changefreq' => 'daily',
            'priority' => '1.0',
        ];

        // 2. Blog index
        $items[] = [
            'loc' => $baseUrl.'/blog',
            'lastmod' => $now,
            'changefreq' => 'daily',
            'priority' => '0.8',
        ];

        // 3. Published Pages
        $pages = Page::query()->published()->get(['slug', 'updated_at']);
        foreach ($pages as $page) {
            if ($page->slug === 'home') {
                continue;
            }
            $items[] = [
                'loc' => $baseUrl.'/'.$page->slug,
                'lastmod' => ($page->updated_at ?? now())->toIso8601String(),
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ];
        }

        // 4. Published Posts
        $posts = Post::query()->published()->latest('published_at')->get(['slug', 'updated_at', 'published_at']);
        foreach ($posts as $post) {
            $items[] = [
                'loc' => $baseUrl.'/blog/'.$post->slug,
                'lastmod' => ($post->updated_at ?? $post->published_at ?? now())->toIso8601String(),
                'changefreq' => 'weekly',
                'priority' => '0.6',
            ];
        }

        // 5. Categories with published posts
        $categories = Category::query()->whereHas('posts', fn ($q) => $q->published())->get(['slug', 'updated_at']);
        foreach ($categories as $category) {
            $items[] = [
                'loc' => $baseUrl.'/blog/category/'.$category->slug,
                'lastmod' => ($category->updated_at ?? now())->toIso8601String(),
                'changefreq' => 'monthly',
                'priority' => '0.4',
            ];
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        foreach ($items as $item) {
            $xml .= '  <url>'."\n";
            $xml .= '    <loc>'.htmlspecialchars($item['loc'], ENT_XML1, 'UTF-8').'</loc>'."\n";
            $xml .= '    <lastmod>'.$item['lastmod'].'</lastmod>'."\n";
            $xml .= '    <changefreq>'.$item['changefreq'].'</changefreq>'."\n";
            $xml .= '    <priority>'.$item['priority'].'</priority>'."\n";
            $xml .= '  </url>'."\n";
        }

        $xml .= '</urlset>';

        return $xml;
    }
}
