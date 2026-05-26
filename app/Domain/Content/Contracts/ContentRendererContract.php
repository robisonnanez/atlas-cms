<?php

namespace App\Domain\Content\Contracts;

interface ContentRendererContract
{
    public function render(array $blocks): string;
}
