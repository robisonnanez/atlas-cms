<?php

namespace App\Models\Concerns;

use App\Support\Cms\CmsHookManager;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;

trait HasPublishingState
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_IN_REVIEW = 'in_review';

    public const STATUS_SCHEDULED = 'scheduled';

    public const STATUS_PUBLISHED = 'published';

    public const STATUS_ARCHIVED = 'archived';

    public static function allowedStatuses(): array
    {
        return [
            self::STATUS_DRAFT,
            self::STATUS_IN_REVIEW,
            self::STATUS_SCHEDULED,
            self::STATUS_PUBLISHED,
            self::STATUS_ARCHIVED,
        ];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where(function (Builder $builder) {
            $builder->where(function (Builder $q) {
                $q->where('status', self::STATUS_PUBLISHED)
                    ->where(function (Builder $sub) {
                        $sub->whereNull('published_at')
                            ->orWhere('published_at', '<=', now());
                    });
            })->orWhere(function (Builder $q) {
                $q->where('status', self::STATUS_SCHEDULED)
                    ->whereNotNull('published_at')
                    ->where('published_at', '<=', now());
            });
        });
    }

    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    public function scopeInReview(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_IN_REVIEW);
    }

    public function scopeScheduled(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    public function scopeArchived(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ARCHIVED);
    }

    public function scopeWithStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function isPublished(): bool
    {
        if ($this->status === self::STATUS_PUBLISHED) {
            return is_null($this->published_at) || $this->published_at->isPast();
        }

        if ($this->status === self::STATUS_SCHEDULED) {
            return ! is_null($this->published_at) && $this->published_at->isPast();
        }

        return false;
    }

    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function isInReview(): bool
    {
        return $this->status === self::STATUS_IN_REVIEW;
    }

    public function isScheduled(): bool
    {
        return $this->status === self::STATUS_SCHEDULED;
    }

    public function isArchived(): bool
    {
        return $this->status === self::STATUS_ARCHIVED;
    }

    public function transitionTo(string $newStatus, ?CarbonInterface $publishedAt = null): self
    {
        if (! in_array($newStatus, self::allowedStatuses(), true)) {
            throw new \InvalidArgumentException("Estado de publicación inválido: {$newStatus}");
        }

        $oldStatus = $this->status;
        $this->status = $newStatus;

        if ($newStatus === self::STATUS_PUBLISHED) {
            if ($publishedAt) {
                $this->published_at = $publishedAt;
            } elseif (is_null($this->published_at) || $this->published_at->isFuture()) {
                $this->published_at = now();
            }
        } elseif ($newStatus === self::STATUS_SCHEDULED) {
            if ($publishedAt) {
                $this->published_at = $publishedAt;
            } elseif (is_null($this->published_at)) {
                $this->published_at = now()->addHour();
            }
        } elseif (in_array($newStatus, [self::STATUS_DRAFT, self::STATUS_IN_REVIEW, self::STATUS_ARCHIVED], true)) {
            if ($publishedAt) {
                $this->published_at = $publishedAt;
            }
        }

        $this->save();

        if (app()->bound(CmsHookManager::class)) {
            app(CmsHookManager::class)->doAction('content.status_changed', $this, $oldStatus, $newStatus);
        }

        if (function_exists('activity')) {
            activity('content')
                ->performedOn($this)
                ->event('status_changed')
                ->withProperties([
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                    'published_at' => $this->published_at?->toIso8601String(),
                ])
                ->log("Estado cambiado de '{$oldStatus}' a '{$newStatus}'");
        }

        return $this;
    }
}
