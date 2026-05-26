<?php

namespace App\Support\Cms;

use Illuminate\Filesystem\Filesystem;

class InstallStateStore
{
    public function __construct(
        protected Filesystem $files,
    ) {
    }

    public function installed(): bool
    {
        return $this->files->exists(config('atlas.installation_lock'));
    }

    public function markInstalled(): void
    {
        $this->files->ensureDirectoryExists(dirname(config('atlas.installation_lock')));
        $this->files->put(config('atlas.installation_lock'), now()->toIso8601String());
    }
}
