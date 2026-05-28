<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Revision extends Model
{
    use LogsActivity;

    protected $fillable = [
        'revisable_type',
        'revisable_id',
        'snapshot',
        'author_id',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('revision')
            ->logOnly(['revisable_type', 'revisable_id', 'author_id'])
            ->logOnlyDirty();
    }

    protected function casts(): array
    {
        return [
            'snapshot' => 'array',
        ];
    }

    public function revisable(): MorphTo
    {
        return $this->morphTo();
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
