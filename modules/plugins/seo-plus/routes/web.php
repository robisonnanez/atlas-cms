<?php

use Illuminate\Support\Facades\Route;
use Modules\Plugins\SeoPlus\Http\Controllers\RobotsController;
use Modules\Plugins\SeoPlus\Http\Controllers\SitemapController;

Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('seo.sitemap');
Route::get('/robots.txt', [RobotsController::class, 'index'])->name('seo.robots');
