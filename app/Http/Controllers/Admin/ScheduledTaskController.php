<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScheduledTask;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduledTaskController extends Controller
{
    public function index(): Response
    {
        $tasks = ScheduledTask::query()
            ->with(['runs' => fn ($q) => $q->take(5)])
            ->latest()
            ->get();

        return Inertia::render('admin/scheduled-tasks/index', [
            'tasks' => $tasks,
            'stats' => [
                'total' => $tasks->count(),
                'active' => $tasks->where('is_active', true)->count(),
                'failed' => $tasks->where('last_status', 'failed')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'command' => ['required', 'string', 'max:255'],
            'expression' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['is_active'] = $request->boolean('is_active', true);

        ScheduledTask::query()->create($data);

        return redirect()->route('admin.scheduled-tasks.index')
            ->with('success', 'Tarea programada creada exitosamente.');
    }

    public function update(Request $request, ScheduledTask $scheduledTask): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'command' => ['required', 'string', 'max:255'],
            'expression' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['is_active'] = $request->boolean('is_active', $scheduledTask->is_active);

        $scheduledTask->update($data);

        return redirect()->route('admin.scheduled-tasks.index')
            ->with('success', 'Tarea programada actualizada exitosamente.');
    }

    public function destroy(ScheduledTask $scheduledTask): RedirectResponse
    {
        $scheduledTask->delete();

        return redirect()->route('admin.scheduled-tasks.index')
            ->with('success', 'Tarea programada eliminada exitosamente.');
    }

    public function run(ScheduledTask $scheduledTask): RedirectResponse
    {
        $run = $scheduledTask->execute();

        if ($run->status === 'success') {
            return back()->with('success', "Tarea ejecutada correctamente en {$run->duration_ms}ms.");
        }

        return back()->with('error', 'La tarea falló al ejecutarse. Revisa la salida de registro.');
    }

    public function toggle(ScheduledTask $scheduledTask): RedirectResponse
    {
        $scheduledTask->update([
            'is_active' => ! $scheduledTask->is_active,
        ]);

        $statusText = $scheduledTask->is_active ? 'activada' : 'desactivada';

        return back()->with('success', "Tarea {$statusText} correctamente.");
    }
}
