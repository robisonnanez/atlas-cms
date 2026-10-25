<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $logName = $request->query('log_name');
        $event = $request->query('event');
        $search = $request->query('search');
        $subjectType = $request->query('subject_type');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        $query = Activity::query()
            ->with(['causer', 'subject'])
            ->when($logName, fn ($q) => $q->where('log_name', $logName))
            ->when($event, fn ($q) => $q->where('event', $event))
            ->when($subjectType, fn ($q) => $q->where('subject_type', 'like', "%{$subjectType}%"))
            ->when($search, fn ($q) => $q->where('description', 'like', "%{$search}%"))
            ->when($dateFrom, fn ($q) => $q->whereDate('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->whereDate('created_at', '<=', $dateTo))
            ->latest();

        $logs = $query->paginate(20)->withQueryString();

        $availableLogNames = Activity::query()
            ->select('log_name')
            ->distinct()
            ->whereNotNull('log_name')
            ->pluck('log_name');

        $availableEvents = Activity::query()
            ->select('event')
            ->distinct()
            ->whereNotNull('event')
            ->pluck('event');

        return Inertia::render('admin/activity-logs/index', [
            'logs' => $logs,
            'filters' => [
                'log_name' => $logName,
                'event' => $event,
                'search' => $search,
                'subject_type' => $subjectType,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'availableLogNames' => $availableLogNames,
            'availableEvents' => $availableEvents,
            'totalCount' => Activity::count(),
        ]);
    }

    public function show(Activity $activity): Response
    {
        $activity->load(['causer', 'subject']);

        return Inertia::render('admin/activity-logs/show', [
            'activity' => $activity,
        ]);
    }

    public function clear(Request $request): RedirectResponse
    {
        $days = (int) $request->input('days', 30);
        $deleted = Activity::query()
            ->where('created_at', '<', now()->subDays($days))
            ->delete();

        return redirect()->route('admin.activity-logs.index')
            ->with('success', "Se eliminaron {$deleted} registro(s) de auditoría anteriores a {$days} días.");
    }
}
