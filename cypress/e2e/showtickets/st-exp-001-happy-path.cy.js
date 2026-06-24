// EXP-001 — Happy Path: registro via UI → compra com cartão aprovado → Meus Ingressos
// @real
//
// Hipótese de bug: pedido pode não ser vinculado ao userId correto no localStorage,
// fazendo com que não apareça em "Meus Ingressos" após a compra.
//
// Regra de validação exploratória: o teste para na mensagem de confirmação exibida
// ao usuário e na verificação de pedido em Meus Ingressos — não verifica estado interno.

const APP_URL = 'https://caioandrian.github.io/webstore-ingressos-sample'

describe('[ST] EXP-001 — Happy Path: registro → compra → Meus Ingressos @real', () => {
  let usuario
  let pagamento

  before(() => {
    cy.fixture('showtickets/usuario').then((f) => { usuario = f.base })
    cy.fixture('showtickets/pagamento').then((f) => { pagamento = f })
  })

  beforeEach(() => {
    cy.visit(APP_URL)
    cy.clearLocalStorage()
  })

  it('deve completar registro, comprar ingresso e ver pedido em Meus Ingressos', () => {
    // ── 1. Registro via UI ────────────────────────────────────────────────────
    cy.stRegistrar(usuario)
    cy.get('#user-menu-btn', { timeout: 8000 }).should('be.visible')

    // ── 2. Navegar para compra do Rock Festival ───────────────────────────────
    cy.stIrParaCompra('rock-festival-2025')

    // ── 3. Etapa 1 — Selecionar 1 Pista (inteira) ────────────────────────────
    cy.get('#step-tickets').should('be.visible')
    cy.stSelecionarIngresso('pista', 'inteira', 1)
    // #summary-total está em sidebar position:fixed que pode ser coberto por outros elementos
    cy.get('#summary-total').scrollIntoView().should('be.visible')
    cy.stAvancar()

    // ── 4. Etapa 2 — Pular add-ons ───────────────────────────────────────────
    cy.get('#step-addons').should('be.visible')
    cy.stAvancar()

    // ── 5. Etapa 3 — Confirmar email (demais campos pré-preenchidos da sessão) ─
    cy.get('#step-user-data').should('be.visible')
    cy.stConfirmarEmail(usuario.email)
    cy.stAvancar()

    // ── 6. Etapa 4 — Pagamento com cartão aprovado ────────────────────────────
    cy.get('#step-payment').should('be.visible')
    cy.stSelecionarPagamento('credit')
    cy.stPreencherCartao(pagamento.cartaoAprovado)
    cy.stAvancar()

    // ── 7. Etapa 5 — Confirmação de sucesso (mock delay 2.2s) ─────────────────
    cy.stAguardarConfirmacao('success')
    cy.get('#order-confirmation-card').should('be.visible')
    cy.get('#order-id').invoke('text').should('not.be.empty')

    // ── 8. Verificar pedido em Meus Ingressos ─────────────────────────────────
    // Hipótese de bug: pedido pode não ter sido vinculado ao userId
    cy.get('#user-menu-btn').click()
    cy.get('#menu-tickets').click()
    cy.get('#my-tickets-page', { timeout: 5000 }).should('be.visible')
    cy.get('#orders-list').should('be.visible')
    cy.get('[data-cy="ticket-card"]').should('have.length.at.least', 1)
    cy.get('[data-cy="order-event-title"]').first().should('contain.text', 'Rock Festival')
  })
})
