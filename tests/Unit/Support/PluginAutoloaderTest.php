<?php

use App\Support\Cms\PluginAutoloader;
use Tests\TestCase;

uses(TestCase::class);

it('dynamically registers namespaces from plugin directory', function () {
    $autoloader = new PluginAutoloader;
    $registered = $autoloader->registerAll(base_path('modules/plugins'));

    expect($registered)->toBeArray();
    expect($registered)->toHaveKey('atlas-forge-editor');
    expect($registered)->toHaveKey('atlas-oauth-connect');

    $forge = $registered['atlas-forge-editor'];
    expect($forge)->toHaveKey('Modules\\Plugins\\AtlasForgeEditor\\');

    $oauth = $registered['atlas-oauth-connect'];
    expect($oauth)->toHaveKey('Modules\\Plugins\\AtlasOAuthConnect\\');

    expect(class_exists('Modules\\Plugins\\AtlasForgeEditor\\PluginServiceProvider'))->toBeTrue();
    expect(class_exists('Modules\\Plugins\\AtlasOAuthConnect\\PluginServiceProvider'))->toBeTrue();
});
