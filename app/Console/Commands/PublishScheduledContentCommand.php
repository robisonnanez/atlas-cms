<?php

namespace App\Console\Commands;

use App\Models\Page;
use App\Models\Post;
use Illuminate\Console\Command;

class PublishScheduledContentCommand extends Command
{
    protected $signature = 'atlas:publish-scheduled';

    protected $description = 'Publica automáticamente las páginas y entradas programadas cuya fecha de publicación haya llegado';

    public function handle(): int
    {
        $now = now();

        $pages = Page::query()
            ->where('status', Page::STATUS_SCHEDULED)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', $now)
            ->get();

        $posts = Post::query()
            ->where('status', Post::STATUS_SCHEDULED)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', $now)
            ->get();

        $pagesCount = 0;
        foreach ($pages as $page) {
            $page->transitionTo(Page::STATUS_PUBLISHED, $page->published_at);
            $pagesCount++;
        }

        $postsCount = 0;
        foreach ($posts as $post) {
            $post->transitionTo(Post::STATUS_PUBLISHED, $post->published_at);
            $postsCount++;
        }

        $this->info("Publicación completada: {$pagesCount} página(s) y {$postsCount} entrada(s) publicadas.");

        return Command::SUCCESS;
    }
}
