<?php

namespace Database\Seeders;

use App\Models\CmsMenu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Plugin;
use App\Models\Post;
use App\Models\Setting;
use App\Models\Theme;
use Illuminate\Database\Seeder;

class AtlasCmsSeeder extends Seeder
{
    public function run(): void
    {
        Setting::query()->updateOrCreate(
            ['key' => 'site.identity'],
            ['group' => 'general', 'value' => ['name' => 'Atlas CMS', 'tagline' => 'Control, structure and speed.'], 'is_public' => true],
        );

        Theme::query()->updateOrCreate(
            ['slug' => 'atlas-default'],
            ['name' => 'Atlas Default', 'version' => '1.0.0', 'author' => 'Atlas CMS', 'is_active' => true, 'settings' => ['accent' => '#2563eb']],
        );

        Plugin::query()->updateOrCreate(
            ['slug' => 'contact-form'],
            ['name' => 'Contact Form', 'version' => '1.0.0', 'description' => 'Embeddable contact form blocks.', 'provider' => 'Modules\\Plugins\\ContactForm\\PluginServiceProvider', 'is_active' => true],
        );

        Plugin::query()->updateOrCreate(
            ['slug' => 'seo-plus'],
            ['name' => 'SEO Plus', 'version' => '1.0.0', 'description' => 'Extra SEO helpers for Atlas.', 'provider' => 'Modules\\Plugins\\SeoPlus\\PluginServiceProvider', 'is_active' => true],
        );

        $menu = CmsMenu::query()->updateOrCreate(
            ['location' => 'primary'],
            ['name' => 'Primary Navigation', 'description' => 'Main public navigation'],
        );

        $homePage = Page::query()->updateOrCreate(
            ['slug' => 'home'],
            [
                'title' => 'Atlas CMS',
                'status' => 'published',
                'template' => 'home',
                'excerpt' => 'A modular CMS foundation.',
                'content_json' => [
                    ['type' => 'heading', 'data' => ['text' => 'Build faster with Atlas CMS']],
                    ['type' => 'paragraph', 'data' => ['text' => 'A modern Laravel + React CMS with pages, posts, media, themes and plugins.']],
                    ['type' => 'button', 'data' => ['label' => 'Open admin', 'url' => '/dashboard']],
                ],
                'content_html' => null,
                'seo_title' => 'Atlas CMS',
                'seo_description' => 'A modern modular CMS powered by Laravel and Inertia.',
                'published_at' => now(),
            ],
        );

        Post::query()->updateOrCreate(
            ['slug' => 'welcome-to-atlas'],
            [
                'title' => 'Welcome to Atlas CMS',
                'status' => 'published',
                'excerpt' => 'The first article in the Atlas editorial flow.',
                'content_json' => [
                    ['type' => 'paragraph', 'data' => ['text' => 'Atlas CMS is ready to publish content with a clean authoring workflow.']],
                ],
                'seo_title' => 'Welcome to Atlas CMS',
                'seo_description' => 'First post published from Atlas CMS.',
                'published_at' => now(),
            ],
        );

        MenuItem::query()->updateOrCreate(
            ['menu_id' => $menu->id, 'label' => 'Home'],
            ['type' => 'page', 'url' => '/', 'reference_type' => Page::class, 'reference_id' => $homePage->id, 'sort_order' => 1],
        );
    }
}
