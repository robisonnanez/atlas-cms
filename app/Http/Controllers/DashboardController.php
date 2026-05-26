<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Page;
use App\Models\Post;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'pages' => Page::query()->count(),
                'posts' => Post::query()->count(),
                'users' => User::query()->count(),
                'media' => Media::query()->count(),
            ],
            'recentPages' => Page::query()->latest('updated_at')->take(5)->get(['id', 'title', 'status', 'updated_at']),
            'recentPosts' => Post::query()->latest('updated_at')->take(5)->get(['id', 'title', 'status', 'updated_at']),
            'system' => [
                'php' => PHP_VERSION,
                'app' => config('app.name', 'Atlas CMS'),
                'environment' => app()->environment(),
            ],
        ]);
    }
}
