<?php

namespace App\Models;

use App\Models\Concerns\HasPublishingState;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Page extends Model
{
    use HasPublishingState;

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
