<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Theme extends Model
{
    use LogsActivity;

    protected $fillable = [
        'name',
        'slug',
        'version',
        'author',
        'is_active',
        'settings',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('theme')
            ->logOnly(['name', 'slug', 'version', 'author', 'is_active', 'settings'])
            ->logOnlyDirty();
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'settings' => 'array',
        ];
    }
}
