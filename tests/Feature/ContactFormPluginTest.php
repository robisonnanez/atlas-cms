<?php

use App\Models\Plugin;
use App\Models\User;
use App\Support\Cms\CmsHookManager;
use App\Support\Cms\ContentRenderer;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Modules\Plugins\ContactForm\Models\ContactMessage;
use Modules\Plugins\ContactForm\PluginServiceProvider;

beforeEach(function () {
    app()->register(PluginServiceProvider::class);

    if (! Schema::hasTable('contact_messages')) {
        Artisan::call('migrate', [
            '--path' => 'modules/plugins/contact-form/database/migrations',
            '--realpath' => false,
        ]);
    }

    Plugin::query()->updateOrCreate(
        ['slug' => 'contact-form'],
        [
            'name' => 'Formulario de Contacto',
            'provider' => PluginServiceProvider::class,
            'is_active' => true,
            'settings' => [
                'success_message' => '¡Gracias! Tu mensaje ha sido enviado exitosamente.',
            ],
        ]
    );
});

it('accepts valid contact submission and persists message to database', function () {
    $hookFired = false;
    $receivedMessage = null;

    app(CmsHookManager::class)->addAction('contact_form.message_received', function ($message) use (&$hookFired, &$receivedMessage) {
        $hookFired = true;
        $receivedMessage = $message;
    });

    $payload = [
        'name' => 'Robison Ñañez',
        'email' => 'robison@example.com',
        'phone' => '+57 300 1234567',
        'subject' => 'Consulta de Proyecto',
        'message' => 'Hola, me gustaría solicitar información sobre Atlas CMS.',
    ];

    $response = $this->post('/contact/send', $payload);

    $response->assertRedirect();
    $response->assertSessionHas('success', '¡Gracias! Tu mensaje ha sido enviado exitosamente.');

    $this->assertDatabaseHas('contact_messages', [
        'name' => 'Robison Ñañez',
        'email' => 'robison@example.com',
        'phone' => '+57 300 1234567',
        'subject' => 'Consulta de Proyecto',
        'is_read' => false,
    ]);

    expect($hookFired)->toBeTrue();
    expect($receivedMessage)->toBeInstanceOf(ContactMessage::class);
    expect($receivedMessage->email)->toBe('robison@example.com');
});

it('supports JSON submission for headless or AJAX contact forms', function () {
    $payload = [
        'name' => 'Carlos Frontend',
        'email' => 'carlos@frontend.dev',
        'message' => 'Mensaje enviado via fetch API',
    ];

    $response = $this->postJson('/contact/send', $payload);

    $response->assertOk();
    $response->assertJson([
        'status' => 'success',
        'message' => '¡Gracias! Tu mensaje ha sido enviado exitosamente.',
    ]);
    $response->assertJsonStructure([
        'status',
        'message',
        'data' => ['id'],
    ]);

    $this->assertDatabaseHas('contact_messages', [
        'email' => 'carlos@frontend.dev',
    ]);
});

it('validates required fields on submission', function () {
    $response = $this->postJson('/contact/send', []);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name', 'email', 'message']);
});

it('silently ignores spam bots that fill honeypot field', function () {
    $payload = [
        '_hp_check' => 'I am a spambot',
        'name' => 'Spam Bot',
        'email' => 'bot@spammer.org',
        'message' => 'Buy cheap medications now!',
    ];

    $response = $this->post('/contact/send', $payload);

    $response->assertRedirect();
    $this->assertDatabaseMissing('contact_messages', [
        'email' => 'bot@spammer.org',
    ]);
    expect(ContactMessage::count())->toBe(0);
});

it('renders contact form HTML block via content.render_block filter', function () {
    $renderer = app(ContentRenderer::class);

    $blocks = [
        [
            'type' => 'contact_form',
            'data' => [
                'title' => 'Ponte en contacto con nuestro equipo',
            ],
        ],
    ];

    $html = $renderer->render($blocks);

    expect($html)
        ->toContain('atlas-contact-form-wrapper')
        ->toContain('Ponte en contacto con nuestro equipo')
        ->toContain('action="'.url('/contact/send').'"')
        ->toContain('name="name"')
        ->toContain('name="email"')
        ->toContain('name="_hp_check"');
});

it('replaces [contact-form] shortcode via content.after_render filter', function () {
    $hooks = app(CmsHookManager::class);

    $content = '<div class="rich-text"><p>Antes del formulario</p>[contact-form]<p>Después del formulario</p></div>';

    $rendered = $hooks->applyFilters('content.after_render', $content);

    expect($rendered)
        ->toContain('Antes del formulario')
        ->toContain('atlas-contact-form-wrapper')
        ->toContain('action="'.url('/contact/send').'"')
        ->not->toContain('[contact-form]');
});

it('protects admin messages endpoints with authentication', function () {
    $response = $this->get('/admin/contact-messages');
    $response->assertRedirect('/login');
});

it('allows authenticated users to view, toggle read and delete contact messages', function () {
    $user = User::factory()->create();

    $msg1 = ContactMessage::query()->create([
        'name' => 'Ana Torres',
        'email' => 'ana@example.com',
        'subject' => 'Consulta 1',
        'message' => 'Mensaje 1 no leído',
        'is_read' => false,
    ]);

    $msg2 = ContactMessage::query()->create([
        'name' => 'Luis Gomez',
        'email' => 'luis@example.com',
        'subject' => 'Consulta 2',
        'message' => 'Mensaje 2 leído',
        'is_read' => true,
    ]);

    $response = $this->actingAs($user)->get('/admin/contact-messages');
    $response->assertOk();

    $unreadResponse = $this->actingAs($user)->get('/admin/contact-messages?status=unread');
    $unreadResponse->assertOk();

    $toggleResponse = $this->actingAs($user)->post("/admin/contact-messages/{$msg1->id}/toggle-read");
    $toggleResponse->assertRedirect();
    expect($msg1->fresh()->is_read)->toBeTrue();

    $this->actingAs($user)->post("/admin/contact-messages/{$msg1->id}/toggle-read");
    expect($msg1->fresh()->is_read)->toBeFalse();

    $deleteResponse = $this->actingAs($user)->delete("/admin/contact-messages/{$msg2->id}");
    $deleteResponse->assertRedirect('/admin/contact-messages');
    $this->assertDatabaseMissing('contact_messages', ['id' => $msg2->id]);
});
