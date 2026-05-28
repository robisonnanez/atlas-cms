<?php

use App\Models\CmsMenu;

it('renders nested public menu items from the menu tree', function () {
    $menu = CmsMenu::query()->create([
        'name' => 'Primary navigation',
        'location' => 'primary',
        'description' => 'Main website navigation',
    ]);

    $services = $menu->items()->create([
        'label' => 'Servicios',
        'url' => '/servicios',
        'type' => 'custom',
        'sort_order' => 1,
        'target' => '_self',
    ]);

    $pricing = $menu->items()->create([
        'label' => 'Costos',
        'url' => '/costos',
        'type' => 'custom',
        'parent_id' => $services->id,
        'sort_order' => 1,
        'target' => '_self',
    ]);

    $menu->items()->create([
        'label' => 'Plan Empresarial',
        'url' => '/costos/empresarial',
        'type' => 'custom',
        'parent_id' => $pricing->id,
        'sort_order' => 1,
        'target' => '_self',
    ]);

    $this->get('/')
        ->assertOk()
        ->assertSee('Servicios')
        ->assertSee('Costos')
        ->assertSee('Plan Empresarial');
});
