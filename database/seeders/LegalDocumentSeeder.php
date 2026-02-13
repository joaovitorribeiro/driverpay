<?php

namespace Database\Seeders;

use App\Models\LegalDocument;
use Illuminate\Database\Seeder;

class LegalDocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        LegalDocument::firstOrCreate(
            ['type' => 'terms_of_use'],
            [
                'title' => 'Termos de Uso',
                'content' => 'Bem-vindo ao Driver Pay. Estes são os termos de uso padrão. O administrador deve editar este conteúdo.',
                'is_published' => 'true',
            ]
        );

        LegalDocument::firstOrCreate(
            ['type' => 'privacy_policy'],
            [
                'title' => 'Política de Privacidade',
                'content' => 'Esta é a política de privacidade padrão do Driver Pay. O administrador deve editar este conteúdo.',
                'is_published' => 'true',
            ]
        );
    }
}
