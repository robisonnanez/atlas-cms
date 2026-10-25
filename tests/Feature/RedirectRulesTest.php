<?php

use App\Models\RedirectRule;
use App\Models\User;

it('redirects requests matching active redirect rules with configured status code', function () {
    $rule = RedirectRule::query()->create([
        'source_path' => '/pagina-vieja',
        'target_url' => '/pagina-nueva',
        'status_code' => 301,
        'is_active' => true,
        'hits' => 0,
    ]);

    $response = $this->get('/pagina-vieja');
    $response->assertStatus(301);
    $response->assertRedirect('/pagina-nueva');

    expect($rule->fresh()->hits)->toBe(1);
    expect($rule->fresh()->last_accessed_at)->not->toBeNull();
});

it('does not redirect if the rule is inactive', function () {
    RedirectRule::query()->create([
        'source_path' => '/inactivo',
        'target_url' => '/destino',
        'status_code' => 301,
        'is_active' => false,
    ]);

    $response = $this->get('/inactivo');
    $response->assertNotFound();
});

it('allows managing redirect rules via admin endpoints', function () {
    $admin = User::factory()->create();

    $response = $this->actingAs($admin)->post('/admin/redirects', [
        'source_path' => 'seccion-antigua',
        'target_url' => '/seccion-moderna',
        'status_code' => 302,
        'description' => 'Migración temporal',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('redirect_rules', [
        'source_path' => '/seccion-antigua',
        'target_url' => '/seccion-moderna',
        'status_code' => 302,
    ]);

    $rule = RedirectRule::query()->where('source_path', '/seccion-antigua')->firstOrFail();

    $this->actingAs($admin)->put("/admin/redirects/{$rule->id}", [
        'source_path' => '/seccion-antigua',
        'target_url' => '/seccion-definitiva',
        'status_code' => 301,
    ])->assertRedirect();

    expect($rule->fresh()->target_url)->toBe('/seccion-definitiva');
    expect($rule->fresh()->status_code)->toBe(301);

    $this->actingAs($admin)->delete("/admin/redirects/{$rule->id}")->assertRedirect();
    $this->assertDatabaseMissing('redirect_rules', ['id' => $rule->id]);
});
