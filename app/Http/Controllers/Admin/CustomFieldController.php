<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomField;
use App\Support\Cms\CmsHookManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomFieldController extends Controller
{
    public function __construct(
        protected ?CmsHookManager $hooks = null,
    ) {
        $this->hooks = $hooks ?? app(CmsHookManager::class);
    }

    public function index(): Response
    {
        return Inertia::render('admin/custom-fields/index', [
            'fields' => CustomField::query()->orderBy('sort_order')->orderBy('name')->get(),
            'types' => ['text', 'textarea', 'number', 'boolean', 'date', 'url', 'select', 'media'],
            'targets' => ['all', 'page', 'post'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:custom_fields,slug'],
            'type' => ['required', 'in:text,textarea,number,boolean,date,url,select,media'],
            'target_type' => ['required', 'in:all,page,post'],
            'options' => ['nullable', 'array'],
            'placeholder' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_required' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['slug'] = ! empty($data['slug']) ? Str::slug($data['slug']) : Str::slug($data['name']);
        $data['is_required'] = (bool) ($data['is_required'] ?? false);
        $data['is_active'] = (bool) ($data['is_active'] ?? true);
        $data['sort_order'] = (int) ($data['sort_order'] ?? 0);

        $field = CustomField::query()->create($data);

        $this->hooks->doAction('admin.custom_field.created', $field);

        return back()->with('success', 'Campo personalizado creado correctamente.');
    }

    public function update(Request $request, CustomField $customField): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:text,textarea,number,boolean,date,url,select,media'],
            'target_type' => ['required', 'in:all,page,post'],
            'options' => ['nullable', 'array'],
            'placeholder' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_required' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['is_required'] = (bool) ($data['is_required'] ?? false);
        $data['is_active'] = (bool) ($data['is_active'] ?? true);
        $data['sort_order'] = (int) ($data['sort_order'] ?? 0);

        $customField->update($data);

        $this->hooks->doAction('admin.custom_field.updated', $customField);

        return back()->with('success', 'Campo personalizado actualizado correctamente.');
    }

    public function destroy(CustomField $customField): RedirectResponse
    {
        $this->hooks->doAction('admin.custom_field.deleting', $customField);

        $customField->delete();

        $this->hooks->doAction('admin.custom_field.deleted', $customField);

        return back()->with('success', 'Campo personalizado eliminado correctamente.');
    }
}
