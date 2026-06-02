<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Menu extends Model
{
    use LogsActivity;

    protected $table = 'menu';

    protected $fillable = [
        'idModulos',
        'nombre',
        'url',
        'icono',
        'id_menu',
        'main',
        'orden',
        'cesdo',
        'permission_name',
        'translations',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('navigation')
            ->logOnly(['idModulos', 'nombre', 'url', 'icono', 'id_menu', 'main', 'orden', 'cesdo', 'permission_name', 'translations'])
            ->logOnlyDirty();
    }

    protected function casts(): array
    {
        return [
            'main' => 'boolean',
            'cesdo' => 'boolean',
            'translations' => 'array',
        ];
    }

    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class, 'idModulos', 'idModulos');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'id_menu');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'id_menu')->orderBy('orden');
    }

    public function labelFor(string $locale = 'es'): string
    {
        return data_get($this->translations, $locale)
            ?: data_get($this->translations, 'es')
            ?: $this->nombre;
    }
}
