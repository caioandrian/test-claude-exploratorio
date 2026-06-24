// EXP-009 — Validações do formulário de dados pessoais (Etapa 3)
// @mock (injeção de sessão — validações no front-end sem chamada de API)
//
// Hipóteses de bug:
//   1. Comparação de emails não é case-sensitive — TEST@EMAIL.COM aceito como igual a test@email.com
//   2. Data de nascimento no futuro (2099) é aceita sem validação de idade
//   3. Telefone com dígitos insuficientes passa na validação
//   4. Campos obrigatórios vazios não exibem mensagens de erro individuais
//
// Padrão de detecção de bug:
//   Testes que esperam que o sistema REJEITE uma entrada usam cy.get('body').then() para
//   verificar o estado ANTES de fazer asserções de elemento. Se o app avançou para o próximo
//   step (bug presente), o step atual é desmontado — cy.get('#step-user-data') retornaria 0
//   elementos com mensagem "not found", o que não comunica o bug. O padrão correto é falhar
//   explicitamente com a descrição do bug quando o app avança indevidamente.

const APP_URL = 'https://caioandrian.github.io/webstore-ingressos-sample'

// Helper: verifica se o app permaneceu no step-user-data após tentar avançar.
// Se avançou para payment (bug), lança erro descritivo em vez de "not found".
const assertBloqueouNavegacao = (descricaoBug) => {
  cy.get('body').then(($body) => {
    if ($body.find('#step-payment').length > 0 || $body.find('#step-user-data').length === 0) {
      throw new Error(`[BUG CONFIRMADO] ${descricaoBug}`)
    }
  })
  cy.get('#step-user-data').should('be.visible')
  cy.get('#step-payment').should('not.exist')
}

describe('[ST] EXP-009 — Validações no formulário de dados pessoais (Etapa 3) @mock', () => {
  let usuario

  before(() => {
    cy.fixture('showtickets/usuario').then((f) => { usuario = f.base })
  })

  beforeEach(() => {
    cy.stIniciar(usuario)
    cy.stIrParaCompra('rock-festival-2025')
    cy.stSelecionarIngresso('pista', 'inteira', 1)
    cy.stAvancar()
    cy.get('#step-addons, #step-addons-empty').should('be.visible')
    cy.stAvancar()
    cy.get('#step-user-data').should('be.visible')
  })

  // ─── Hipótese 1 — E-mail case-insensitive ────────────────────────────────────
  it('deve rejeitar confirmação de email com capitalização diferente (case-insensitive bug)', () => {
    cy.get('#field-email').clear().type('test@showtests.com')
    cy.get('#field-confirmEmail').clear().type('TEST@SHOWTESTS.COM')
    cy.stAvancar()

    // Se o app avançou para payment, o bug está presente: comparação é case-insensitive
    assertBloqueouNavegacao('Sistema aceitou TEST@SHOWTESTS.COM como igual a test@showtests.com — comparação de email é case-insensitive')
    cy.get('#error-confirmEmail').should('be.visible')
  })

  // ─── Hipótese 2 — Data de nascimento no futuro ────────────────────────────────
  it('deve rejeitar data de nascimento no futuro', () => {
    cy.stConfirmarEmail(usuario.email)
    cy.get('#field-birthdate').clear().type('2099-01-01')
    cy.stAvancar()

    // Se avançou para payment, o bug está presente: data futura não validada
    assertBloqueouNavegacao('Sistema aceitou data de nascimento 2099-01-01 sem validação de idade mínima')
  })

  // ─── Hipótese 3 — Telefone com dígitos insuficientes ─────────────────────────
  it('deve rejeitar telefone com número insuficiente de dígitos', () => {
    cy.stConfirmarEmail(usuario.email)
    cy.get('#field-phone').clear().type('11999') // 5 dígitos — insuficiente
    cy.stAvancar()

    // Se avançou para payment, o bug está presente: validação de comprimento não existe
    assertBloqueouNavegacao('Sistema aceitou telefone "11999" (5 dígitos) sem validar comprimento mínimo')
    cy.get('#error-phone').should('be.visible')
  })

  // ─── Hipótese 4 — Campos obrigatórios individualmente ────────────────────────
  it('deve exibir erros individuais para nome e email obrigatórios vazios', () => {
    // Limpa apenas os campos com validação de "required" independente.
    // NOTA: #error-confirmEmail NÃO é independentemente obrigatório — ele só aparece
    // quando #field-email tem valor e #field-confirmEmail é diferente. Quando ambos
    // estão vazios, o app mostra apenas #error-email. Testar confirmEmail em cenário
    // separado (deve rejeitar confirmação completamente diferente).
    cy.get('#field-name').clear()
    cy.get('#field-email').clear()
    cy.stAvancar()

    cy.get('#step-user-data').should('be.visible')
    cy.get('#error-name').should('be.visible')
    cy.get('#error-email').should('be.visible')
  })

  // ─── Hipótese 4b — confirmEmail só valida quando email tem valor ──────────────
  it('deve exibir erro em confirmEmail quando email tem valor mas confirmação está vazia', () => {
    // Demonstra que #error-confirmEmail é uma validação de correspondência,
    // não de campo obrigatório independente
    cy.get('#field-email').clear().type('qa@showtests.com')
    cy.get('#field-confirmEmail').clear()
    cy.stAvancar()

    assertBloqueouNavegacao('Sistema avançou com #field-confirmEmail vazio quando #field-email tem valor')
    cy.get('#error-confirmEmail').should('be.visible')
  })

  // ─── Validação positiva — e-mail com "+" ─────────────────────────────────────
  it('deve aceitar emails válidos com caracteres especiais permitidos (+)', () => {
    cy.get('#field-email').clear().type('qa+teste@showtests.com')
    cy.get('#field-confirmEmail').clear().type('qa+teste@showtests.com')
    cy.stAvancar()

    // Deve avançar para o step de pagamento (email com + é RFC 5321 válido)
    cy.get('#step-payment', { timeout: 5000 }).should('be.visible')
  })

  // ─── Validação negativa — e-mails completamente diferentes ───────────────────
  it('deve rejeitar confirmação de email completamente diferente', () => {
    cy.get('#field-email').clear().type('usuario@showtests.com')
    cy.get('#field-confirmEmail').clear().type('outro@showtests.com')
    cy.stAvancar()

    assertBloqueouNavegacao('Sistema aceitou emails completamente diferentes como correspondentes')
    cy.get('#error-confirmEmail').should('be.visible')
  })
})
