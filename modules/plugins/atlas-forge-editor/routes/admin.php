<?php

use Illuminate\Support\Facades\Route;
use Modules\Plugins\AtlasForgeEditor\Http\Controllers\Admin\EditorSettingsController;

Route::get('/', EditorSettingsController::class)->name('settings');
