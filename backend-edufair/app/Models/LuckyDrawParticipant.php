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

        // Automatically generate sequential participant number (e.g. 0001, 0002...)
        static::creating(function ($participant) {
            if (empty($participant->participant_number)) {
                $count = static::count();
                $participant->participant_number = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
