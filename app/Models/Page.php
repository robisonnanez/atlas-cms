<?php

namespace App\Models;

use App\Models\Concerns\HasPublishingState;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Page extends Model
{
    use HasPublishingState, LogsActivity;

    protected $fillable = [
        'title',
        'slug',
        'status',
        'template',
        'excerpt',
        'content_json',
        'content_html',
        'seo_title',
        'seo_description',
        'featured_media_id',
        'published_at',
        'author_id',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('content')
            ->logOnly(['title', 'slug', 'status', 'template', 'excerpt', 'seo_title', 'seo_description', 'featured_media_id', 'published_at', 'author_id'])
            ->logOnlyDirty();
    }

    protected function casts(): array
    {
        return [
            'content_json' => 'array',
            'published_at' => 'datetime',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function revisions(): MorphMany
    {
        return $this->morphMany(Revision::class, 'revisable');
    }
}
