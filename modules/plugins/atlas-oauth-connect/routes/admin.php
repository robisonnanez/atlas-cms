<?php

use Illuminate\Support\Facades\Route;
use Modules\Plugins\AtlasOAuthConnect\Http\Controllers\Admin\OAuthSettingsController;

Route::get('/', [OAuthSettingsController::class, 'index'])
    ->middleware('can:atlas.settings.view')
    ->name('index');

Route::put('/', [OAuthSettingsController::class, 'update'])
    ->middleware('can:atlas.settings.edit')
    ->name('update');
