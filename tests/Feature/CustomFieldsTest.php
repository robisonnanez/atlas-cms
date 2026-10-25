<?php

use App\Models\CustomField;
use App\Models\Page;
use App\Models\Post;
use App\Models\User;

it('allows storing, updating and deleting custom fields via admin endpoints', function () {
    $admin = User::factory()->create();

    // Crear campo personalizado
    $response = $this->actingAs($admin)->post('/admin/custom-fields', [
        'name' => 'Subtítulo Destacado',
        'slug' => 'featured-subtitle',
        'type' => 'text',
        'target_type' => 'all',
        'placeholder' => 'Escribe un subtítulo',
        'is_required' => false,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('custom_fields', [
        'slug' => 'featured-subtitle',
        'type' => 'text',
    ]);

    $field = CustomField::query()->where('slug', 'featured-subtitle')->firstOrFail();

    // Actualizar campo personalizado
    $updateResponse = $this->actingAs($admin)->put("/admin/custom-fields/{$field->id}", [
        'name' => 'Subtítulo Principal Modificado',
        'type' => 'text',
        'target_type' => 'page',
        'is_required' => true,
    ]);

    $updateResponse->assertRedirect();
    expect($field->fresh()->name)->toBe('Subtítulo Principal Modificado');
    expect($field->fresh()->target_type)->toBe('page');
    expect($field->fresh()->is_required)->toBeTrue();

    // Eliminar campo personalizado
    $deleteResponse = $this->actingAs($admin)->delete("/admin/custom-fields/{$field->id}");
    $deleteResponse->assertRedirect();
    $this->assertDatabaseMissing('custom_fields', ['id' => $field->id]);
});

it('allows pages and posts to store and retrieve custom field values via HasCustomFields trait', function () {
    $field1 = CustomField::query()->create([
        'name' => 'Precio Producto',
        'slug' => 'product_price',
        'type' => 'number',
        'target_type' => 'page',
    ]);

    $field2 = CustomField::query()->create([
        'name' => 'Destacado en Portada',
        'slug' => 'featured_home',
        'type' => 'boolean',
        'target_type' => 'all',
    ]);

    $page = Page::query()->create([
        'title' => 'Landing Producto',
        'slug' => 'landing-producto',
        'status' => 'published',
        'template' => 'page',
    ]);

    // Sincronizar campos
    $page->syncCustomFields([
        'product_price' => 199.99,
        'featured_home' => true,
    ]);

    expect($page->getCustomField('product_price'))->toBe('199.99');
    expect($page->getCustomField('featured_home'))->toBe('1');

    $payload = $page->customFieldsPayload();
    expect($payload)->toHaveKey('product_price');
    expect($payload['product_price']['value'])->toBe(199.99);
    expect($payload['featured_home']['value'])->toBeTrue();

    // Mismo comportamiento para Post
    $post = Post::query()->create([
        'title' => 'Artículo con campos',
        'slug' => 'articulo-con-campos',
        'status' => 'published',
    ]);

    $post->setCustomField('featured_home', false);
    expect($post->customFieldsPayload()['featured_home']['value'])->toBeFalse();
});
