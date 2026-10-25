<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class RedirectRule extends Model
{
    use LogsActivity;

    protected $fillable = [
        'source_path',
        'target_url',
        'status_code',
        'hits',
        'is_active',
        'description',
        'last_accessed_at',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('redirect_rule')
            ->logOnly(['source_path', 'target_url', 'status_code', 'is_active'])
            ->logOnlyDirty();
    }

    protected function casts(): array
    {
        return [
            'status_code' => 'integer',
            'hits' => 'integer',
            'is_active' => 'boolean',
            'last_accessed_at' => 'datetime',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function recordHit(): void
    {
        $this->increment('hits');
        $this->updateQuietly(['last_accessed_at' => now()]);
    }
}
