<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class University extends Model
{
    protected $fillable = [
        'name',
        'description',
        'logo',
        'website',
        'location',
        'qr_token',
        'admin_id',
    ];

    protected static function boot()
    {
        parent::boot();

        // Automatically generate a unique qr_token when creating a university
        static::creating(function ($university) {
            if (empty($university->qr_token)) {
                $university->qr_token = (string) Str::uuid();
            }
        });
    }

    public function visits(): HasMany
    {
        return $this->hasMany(StudentVisit::class, 'university_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function points(): HasMany
    {
        return $this->hasMany(UniversityPoint::class, 'university_id');
    }
}
