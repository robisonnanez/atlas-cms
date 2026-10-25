<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class CustomField extends Model
{
    use LogsActivity;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'target_type',
        'options',
        'placeholder',
        'description',
        'is_required',
        'sort_order',
        'is_active',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('custom_field')
            ->logOnly(['name', 'slug', 'type', 'target_type', 'is_active'])
            ->logOnlyDirty();
    }

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function values(): HasMany
    {
        return $this->hasMany(CustomFieldValue::class, 'custom_field_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order')->orderBy('name');
    }

    public function scopeForTarget($query, string $targetType)
    {
        return $query->whereIn('target_type', [$targetType, 'all']);
    }
}
