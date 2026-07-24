<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransportUnit;
use Illuminate\Http\Request;

class TransportUnitController extends Controller
{
    private function unitQuery()
    {
        return TransportUnit::with(['driver', 'route']);
    }

    /**
     * Display a listing of all transport units.
     */
    public function index()
    {
        $units = $this->unitQuery()->get();

        return response()->json([
            'success' => true,
            'data' => $units
        ]);
    }

    /**
     * Display details of a specific transport unit.
     */
    public function show($id)
    {
        $unit = $this->unitQuery()->find($id);

        if (!$unit) {
            return response()->json([
                'success' => false,
                'message' => 'Unidad de transporte no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $unit
        ]);
    }

    public function store(Request $request)
    {
        $unit = TransportUnit::create($this->validatedData($request));
        return response()->json(['success' => true, 'data' => $this->unitQuery()->find($unit->id)], 201);
    }

    public function update(Request $request, $id)
    {
        $unit = TransportUnit::findOrFail($id);
        $unit->update($this->validatedData($request, $unit->id));
        return response()->json(['success' => true, 'data' => $this->unitQuery()->find($unit->id)]);
    }

    public function destroy($id)
    {
        TransportUnit::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    public function updateLocation(Request $request, $id)
    {
        $unit = $this->ownedUnit($request, $id);
        $data = $request->validate(['latitude' => 'required|numeric|between:-90,90', 'longitude' => 'required|numeric|between:-180,180', 'speed' => 'nullable|integer|min:0|max:300']);
        $unit->update($data);
        return response()->json(['success' => true, 'data' => $this->unitQuery()->find($unit->id)]);
    }

    public function updateStatus(Request $request, $id)
    {
        $unit = $this->ownedUnit($request, $id);
        $data = $request->validate(['status' => 'required|in:in_service,out_of_service,maintenance']);
        $unit->update($data);
        return response()->json(['success' => true, 'data' => $this->unitQuery()->find($unit->id)]);
    }

    private function ownedUnit(Request $request, $id): TransportUnit
    {
        $unit = TransportUnit::findOrFail($id);
        abort_unless($request->user()->role === 'admin' || $unit->driver_id === $request->user()->id, 403);
        return $unit;
    }

    private function validatedData(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'unit_number' => 'required|string|max:255|unique:transport_units,unit_number,' . $id,
            'plate' => 'required|string|max:255|unique:transport_units,plate,' . $id,
            'driver_name' => 'nullable|string|max:255', 'route_name' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90', 'longitude' => 'nullable|numeric|between:-180,180',
            'speed' => 'nullable|integer|min:0|max:300', 'status' => 'required|in:in_service,out_of_service,maintenance',
        ]);
    }
}
