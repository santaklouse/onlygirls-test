<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

Artisan::command('inspire', fn() => $this->comment(Inspiring::quote()))
    ->purpose('Display an inspiring quote')
    ->hourly();

Artisan::command('pwgen {len=16}', function (int $len = 16) {
    if ($len < 10) {
        $this->error('Length must be at least 10 characters');
        return;
    }
    $this->call('app:generate-password', [
        'length' => $len,
        '--symbols' => true
    ]);
})->purpose('Generate strong password');
