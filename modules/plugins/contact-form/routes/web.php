<?php

use Illuminate\Support\Facades\Route;
use Modules\Plugins\ContactForm\Http\Controllers\AdminContactController;
use Modules\Plugins\ContactForm\Http\Controllers\ContactSubmissionController;

Route::post('/contact/send', [ContactSubmissionController::class, 'submit'])
    ->middleware(['web', 'throttle:10,1'])
    ->name('contact.send');

Route::middleware(['web', 'auth'])
    ->prefix('admin/contact-messages')
    ->name('admin.contact-messages.')
    ->group(function () {
        Route::get('/', [AdminContactController::class, 'index'])->name('index');
        Route::post('/{message}/toggle-read', [AdminContactController::class, 'toggleRead'])->name('toggle-read');
        Route::delete('/{message}', [AdminContactController::class, 'destroy'])->name('destroy');
    });
