<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait HasPublishingState
{
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }
}
