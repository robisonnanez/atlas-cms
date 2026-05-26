<?php

namespace App\Domain\Menus\Contracts;

interface MenuResolverContract
{
    public function resolve(string $location): array;
}
