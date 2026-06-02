<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Modulo extends Model
{
    use LogsActivity;

    protected $table = 'modulos';

    protected $primaryKey = 'idModulos';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'idModulos',
        'nmodulo',
        'orden',
        'icono',
        'color',
        'detalle',
        'activo',
        'translations',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('navigation')
            ->logOnly(['idModulos', 'nmodulo', 'orden', 'icono', 'color', 'detalle', 'activo', 'translations'])
            ->logOnlyDirty();
    }

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'translations' => 'array',
        ];
    }

    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class, 'idModulos', 'idModulos');
    }

    public function labelFor(string $locale = 'es'): string
    {
        return data_get($this->translations, $locale)
            ?: data_get($this->translations, 'es')
            ?: $this->nmodulo;
    }
}
