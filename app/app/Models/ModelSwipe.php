<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\OfUser;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModelSwipe extends Model
{
    use HasFactory;

    protected $primaryKey = 'model_id';
    protected $table = 'model_swipes';
    public $incrementing = false;

    protected $fillable = [
        'model_id',
        'like',
        'ip',
        'session_id',
        'date',
    ];

    public $timestamps = false;

    public function model(): BelongsTo
    {
        return $this->belongsTo(OfUser::class, 'model_id');
    }

    public function ofUser(): BelongsTo
    {
        return $this->belongsTo(OfUser::class, 'model_id');
    }

}
