<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    private const PLANS = [
        'free' => ['name' => 'Gratis', 'route_limit' => 1, 'daily_complaint_limit' => 1],
        'economico' => ['name' => 'Económico', 'route_limit' => 6, 'daily_complaint_limit' => 5],
        'plus' => ['name' => 'Plus', 'route_limit' => null, 'daily_complaint_limit' => null],
    ];

    public static function benefits(string $plan): array
    {
        return self::PLANS[$plan] ?? self::PLANS['free'];
    }

    public function show(Request $request)
    {
        $user = $request->user();
        $benefits = self::benefits($user->subscription_plan);
        $used = Complaint::where('user_id', $user->id)->whereDate('created_at', today())->count();

        return response()->json(['success' => true, 'plan' => $user->subscription_plan, 'benefits' => $benefits, 'complaints_today' => $used]);
    }

    // Punto de integración para una pasarela real. Por ahora permite probar
    // los planes sin cobro y debe sustituirse por una confirmación de pago.
    public function selectPlan(Request $request)
    {
        $data = $request->validate(['plan' => 'required|in:free,economico,plus']);
        $request->user()->update(['subscription_plan' => $data['plan']]);
        return $this->show($request);
    }
}
