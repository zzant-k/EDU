<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('universities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->string('website')->nullable();
            $table->string('location')->nullable();
            $table->string('qr_token')->unique();
            $table->timestamps();
        });

        Schema::create('student_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('university_id')->constrained('universities')->onDelete('cascade');
            $table->timestamp('visited_at');
            
            // Prevent duplicate visits by a single student to the same university
            $table->unique(['student_id', 'university_id']);
        });

        Schema::create('lucky_draw_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('participant_number')->unique();
            $table->timestamp('joined_at');
        });

        Schema::create('winners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('prize');
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('winners');
        Schema::dropIfExists('lucky_draw_participants');
        Schema::dropIfExists('student_visits');
        Schema::dropIfExists('universities');
    }
};
