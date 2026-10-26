<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_modules', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->boolean('show_title')->default(true);
            $table->string('type', 60);
            $table->string('position', 60);
            $table->string('theme_slug', 60)->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('content')->nullable();
            $table->json('assignment')->nullable();
            $table->string('custom_classes')->nullable();
            $table->timestamps();

            $table->index(['position', 'is_active', 'order']);
            $table->index(['theme_slug', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_modules');
    }
};
