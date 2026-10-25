<?php

use App\Models\Page;
use App\Models\Permission;
use App\Models\Post;
use App\Models\User;
use App\Support\Cms\CmsHookManager;
use Illuminate\Support\Facades\Artisan;
use Spatie\Activitylog\Models\Activity;

it('supports advanced publishing states and transitions on pages and posts', function () {
    $page = Page::query()->create([
        'title' => 'Página de prueba de flujo',
        'slug' => 'pagina-flujo',
        'status' => Page::STATUS_DRAFT,
    ]);

    expect($page->isDraft())->toBeTrue();
    expect($page->isPublished())->toBeFalse();

    $hookFired = false;
    app(CmsHookManager::class)->addAction('content.status_changed', function ($content, $oldStatus, $newStatus) use (&$hookFired) {
        if ($newStatus === Page::STATUS_IN_REVIEW) {
            $hookFired = true;
        }
    });

    $page->transitionTo(Page::STATUS_IN_REVIEW);
    expect($page->fresh()->status)->toBe(Page::STATUS_IN_REVIEW);
    expect($page->fresh()->isInReview())->toBeTrue();
    expect($hookFired)->toBeTrue();

    // Transition to scheduled
    $futureDate = now()->addDays(2)->startOfSecond();
    $page->transitionTo(Page::STATUS_SCHEDULED, $futureDate);
    expect($page->fresh()->isScheduled())->toBeTrue();
    expect($page->fresh()->published_at->toDateTimeString())->toBe($futureDate->toDateTimeString());
    expect($page->fresh()->isPublished())->toBeFalse();

    // Verify activity was logged
    $activity = Activity::query()
        ->where('subject_type', Page::class)
        ->where('subject_id', $page->id)
        ->where('event', 'status_changed')
        ->latest('id')
        ->first();

    expect($activity)->not->toBeNull();
    expect($activity->properties['new_status'])->toBe(Page::STATUS_SCHEDULED);
});

it('hides unpublished content from public web endpoints', function () {
    $draftPage = Page::query()->create([
        'title' => 'Borrador secreto',
        'slug' => 'borrador-secreto',
        'status' => Page::STATUS_DRAFT,
    ]);

    $scheduledPost = Post::query()->create([
        'title' => 'Post futuro',
        'slug' => 'post-futuro',
        'status' => Post::STATUS_SCHEDULED,
        'published_at' => now()->addDays(3),
    ]);

    $publishedPage = Page::query()->create([
        'title' => 'Página pública',
        'slug' => 'pagina-publica',
        'status' => Page::STATUS_PUBLISHED,
        'published_at' => now()->subDay(),
    ]);

    $this->get('/borrador-secreto')->assertNotFound();
    $this->get('/blog/post-futuro')->assertNotFound();
    $this->get('/pagina-publica')->assertOk();
});

it('publishes scheduled content automatically via atlas:publish-scheduled command', function () {
    $pastDate = now()->subMinutes(5);

    $page = Page::query()->create([
        'title' => 'Página programada vencida',
        'slug' => 'pagina-programada-vencida',
        'status' => Page::STATUS_SCHEDULED,
        'published_at' => $pastDate,
    ]);

    $post = Post::query()->create([
        'title' => 'Post programado vencido',
        'slug' => 'post-programado-vencido',
        'status' => Post::STATUS_SCHEDULED,
        'published_at' => $pastDate,
    ]);

    $exitCode = Artisan::call('atlas:publish-scheduled');
    expect($exitCode)->toBe(0);

    expect($page->fresh()->status)->toBe(Page::STATUS_PUBLISHED);
    expect($page->fresh()->isPublished())->toBeTrue();
    expect($post->fresh()->status)->toBe(Post::STATUS_PUBLISHED);
    expect($post->fresh()->isPublished())->toBeTrue();
});

it('allows updating content status via admin endpoints', function () {
    Permission::findOrCreate('atlas.pages.edit', 'web');
    Permission::findOrCreate('atlas.posts.edit', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.pages.edit', 'atlas.posts.edit');

    $page = Page::query()->create([
        'title' => 'Página para cambiar estado',
        'slug' => 'pagina-cambio-estado',
        'status' => Page::STATUS_DRAFT,
    ]);

    $response = $this->actingAs($user)->post("/admin/pages/{$page->id}/status", [
        'status' => Page::STATUS_PUBLISHED,
    ]);

    $response->assertRedirect();
    expect($page->fresh()->status)->toBe(Page::STATUS_PUBLISHED);
    expect($page->fresh()->published_at)->not->toBeNull();
});
