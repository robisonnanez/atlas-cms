<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ContentModule extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'content_modules';

    protected $fillable = [
        'title',
        'show_title',
        'type',
        'position',
        'theme_slug',
        'order',
        'is_active',
        'content',
        'assignment',
        'custom_classes',
    ];

    protected function casts(): array
    {
        return [
            'show_title' => 'boolean',
            'is_active' => 'boolean',
            'order' => 'integer',
            'content' => 'array',
            'assignment' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('content_modules')
            ->logOnly(['title', 'show_title', 'type', 'position', 'theme_slug', 'order', 'is_active', 'content', 'assignment', 'custom_classes'])
            ->logOnlyDirty();
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeForPosition(Builder $query, string $position): Builder
    {
        return $query->where('position', $position);
    }

    public function scopeForTheme(Builder $query, ?string $themeSlug): Builder
    {
        return $query->where(function (Builder $q) use ($themeSlug) {
            $q->whereNull('theme_slug')
                ->when($themeSlug, fn (Builder $sub) => $sub->orWhere('theme_slug', $themeSlug));
        });
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('order')->orderBy('id');
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(CmsMenu::class, 'content->menu_id');
    }
}
