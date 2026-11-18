<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUniversityAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->role === 'university_admin') {
            return $next($request);
        }

        return response()->json([
            'message' => 'Unauthorized. University Admin access required.',
        ], Response::HTTP_FORBIDDEN);
    }
}
