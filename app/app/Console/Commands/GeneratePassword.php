<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Symfony\Component\Console\Input\InputDefinition;

class GeneratePassword extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:generate-password {length=8} {--symbols}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate password';

    /**
     * Execute the console command.
     * @option length
     */
    public function handle()
    {
        $passwd = Str::password(
            $this->argument('length'),
            TRUE,
            TRUE,
            $this->option('symbols'),
            FALSE
        );
        $this->line($passwd);
    }
}
