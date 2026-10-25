<?php

use App\Http\Controllers\Api\V1\ContentApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::get('pages', [ContentApiController::class, 'pages'])->name('pages.index');
    Route::get('pages/{slug}', [ContentApiController::class, 'page'])->name('pages.show');

    Route::get('posts', [ContentApiController::class, 'posts'])->name('posts.index');
    Route::get('posts/{slug}', [ContentApiController::class, 'post'])->name('posts.show');

    Route::get('categories', [ContentApiController::class, 'categories'])->name('categories.index');
    Route::get('tags', [ContentApiController::class, 'tags'])->name('tags.index');
    Route::get('menus/{location?}', [ContentApiController::class, 'menu'])->name('menus.show');
    Route::get('settings/public', [ContentApiController::class, 'settings'])->name('settings.public');
    Route::get('search', [ContentApiController::class, 'search'])->name('search');
});
