<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Tests\TestCase;

class PageExpiredRedirectsToLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_token_mismatch_redirects_to_login_for_inertia_requests(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $handler = $this->app->make(\Illuminate\Contracts\Debug\ExceptionHandler::class);

        $request = Request::create('/any', 'POST');
        $request->headers->set('X-Inertia', 'true');
        $request->setLaravelSession($this->app['session.store']);

        $response = $handler->render($request, new TokenMismatchException('CSRF token mismatch'));

        $this->assertSame(409, $response->getStatusCode());
        $this->assertSame(route('login'), $response->headers->get('X-Inertia-Location'));
    }
}
