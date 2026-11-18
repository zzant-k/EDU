<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class LuckyDrawParticipant extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'student_id',
        'participant_number',
        'joined_at',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        // Automatically generate a unique, clean participant number if not set
        static::creating(function ($participant) {
            if (empty($participant->participant_number)) {
                $participant->participant_number = 'EDUP-' . strtoupper(Str::random(6));
            }
        });
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
