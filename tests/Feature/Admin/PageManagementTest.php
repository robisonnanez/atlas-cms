<?php

use App\Models\Permission;
use App\Models\Page;
use App\Models\Revision;
use App\Models\User;
use Spatie\Permission\Models\Role;

test('non super admins cannot access the pages admin', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/admin/pages')
        ->assertForbidden();
});

test('super admins can create pages from the admin', function () {
    $role = Role::findOrCreate('super-admin', 'web');
    $user = User::factory()->create();
    $user->assignRole($role);

    $response = $this->actingAs($user)->post('/admin/pages', [
        'title' => 'QA page',
        'slug' => 'qa-page',
        'status' => 'published',
        'template' => 'page',
        'excerpt' => 'Created from automated test.',
        'content_json' => [
            ['type' => 'heading', 'data' => ['text' => 'Hello Atlas']],
            ['type' => 'rich_text', 'data' => ['html' => '<p>Body copy</p>']],
        ],
        'seo_title' => 'QA page',
        'seo_description' => 'Created from test',
    ]);

    $response->assertRedirect('/admin/pages');

    $this->assertDatabaseHas('pages', [
        'slug' => 'qa-page',
        'status' => 'published',
    ]);
});

test('users with the pages view permission can access the pages admin', function () {
    Permission::findOrCreate('atlas.pages.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.pages.view');

    $this->actingAs($user)
        ->get('/admin/pages')
        ->assertOk();
});

test('users without the pages create permission cannot open the create page form', function () {
    Permission::findOrCreate('atlas.pages.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.pages.view');

    $this->actingAs($user)
        ->get('/admin/pages/create')
        ->assertForbidden();
});

test('pages can be restored from a revision', function () {
    $role = Role::findOrCreate('super-admin', 'web');
    $user = User::factory()->create();
    $user->assignRole($role);

    $page = Page::query()->create([
        'title' => 'Current title',
        'slug' => 'current-title',
        'status' => 'draft',
        'template' => 'page',
        'excerpt' => 'Current excerpt',
        'content_json' => [['type' => 'paragraph', 'data' => ['text' => 'Current content']]],
        'content_html' => '<p>Current content</p>',
        'author_id' => $user->id,
    ]);

    $revision = Revision::query()->create([
        'revisable_type' => Page::class,
        'revisable_id' => $page->id,
        'snapshot' => [
            'title' => 'Restored title',
            'slug' => 'restored-title',
            'status' => 'published',
            'template' => 'landing',
            'excerpt' => 'Restored excerpt',
            'content_json' => [['type' => 'paragraph', 'data' => ['text' => 'Restored content']]],
            'seo_title' => 'Restored SEO',
            'seo_description' => 'Restored SEO description',
        ],
        'author_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->post("/admin/pages/{$page->id}/revisions/{$revision->id}/restore")
        ->assertRedirect();

    $page->refresh();

    expect($page->title)->toBe('Restored title')
        ->and($page->slug)->toBe('restored-title')
        ->and($page->template)->toBe('landing')
        ->and($page->status)->toBe('published');
});
