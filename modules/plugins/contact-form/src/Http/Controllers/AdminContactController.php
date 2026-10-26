<?php

namespace Modules\Plugins\ContactForm\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Plugins\ContactForm\Models\ContactMessage;

class AdminContactController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status');

        $query = ContactMessage::query()
            ->when($status === 'unread', fn ($q) => $q->unread())
            ->when($status === 'read', fn ($q) => $q->where('is_read', true))
            ->latest();

        $messages = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/contact-messages/index', [
            'messages' => $messages,
            'stats' => [
                'total' => ContactMessage::count(),
                'unread' => ContactMessage::query()->unread()->count(),
            ],
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    public function toggleRead(ContactMessage $message): RedirectResponse
    {
        $message->update(['is_read' => ! $message->is_read]);

        return back()->with('success', $message->is_read ? 'Mensaje marcado como leído.' : 'Mensaje marcado como no leído.');
    }

    public function destroy(ContactMessage $message): RedirectResponse
    {
        $message->delete();

        return redirect('/admin/contact-messages')
            ->with('success', 'Mensaje eliminado correctamente.');
    }
}
