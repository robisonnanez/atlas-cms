<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Tag extends Model
{
    use LogsActivity;

    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('taxonomy')
            ->logOnly(['name', 'slug', 'description'])
            ->logOnlyDirty();
    }
}
