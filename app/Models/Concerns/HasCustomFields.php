<?php

namespace App\Models\Concerns;

use App\Models\CustomField;
use App\Models\CustomFieldValue;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasCustomFields
{
    public function customFieldValues(): MorphMany
    {
        return $this->morphMany(CustomFieldValue::class, 'fieldable');
    }

    /**
     * Obtiene el valor de un campo personalizado por su slug.
     */
    public function getCustomField(string $slug, mixed $default = null): mixed
    {
        $valueModel = $this->customFieldValues()
            ->whereHas('customField', fn ($query) => $query->where('slug', $slug))
            ->first();

        return $valueModel ? $valueModel->value : $default;
    }

    /**
     * Guarda o actualiza el valor de un campo personalizado.
     */
    public function setCustomField(string $slug, mixed $value): void
    {
        $field = CustomField::query()->where('slug', $slug)->first();

        if (! $field) {
            return;
        }

        $stringValue = is_array($value) ? json_encode($value) : (string) ($value ?? '');

        $this->customFieldValues()->updateOrCreate(
            ['custom_field_id' => $field->id],
            ['value' => $stringValue],
        );
    }

    /**
     * Sincroniza una colección asociativa de campos personalizados [slug => valor].
     *
     * @param  array<string, mixed>  $fieldsData
     */
    public function syncCustomFields(array $fieldsData): void
    {
        if (empty($fieldsData)) {
            return;
        }

        $fields = CustomField::query()
            ->whereIn('slug', array_keys($fieldsData))
            ->get()
            ->keyBy('slug');

        foreach ($fieldsData as $slug => $value) {
            $field = $fields->get($slug);
            if (! $field) {
                continue;
            }

            $stringValue = is_array($value) ? json_encode($value) : (string) ($value ?? '');

            $this->customFieldValues()->updateOrCreate(
                ['custom_field_id' => $field->id],
                ['value' => $stringValue],
            );
        }
    }

    /**
     * Retorna una representación serializada de todos los campos personalizados asociados.
     *
     * @return array<string, array<string, mixed>>
     */
    public function customFieldsPayload(): array
    {
        $values = $this->customFieldValues()->with('customField')->get();

        $payload = [];
        foreach ($values as $item) {
            $field = $item->customField;
            if (! $field) {
                continue;
            }

            $val = $item->value;
            if ($field->type === 'boolean') {
                $val = filter_var($val, FILTER_VALIDATE_BOOL);
            } elseif ($field->type === 'number') {
                $val = is_numeric($val) ? (float) $val : $val;
            } elseif ($field->type === 'select' && str_starts_with((string) $val, '[')) {
                $decoded = json_decode((string) $val, true);
                if (is_array($decoded)) {
                    $val = $decoded;
                }
            }

            $payload[$field->slug] = [
                'name' => $field->name,
                'slug' => $field->slug,
                'type' => $field->type,
                'value' => $val,
            ];
        }

        return $payload;
    }
}
