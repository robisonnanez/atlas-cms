<?php

use App\Models\Permission;
use App\Models\User;
use Spatie\Activitylog\Models\Activity;

it('requires permission to view activity logs', function () {
    Permission::findOrCreate('admin.activity_logs.view', 'web');

    $user = User::factory()->create();

    $this->actingAs($user)->get('/admin/activity-logs')->assertForbidden();

    $user->givePermissionTo('admin.activity_logs.view');
    $this->actingAs($user)->get('/admin/activity-logs')->assertOk();
});

it('lists and filters activity logs in admin', function () {
    Permission::findOrCreate('admin.activity_logs.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('admin.activity_logs.view');

    activity('content')
        ->by($user)
        ->event('status_changed')
        ->log('Post status changed to published');

    activity('system')
        ->by($user)
        ->event('task_run')
        ->log('Scheduled task executed');

    $response = $this->actingAs($user)->get('/admin/activity-logs?log_name=content');
    $response->assertOk();

    $logs = $response->viewData('page')['props']['logs']['data'] ?? [];
    expect(count($logs))->toBeGreaterThanOrEqual(1);
    expect($logs[0]['log_name'])->toBe('content');
});

it('allows viewing details and clearing old activity logs', function () {
    Permission::findOrCreate('admin.activity_logs.view', 'web');
    Permission::findOrCreate('admin.activity_logs.manage', 'web');

    $admin = User::factory()->create();
    $admin->givePermissionTo('admin.activity_logs.view', 'admin.activity_logs.manage');

    $activity = activity('content')
        ->by($admin)
        ->event('created')
        ->withProperties(['key' => 'value'])
        ->log('Nueva página creada');

    $this->actingAs($admin)->get("/admin/activity-logs/{$activity->id}")->assertOk();

    // Create an old activity log
    $oldActivity = activity('system')
        ->by($admin)
        ->log('Log viejo');
    $oldActivity->created_at = now()->subDays(45);
    $oldActivity->save();

    $this->actingAs($admin)->delete('/admin/activity-logs', [
        'days' => 30,
    ])->assertRedirect('/admin/activity-logs');

    expect(Activity::query()->find($oldActivity->id))->toBeNull();
    expect(Activity::query()->find($activity->id))->not->toBeNull();
});
