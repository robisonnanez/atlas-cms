<?php

namespace App\Models;

use App\Support\Cms\CmsHookManager;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Artisan;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Throwable;

class ScheduledTask extends Model
{
    use LogsActivity;

    protected $fillable = [
        'name',
        'command',
        'expression',
        'description',
        'is_active',
        'last_run_at',
        'next_run_at',
        'last_status',
        'last_output',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_run_at' => 'datetime',
            'next_run_at' => 'datetime',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('system')
            ->logOnly(['name', 'command', 'expression', 'is_active'])
            ->logOnlyDirty();
    }

    public function runs(): HasMany
    {
        return $this->hasMany(ScheduledTaskRun::class)->latest('started_at');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function execute(): ScheduledTaskRun
    {
        $startedAt = now();
        $startTime = microtime(true);
        $status = 'success';
        $output = '';

        try {
            $exitCode = Artisan::call($this->command);
            $output = Artisan::output();
            if ($exitCode !== 0) {
                $status = 'failed';
            }
        } catch (Throwable $e) {
            $status = 'failed';
            $output = $e->getMessage()."\n".$e->getTraceAsString();
        }

        $durationMs = (int) round((microtime(true) - $startTime) * 1000);
        $finishedAt = now();

        $run = $this->runs()->create([
            'status' => $status,
            'output' => $output,
            'duration_ms' => $durationMs,
            'started_at' => $startedAt,
            'finished_at' => $finishedAt,
        ]);

        $this->update([
            'last_run_at' => $startedAt,
            'last_status' => $status,
            'last_output' => $output,
        ]);

        if (app()->bound(CmsHookManager::class)) {
            app(CmsHookManager::class)->doAction('task.executed', $this, $run);
        }

        if (function_exists('activity')) {
            activity('system')
                ->performedOn($this)
                ->event('task_run')
                ->withProperties([
                    'status' => $status,
                    'duration_ms' => $durationMs,
                ])
                ->log("Tarea '{$this->name}' ejecutada con estado '{$status}'");
        }

        return $run;
    }
}
