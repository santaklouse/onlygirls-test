<?php

namespace Database\Seeders;

use App\Models\ModelSwipe;
use App\Models\OfUser;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;


class ModelSwipeSeeder extends Seeder
{
    public function run()
    {
        $users = OfUser::all();

        ModelSwipe::factory()
            ->count(10001)
            ->for($users->random())
            ->create([
                'like' => true
            ])
        ;

        ModelSwipe::factory()
            ->count(30003)
            ->sequence(
                ['model_id' => $users->random(), 'like' => true],
                ['model_id' => $users->random(), 'like' => true],
                ['model_id' => $users->random(), 'like' => true]
            )
            ->create();

        ModelSwipe::factory()
            ->count(100000)
            ->state(new Sequence(
                fn (Sequence $sequence) => ['model_id' => $users->random()],
            ))
            ->create();
    }
}
