<?php

use App\Models\Category;
use App\Models\Permission;
use App\Models\Post;
use App\Models\Revision;
use App\Models\Tag;
use App\Models\User;
use Spatie\Permission\Models\Role;

test('super admins can create posts with categories and tags', function () {
    $role = Role::findOrCreate('super-admin', 'web');
    $user = User::factory()->create();
    $user->assignRole($role);

    $category = Category::query()->create([
        'name' => 'News',
        'slug' => 'news',
    ]);

    $tag = Tag::query()->create([
        'name' => 'Launch',
        'slug' => 'launch',
    ]);

    $response = $this->actingAs($user)->post('/admin/posts', [
        'title' => 'Atlas launch',
        'slug' => 'atlas-launch',
        'status' => 'published',
        'excerpt' => 'Atlas launch post.',
        'content_json' => [
            ['type' => 'heading', 'data' => ['text' => 'Atlas launch']],
            ['type' => 'paragraph', 'data' => ['text' => 'A new release']],
        ],
        'seo_title' => 'Atlas launch',
        'seo_description' => 'Atlas launch post.',
        'primary_category_id' => $category->id,
        'category_ids' => [$category->id],
        'tag_ids' => [$tag->id],
    ]);

    $response->assertRedirect('/admin/posts');

    $post = Post::query()->where('slug', 'atlas-launch')->firstOrFail();

    expect($post->categories()->pluck('categories.id')->all())->toContain($category->id);
    expect($post->tags()->pluck('tags.id')->all())->toContain($tag->id);
});

test('users with the posts view permission can access the posts admin', function () {
    Permission::findOrCreate('atlas.posts.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.posts.view');

    $this->actingAs($user)
        ->get('/admin/posts')
        ->assertOk();
});

test('users without the posts create permission cannot open the create post form', function () {
    Permission::findOrCreate('atlas.posts.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.posts.view');

    $this->actingAs($user)
        ->get('/admin/posts/create')
        ->assertForbidden();
});

test('posts can be restored from a revision', function () {
    $role = Role::findOrCreate('super-admin', 'web');
    $user = User::factory()->create();
    $user->assignRole($role);

    $news = Category::query()->create(['name' => 'News', 'slug' => 'news']);
    $updates = Category::query()->create(['name' => 'Updates', 'slug' => 'updates']);
    $atlas = Tag::query()->create(['name' => 'Atlas', 'slug' => 'atlas']);

    $post = Post::query()->create([
        'title' => 'Current title',
        'slug' => 'current-title',
        'status' => 'draft',
        'excerpt' => 'Current excerpt',
        'content_json' => [['type' => 'paragraph', 'data' => ['text' => 'Current content']]],
        'content_html' => '<p>Current content</p>',
        'author_id' => $user->id,
        'primary_category_id' => $news->id,
    ]);

    $revision = Revision::query()->create([
        'revisable_type' => Post::class,
        'revisable_id' => $post->id,
        'snapshot' => [
            'title' => 'Restored post',
            'slug' => 'restored-post',
            'status' => 'published',
            'excerpt' => 'Restored excerpt',
            'content_json' => [['type' => 'paragraph', 'data' => ['text' => 'Restored content']]],
            'seo_title' => 'Restored SEO',
            'seo_description' => 'Restored description',
            'primary_category_id' => $updates->id,
            'category_ids' => [$updates->id],
            'tag_ids' => [$atlas->id],
        ],
        'author_id' => $user->id,
    ]);

    $this->actingAs($user)
        ->post("/admin/posts/{$post->id}/revisions/{$revision->id}/restore")
        ->assertRedirect();

    $post->refresh();

    expect($post->title)->toBe('Restored post')
        ->and($post->slug)->toBe('restored-post')
        ->and($post->primary_category_id)->toBe($updates->id)
        ->and($post->categories()->pluck('categories.id')->all())->toBe([$updates->id])
        ->and($post->tags()->pluck('tags.id')->all())->toBe([$atlas->id]);
});
