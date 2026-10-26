<?php

namespace Modules\Plugins\ContactForm\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Plugin;
use App\Support\Cms\CmsHookManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Modules\Plugins\ContactForm\Models\ContactMessage;

class ContactSubmissionController extends Controller
{
    public function submit(Request $request): JsonResponse|RedirectResponse
    {
        if ($request->filled('_hp_check')) {
            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Mensaje recibido correctamente.',
                ]);
            }

            return back()->with('success', 'Mensaje recibido correctamente.');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $message = ContactMessage::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'subject' => $data['subject'] ?? 'Consulta desde formulario de contacto',
            'message' => $data['message'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'is_read' => false,
        ]);

        if (app()->bound(CmsHookManager::class)) {
            app(CmsHookManager::class)->doAction('contact_form.message_received', $message);
        }

        $plugin = Plugin::query()->where('slug', 'contact-form')->first();
        $settings = $plugin?->settings ?? [];
        $successMessage = $settings['success_message'] ?? '¡Gracias por comunicarte con nosotros! Te responderemos a la brevedad.';

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => $successMessage,
                'data' => [
                    'id' => $message->id,
                ],
            ]);
        }

        return back()->with('success', $successMessage);
    }
}
