<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Controller;
use Inertia\Response;

class ModelController extends Controller
{
    private ?string $apiUrl;

    public function __construct()
    {
        $this->apiUrl = config('app.api_url');
    }

    /**
     * @param Request $request
     * @param string|null $modelId
     * @return Response
     */
    public function index(Request $request, string $modelId = NULL): Response
    {
        $sessionId = $request->session()->getId();

        $modelsApiOptions = [
            'session_id' => $sessionId,
            'include_model_id' => $modelId
        ];

        return inertia('Models', [
            'models' => fn () => Http::get("{$this->apiUrl}/models", $modelsApiOptions)->json(),
            'modelId' => $modelId
        ]);
    }

    /**
     * @param Request $request
     * @return void
     */
    public function grade(Request $request): void
    {
        $sessionId = $request->session()->getId();
        $type = $request->input('type');
        $modelId = $request->input('model_id');

        if (!$modelId) {
            return;
        }

        Http::put("{$this->apiUrl}/models/grade", [
            'model_id' => $modelId,
            'type' => $type,
            'ip' => $request->ip(),
            'session_id' => $sessionId
        ]);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function getViewed(Request $request): JsonResponse
    {
        $sessionId = $request->session()->getId();

        $response = Http::get("{$this->apiUrl}/models/get-viewed", [
            'session_id' => $sessionId
        ]);

        return response()->json([
            'viewed' => $response->json('models')
        ], 200);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function replaceViewed(Request $request): JsonResponse
    {
        $sessionId = $request->session()->getId();
        $modelIds = $request->input('viewed');

        if (!$modelIds) {
            return response()->json([
                'message' => 'missing modelIds'
            ], 500);
        }

        $modelIds = explode(';', $modelIds);

        $amount = count($modelIds);
        if (empty($amount)) {
            return response()->json([
                'models' => []
            ]);
        }

        if ($amount > 10) {
            return response()->json([
                'message' => 'Server error'
            ], 500);
        }

        $response = Http::get("{$this->apiUrl}/models/get-random/{$amount}", [
            'session_id' => $sessionId
        ]);

        return response()->json($response->json());
    }

}
