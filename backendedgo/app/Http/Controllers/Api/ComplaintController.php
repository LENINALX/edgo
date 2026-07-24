<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Api\SubscriptionController;

class ComplaintController extends Controller
{
    /**
     * Display a listing of the authenticated user's complaints.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Paginate complaints for performance and usability
        $complaints = Complaint::with('transportUnit')
            ->withCount('confirmations')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $complaints->items(),
            'current_page' => $complaints->currentPage(),
            'last_page' => $complaints->lastPage(),
            'total' => $complaints->total(),
        ]);
    }

    public function community(Request $request)
    {
        $user = $request->user();
        $complaints = Complaint::with(['transportUnit.driver', 'transportUnit.route'])
            ->withCount('confirmations')
            ->where('user_id', '!=', $user->id)
            ->latest()
            ->get();

        $confirmedIds = $user->complaints()->getQuery()
            ->getConnection()->table('complaint_confirmations')
            ->where('user_id', $user->id)
            ->whereIn('complaint_id', $complaints->pluck('id'))
            ->pluck('complaint_id')
            ->all();

        $complaints->each(fn ($complaint) => $complaint->setAttribute('confirmed_by_me', in_array($complaint->id, $confirmedIds)));
        return response()->json(['success' => true, 'data' => $complaints]);
    }

    public function toggleConfirmation(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);
        abort_if($complaint->user_id === $request->user()->id, 422, 'No puedes confirmar tu propia queja');

        $confirmation = $complaint->confirmations()->where('user_id', $request->user()->id)->first();
        if ($confirmation) {
            $confirmation->delete();
            $confirmed = false;
        } else {
            $complaint->confirmations()->create(['user_id' => $request->user()->id]);
            $confirmed = true;
        }

        return response()->json(['success' => true, 'confirmed' => $confirmed, 'confirmations_count' => $complaint->confirmations()->count()]);
    }

    /**
     * Store a newly created complaint in storage.
     */
    public function store(Request $request)
    {
        $benefits = SubscriptionController::benefits($request->user()->subscription_plan);
        $usedToday = Complaint::where('user_id', $request->user()->id)->whereDate('created_at', today())->count();
        if ($benefits['daily_complaint_limit'] !== null && $usedToday >= $benefits['daily_complaint_limit']) {
            return response()->json(['success' => false, 'message' => 'Alcanzaste el límite diario de reportes de tu plan. Mejora tu suscripción para continuar.'], 403);
        }
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
            'transport_unit_id' => 'nullable|exists:transport_units,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $complaint = Complaint::create([
            'user_id' => $request->user()->id,
            'transport_unit_id' => $request->transport_unit_id,
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'status' => 'pending', // Defaults to pending review
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Queja registrada exitosamente',
            'data' => $complaint->load('transportUnit')
        ], 201);
    }

    /**
     * Display the specified complaint.
     */
    public function show(Request $request, $id)
    {
        $complaint = Complaint::with(['user', 'transportUnit'])
            ->where('id', $id)
            ->when($request->user()->role !== 'admin', fn ($query) => $query->where('user_id', $request->user()->id))
            ->first();

        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Queja no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $complaint
        ]);
    }

    public function adminIndex()
    {
        return response()->json(['success' => true, 'data' => Complaint::with(['user', 'transportUnit.driver', 'transportUnit.route'])->latest()->get()]);
    }

    public function updateStatus(Request $request, $id)
    {
        $data = $request->validate(['status' => 'required|in:pending,reviewing,resolved']);
        $complaint = Complaint::findOrFail($id);
        $complaint->update($data);
        return response()->json(['success' => true, 'data' => $complaint->fresh()->load(['user', 'transportUnit.driver', 'transportUnit.route'])]);
    }
}
