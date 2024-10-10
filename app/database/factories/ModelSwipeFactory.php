<?php

namespace Database\Factories;

use App\Models\ModelSwipe;
use App\Models\OfUser;
use Illuminate\Database\Eloquent\Factories\Factory;
use JetBrains\PhpStorm\ArrayShape;

/**
 * @extends Factory<ModelSwipe>
 */
class ModelSwipeFactory extends Factory
{
    protected $model = ModelSwipe::class;

    #[ArrayShape([
        'model_id' => "integer",
        'like' => "bool",
        'ip' => "string",
        'session_id' => "string",
        'date' => "\DateTime"])
    ]
    public function definition(): array
    {
        return [
            'model_id' => OfUser::factory(),
            'like' => fake()->boolean(),
            'ip' => fake()->ipv4(),
            'session_id' => fake()->uuid(),
            'date' => fake()->dateTime(),
        ];
    }
}
