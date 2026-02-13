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
        $placeholderTerms =
            'Bem-vindo ao Driver Pay. Estes são os termos de uso padrão. O administrador deve editar este conteúdo.';
        $placeholderPrivacy =
            'Esta é a política de privacidade padrão do Driver Pay. O administrador deve editar este conteúdo.';

        $terms = <<<'TXT'
TERMOS DE USO – DRIVER PAY

1. ACEITE E VIGÊNCIA
1.1. Estes Termos de Uso (“Termos”) regulam o acesso e a utilização da plataforma Driver Pay (“Plataforma”), incluindo o site, painéis e quaisquer funcionalidades disponibilizadas.
1.2. Ao acessar, cadastrar-se ou utilizar a Plataforma, o usuário declara ter lido, compreendido e aceitado integralmente estes Termos.
1.3. Estes Termos podem ser atualizados a qualquer momento. A versão vigente será aquela publicada na Plataforma.

2. DEFINIÇÕES
2.1. “Usuário”: pessoa que acessa ou utiliza a Plataforma, incluindo motoristas, administradores e demais perfis.
2.2. “Conta”: credenciais de acesso do Usuário, vinculadas a dados pessoais e histórico de uso.
2.3. “Plano PRO”: acesso a recursos adicionais, conforme disponibilização na Plataforma, podendo decorrer de assinatura paga ou bônus temporário.

3. CADASTRO E RESPONSABILIDADE PELA CONTA
3.1. O Usuário deve fornecer informações verdadeiras, completas e atualizadas.
3.2. O Usuário é responsável por manter a confidencialidade de suas credenciais e por todas as ações realizadas em sua Conta.
3.3. Em caso de suspeita de uso indevido, o Usuário deve comunicar imediatamente a equipe responsável pela Plataforma.

4. USO DA PLATAFORMA
4.1. A Plataforma destina-se ao gerenciamento e organização de informações e recursos relacionados ao uso do Driver Pay, conforme as funcionalidades disponibilizadas.
4.2. É vedado ao Usuário:
a) utilizar a Plataforma para fins ilícitos, fraudulentos ou em desacordo com estes Termos;
b) tentar acessar áreas restritas ou sistemas sem autorização;
c) interferir, danificar ou sobrecarregar a infraestrutura da Plataforma;
d) inserir conteúdo que viole direitos de terceiros, inclusive propriedade intelectual, imagem e privacidade.

5. PLANO PRO, BÔNUS E PRAZOS
5.1. O acesso ao Plano PRO pode ser concedido por assinatura ou por bônus temporário (“PRO bônus”), incluindo concessões administrativas.
5.2. O prazo do PRO bônus é contado em dias, conforme exibido na Plataforma, e pode ser estendido por novas concessões.
5.3. O término do PRO (assinatura ou bônus) implica retorno às funcionalidades do plano gratuito, salvo nova contratação ou concessão.

6. LIMITAÇÃO DE RESPONSABILIDADE
6.1. A Plataforma é fornecida “no estado em que se encontra”, podendo sofrer indisponibilidades, manutenções e atualizações.
6.2. A equipe responsável envidará esforços razoáveis para manter a Plataforma disponível e segura, mas não garante ausência de falhas ou interrupções.
6.3. A responsabilidade da Plataforma limita-se ao máximo permitido pela legislação aplicável.

7. PROPRIEDADE INTELECTUAL
7.1. A marca, layout, código-fonte, bancos de dados e demais elementos da Plataforma são protegidos por leis de propriedade intelectual.
7.2. É proibida a reprodução, engenharia reversa, modificação ou distribuição não autorizada.

8. PRIVACIDADE E PROTEÇÃO DE DADOS
8.1. O tratamento de dados pessoais observará a Política de Privacidade publicada na Plataforma.

9. DISPOSIÇÕES GERAIS E FORO
9.1. Caso qualquer disposição destes Termos seja considerada inválida, as demais permanecerão válidas.
9.2. Fica eleito o foro da comarca do domicílio do controlador da Plataforma, salvo disposição legal específica em sentido diverso.
TXT;

        $privacy = <<<'TXT'
POLÍTICA DE PRIVACIDADE – DRIVER PAY

1. OBJETIVO
1.1. Esta Política de Privacidade descreve como o Driver Pay (“Plataforma”) coleta, utiliza, armazena e protege dados pessoais, em conformidade com a legislação aplicável, incluindo a Lei Geral de Proteção de Dados (LGPD).

2. DADOS COLETADOS
2.1. Dados cadastrais: nome, e-mail e informações necessárias para autenticação.
2.2. Dados de uso: registros de acesso, eventos de navegação, logs técnicos e dados relacionados ao uso das funcionalidades.
2.3. Dados de pagamento/assinatura: informações relativas ao status de assinatura e elegibilidade a recursos (ex.: PRO), sem expor segredos, tokens ou credenciais.

3. FINALIDADES DO TRATAMENTO
3.1. Permitir o acesso à Plataforma e autenticar o Usuário.
3.2. Fornecer funcionalidades, suporte e comunicação operacional.
3.3. Prevenir fraudes, promover segurança e auditoria de acesso.
3.4. Cumprir obrigações legais e regulatórias.

4. BASES LEGAIS
4.1. O tratamento poderá ocorrer com base em: execução de contrato, cumprimento de obrigação legal/regulatória, legítimo interesse, e/ou consentimento, conforme aplicável.

5. COMPARTILHAMENTO
5.1. Os dados podem ser compartilhados com prestadores de serviço essenciais à operação (ex.: infraestrutura, armazenamento, mensageria), sempre sob obrigações de confidencialidade e segurança.
5.2. Não vendemos dados pessoais.

6. ARMAZENAMENTO E SEGURANÇA
6.1. Adotamos medidas técnicas e organizacionais para proteger dados contra acessos não autorizados, destruição, perda, alteração e divulgação indevida.
6.2. O período de retenção observará a finalidade do tratamento e as obrigações legais aplicáveis.

7. DIREITOS DO TITULAR
7.1. O titular poderá solicitar: confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação, informação sobre compartilhamento e revogação de consentimento, quando aplicável.

8. COOKIES E TECNOLOGIAS SEMELHANTES
8.1. A Plataforma pode utilizar cookies estritamente necessários e tecnologias equivalentes para autenticação, segurança e melhoria de experiência.

9. ATUALIZAÇÕES
9.1. Esta Política pode ser atualizada periodicamente. A versão vigente será aquela publicada na Plataforma.
TXT;

        $termsDoc = LegalDocument::firstOrCreate(
            ['type' => 'terms_of_use'],
            [
                'title' => 'Termos de Uso',
                'content' => $terms,
                'is_published' => 'true',
            ]
        );

        if ($termsDoc->content === $placeholderTerms) {
            $termsDoc->update([
                'title' => 'Termos de Uso',
                'content' => $terms,
                'is_published' => 'true',
            ]);
        }

        $privacyDoc = LegalDocument::firstOrCreate(
            ['type' => 'privacy_policy'],
            [
                'title' => 'Política de Privacidade',
                'content' => $privacy,
                'is_published' => 'true',
            ]
        );

        if ($privacyDoc->content === $placeholderPrivacy) {
            $privacyDoc->update([
                'title' => 'Política de Privacidade',
                'content' => $privacy,
                'is_published' => 'true',
            ]);
        }
    }
}
