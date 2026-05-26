<?php

use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PluginController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TaxonomyController;
use App\Http\Controllers\Admin\ThemeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InstallController;
use App\Http\Controllers\PublicSiteController;
use Illuminate\Support\Facades\Route;

Route::get('/install', [InstallController::class, 'welcome'])->name('install.welcome');
Route::get('/install/requirements', [InstallController::class, 'requirements'])->name('install.requirements');
Route::get('/install/database', [InstallController::class, 'database'])->name('install.database');
Route::get('/install/admin', [InstallController::class, 'admin'])->name('install.admin');
Route::get('/install/site', [InstallController::class, 'site'])->name('install.site');
Route::post('/install/finish', [InstallController::class, 'finish'])->name('install.finish');

Route::any('register', static function () {
    abort(404);
})->name('register.blocked');

Route::get('/auth/error', static fn () => inertia('auth/error'))->name('auth.error');
Route::get('/auth/access', static fn () => inertia('auth/access'))->name('auth.access');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('pages', [PageController::class, 'index'])->middleware('permission:atlas.pages.view')->name('pages.index');
        Route::get('pages/create', [PageController::class, 'create'])->middleware('permission:atlas.pages.create')->name('pages.create');
        Route::post('pages', [PageController::class, 'store'])->middleware('permission:atlas.pages.create')->name('pages.store');
        Route::get('pages/{page}/edit', [PageController::class, 'edit'])->middleware('permission:atlas.pages.edit')->name('pages.edit');
        Route::put('pages/{page}', [PageController::class, 'update'])->middleware('permission:atlas.pages.edit')->name('pages.update');
        Route::delete('pages/{page}', [PageController::class, 'destroy'])->middleware('permission:atlas.pages.delete')->name('pages.destroy');
        Route::post('pages/{page}/revisions/{revision}/restore', [PageController::class, 'restoreRevision'])
            ->middleware('permission:atlas.pages.restore')
            ->name('pages.revisions.restore');
        Route::get('posts', [PostController::class, 'index'])->middleware('permission:atlas.posts.view')->name('posts.index');
        Route::get('posts/create', [PostController::class, 'create'])->middleware('permission:atlas.posts.create')->name('posts.create');
        Route::post('posts', [PostController::class, 'store'])->middleware('permission:atlas.posts.create')->name('posts.store');
        Route::get('posts/{post}/edit', [PostController::class, 'edit'])->middleware('permission:atlas.posts.edit')->name('posts.edit');
        Route::put('posts/{post}', [PostController::class, 'update'])->middleware('permission:atlas.posts.edit')->name('posts.update');
        Route::delete('posts/{post}', [PostController::class, 'destroy'])->middleware('permission:atlas.posts.delete')->name('posts.destroy');
        Route::post('posts/{post}/revisions/{revision}/restore', [PostController::class, 'restoreRevision'])
            ->middleware('permission:atlas.posts.restore')
            ->name('posts.revisions.restore');

        Route::get('categories', [TaxonomyController::class, 'index'])->middleware('permission:atlas.taxonomies.view')->name('taxonomies.index');
        Route::post('categories', [TaxonomyController::class, 'storeCategory'])->middleware('permission:atlas.taxonomies.create')->name('categories.store');
        Route::put('categories/{category}', [TaxonomyController::class, 'updateCategory'])->middleware('permission:atlas.taxonomies.edit')->name('categories.update');
        Route::delete('categories/{category}', [TaxonomyController::class, 'destroyCategory'])->middleware('permission:atlas.taxonomies.delete')->name('categories.destroy');
        Route::post('tags', [TaxonomyController::class, 'storeTag'])->middleware('permission:atlas.taxonomies.create')->name('tags.store');
        Route::put('tags/{tag}', [TaxonomyController::class, 'updateTag'])->middleware('permission:atlas.taxonomies.edit')->name('tags.update');
        Route::delete('tags/{tag}', [TaxonomyController::class, 'destroyTag'])->middleware('permission:atlas.taxonomies.delete')->name('tags.destroy');

        Route::get('media', [MediaController::class, 'index'])->middleware('permission:atlas.media.view')->name('media.index');
        Route::post('media', [MediaController::class, 'store'])->middleware('permission:atlas.media.create')->name('media.store');
        Route::put('media/{medium}', [MediaController::class, 'update'])->middleware('permission:atlas.media.edit')->name('media.update');

        Route::get('menus', [MenuController::class, 'index'])->middleware('permission:atlas.menus.view')->name('menus.index');
        Route::post('menus', [MenuController::class, 'store'])->middleware('permission:atlas.menus.create')->name('menus.store');
        Route::post('menus/{menu}/items', [MenuController::class, 'storeItem'])->middleware('permission:atlas.menus.create')->name('menus.items.store');
        Route::put('menus/{menu}/items/reorder', [MenuController::class, 'reorderItems'])->middleware('permission:atlas.menus.reorder')->name('menus.items.reorder');
        Route::put('menu-items/{item}', [MenuController::class, 'updateItem'])->middleware('permission:atlas.menus.edit')->name('menus.items.update');

        Route::get('themes', [ThemeController::class, 'index'])->middleware('permission:atlas.themes.view')->name('themes.index');
        Route::post('themes/{theme}/activate', [ThemeController::class, 'activate'])->middleware('permission:atlas.themes.activate')->name('themes.activate');

        Route::get('plugins', [PluginController::class, 'index'])->middleware('permission:atlas.plugins.view')->name('plugins.index');
        Route::post('plugins/{plugin}/toggle', [PluginController::class, 'toggle'])->middleware('permission:atlas.plugins.toggle')->name('plugins.toggle');

        Route::get('settings', [SettingController::class, 'edit'])->middleware('permission:atlas.settings.view')->name('settings.edit');
        Route::put('settings', [SettingController::class, 'update'])->middleware('permission:atlas.settings.edit')->name('settings.update');
    });
});

Route::get('/', [PublicSiteController::class, 'home'])->name('home');
Route::get('/blog', [PublicSiteController::class, 'blog'])->name('blog.index');
Route::get('/blog/{post:slug}', [PublicSiteController::class, 'post'])->name('blog.show');
Route::get('/category/{category:slug}', [PublicSiteController::class, 'category'])->name('category.show');
Route::get('/tag/{slug}', [PublicSiteController::class, 'tag'])->name('tag.show');
Route::get('/{page:slug}', [PublicSiteController::class, 'page'])->name('page.show');

require __DIR__.'/settings.php';
