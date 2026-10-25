<?php

use App\Models\Permission;
use App\Models\ScheduledTask;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;

it('allows managing scheduled tasks via admin endpoints', function () {
    Permission::findOrCreate('atlas.scheduled_tasks.view', 'web');
    Permission::findOrCreate('atlas.scheduled_tasks.manage', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.scheduled_tasks.view', 'atlas.scheduled_tasks.manage');

    $response = $this->actingAs($user)->post('/admin/scheduled-tasks', [
        'name' => 'Limpieza de caché',
        'command' => 'cache:clear',
        'expression' => '0 0 * * *',
        'description' => 'Limpia la caché del sistema diariamente',
        'is_active' => true,
    ]);

    $response->assertRedirect('/admin/scheduled-tasks');
    $this->assertDatabaseHas('scheduled_tasks', [
        'name' => 'Limpieza de caché',
        'command' => 'cache:clear',
        'is_active' => true,
    ]);

    $task = ScheduledTask::query()->where('command', 'cache:clear')->firstOrFail();

    $this->actingAs($user)->put("/admin/scheduled-tasks/{$task->id}", [
        'name' => 'Limpieza de caché optimizada',
        'command' => 'cache:clear',
        'expression' => '*/30 * * * *',
        'description' => 'Limpia cada 30 mins',
        'is_active' => false,
    ])->assertRedirect('/admin/scheduled-tasks');

    expect($task->fresh()->is_active)->toBeFalse();
    expect($task->fresh()->name)->toBe('Limpieza de caché optimizada');

    // Toggle active
    $this->actingAs($user)->post("/admin/scheduled-tasks/{$task->id}/toggle")->assertRedirect();
    expect($task->fresh()->is_active)->toBeTrue();
});

it('executes scheduled tasks and records run history', function () {
    $task = ScheduledTask::query()->create([
        'name' => 'Publicar contenidos',
        'command' => 'atlas:publish-scheduled',
        'expression' => '* * * * *',
        'is_active' => true,
    ]);

    $run = $task->execute();

    expect($run->status)->toBe('success');
    expect($run->duration_ms)->toBeGreaterThanOrEqual(0);
    expect($task->fresh()->last_status)->toBe('success');
    expect($task->fresh()->last_run_at)->not->toBeNull();
    expect($task->runs()->count())->toBe(1);
});

it('runs active scheduled tasks via artisan command atlas:run-scheduled-tasks', function () {
    ScheduledTask::query()->create([
        'name' => 'Comando de prueba',
        'command' => 'inspire',
        'expression' => '* * * * *',
        'is_active' => true,
    ]);

    $exitCode = Artisan::call('atlas:run-scheduled-tasks');
    expect($exitCode)->toBe(0);

    $task = ScheduledTask::query()->where('command', 'inspire')->firstOrFail();
    expect($task->last_status)->toBe('success');
    expect($task->last_run_at)->not->toBeNull();
});

it('triggers manual execution from admin endpoint', function () {
    Permission::findOrCreate('atlas.scheduled_tasks.view', 'web');
    Permission::findOrCreate('atlas.scheduled_tasks.manage', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.scheduled_tasks.view', 'atlas.scheduled_tasks.manage');

    $task = ScheduledTask::query()->create([
        'name' => 'Inspiración manual',
        'command' => 'inspire',
        'expression' => '@daily',
        'is_active' => true,
    ]);

    $this->actingAs($user)->post("/admin/scheduled-tasks/{$task->id}/run")->assertRedirect();

    expect($task->fresh()->runs()->count())->toBe(1);
    expect($task->fresh()->last_status)->toBe('success');
});
