<?php

namespace App\Http\Controllers;

use App\Models\LegalDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LegalDocumentController extends Controller
{
    public function edit(string $type)
    {
        abort_unless(in_array($type, ['terms_of_use', 'privacy_policy']), 404);

        $document = LegalDocument::firstOrNew(['type' => $type]);
        
        // Define default titles if new
        if (!$document->exists) {
            $document->title = $type === 'terms_of_use' ? 'Termos de Uso' : 'Política de Privacidade';
        }

        return Inertia::render('Legal/Master/Edit', [
            'document' => $document,
            'type' => $type,
        ]);
    }

    public function update(Request $request, string $type)
    {
        abort_unless(in_array($type, ['terms_of_use', 'privacy_policy']), 404);

        $validated = $request->validate([
            'content' => 'required|string',
            'title' => 'required|string|max:255',
            'is_published' => 'boolean',
        ]);

        $document = LegalDocument::updateOrCreate(
            ['type' => $type],
            [
                'title' => $validated['title'],
                'content' => $validated['content'],
                'is_published' => $validated['is_published'] ?? true,
            ]
        );

        return back()->with('success', 'Documento atualizado com sucesso.');
    }

    public function show(string $type)
    {
        // Map 'termos-de-uso' to 'terms_of_use' and 'politica-de-privacidade' to 'privacy_policy' for prettier URLs if needed
        // But let's stick to simple mapping first or use the type directly.
        // User asked for "url publica". 
        
        $dbType = match($type) {
            'termos-de-uso' => 'terms_of_use',
            'politica-de-privacidade' => 'privacy_policy',
            default => $type
        };

        abort_unless(in_array($dbType, ['terms_of_use', 'privacy_policy']), 404);

        $document = LegalDocument::where('type', $dbType)->where('is_published', true)->firstOrFail();

        return Inertia::render('Legal/Show', [
            'document' => $document,
        ]);
    }
}
