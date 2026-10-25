<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RedirectRule;
use App\Support\Cms\CmsHookManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RedirectRuleController extends Controller
{
    public function __construct(
        protected ?CmsHookManager $hooks = null,
    ) {
        $this->hooks = $hooks ?? app(CmsHookManager::class);
    }

    public function index(): Response
    {
        return Inertia::render('admin/redirects/index', [
            'redirects' => RedirectRule::query()->latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'source_path' => ['required', 'string', 'max:255', 'unique:redirect_rules,source_path'],
            'target_url' => ['required', 'string', 'max:255'],
            'status_code' => ['required', 'in:301,302,307,308'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['source_path'] = '/'.ltrim($data['source_path'], '/');
        $data['is_active'] = (bool) ($data['is_active'] ?? true);
        $data['status_code'] = (int) $data['status_code'];

        $rule = RedirectRule::query()->create($data);

        $this->hooks->doAction('admin.redirect.created', $rule);

        return back()->with('success', 'Regla de redirección creada correctamente.');
    }

    public function update(Request $request, RedirectRule $redirectRule): RedirectResponse
    {
        $data = $request->validate([
            'source_path' => ['required', 'string', 'max:255', 'unique:redirect_rules,source_path,'.$redirectRule->id],
            'target_url' => ['required', 'string', 'max:255'],
            'status_code' => ['required', 'in:301,302,307,308'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['source_path'] = '/'.ltrim($data['source_path'], '/');
        $data['is_active'] = (bool) ($data['is_active'] ?? true);
        $data['status_code'] = (int) $data['status_code'];

        $redirectRule->update($data);

        $this->hooks->doAction('admin.redirect.updated', $redirectRule);

        return back()->with('success', 'Regla de redirección actualizada correctamente.');
    }

    public function destroy(RedirectRule $redirectRule): RedirectResponse
    {
        $this->hooks->doAction('admin.redirect.deleting', $redirectRule);

        $redirectRule->delete();

        $this->hooks->doAction('admin.redirect.deleted', $redirectRule);

        return back()->with('success', 'Regla de redirección eliminada correctamente.');
    }
}
