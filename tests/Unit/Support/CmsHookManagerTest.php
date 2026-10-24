<?php

use App\Support\Cms\CmsHookManager;

it('executes actions in order of priority', function () {
    $hooks = new CmsHookManager;
    $executed = [];

    $hooks->addAction('test.action', function () use (&$executed) {
        $executed[] = 'normal';
    }, 10);

    $hooks->addAction('test.action', function () use (&$executed) {
        $executed[] = 'early';
    }, 5);

    $hooks->addAction('test.action', function () use (&$executed) {
        $executed[] = 'late';
    }, 20);

    $hooks->doAction('test.action');

    expect($executed)->toBe(['early', 'normal', 'late']);
});

it('applies filters in order of priority', function () {
    $hooks = new CmsHookManager;

    $hooks->addFilter('test.filter', fn (string $val) => $val.'-third', 30);
    $hooks->addFilter('test.filter', fn (string $val) => $val.'-first', 10);
    $hooks->addFilter('test.filter', fn (string $val) => $val.'-second', 20);

    $result = $hooks->applyFilters('test.filter', 'start');

    expect($result)->toBe('start-first-second-third');
});

it('correctly reports existing actions and filters and allows removing them', function () {
    $hooks = new CmsHookManager;

    expect($hooks->hasAction('custom.action'))->toBeFalse();
    expect($hooks->hasFilter('custom.filter'))->toBeFalse();

    $hooks->addAction('custom.action', fn () => null);
    $hooks->addFilter('custom.filter', fn ($val) => $val);

    expect($hooks->hasAction('custom.action'))->toBeTrue();
    expect($hooks->hasFilter('custom.filter'))->toBeTrue();

    $hooks->removeAllActions('custom.action');
    $hooks->removeAllFilters('custom.filter');

    expect($hooks->hasAction('custom.action'))->toBeFalse();
    expect($hooks->hasFilter('custom.filter'))->toBeFalse();
});
