// EXP-016 — Recarregar a página durante o fluxo de compra perde o estado
// @real
//
// Hipótese de bug: estado do wizard não é persistido (sem sessionStorage/localStorage
// para o fluxo em andamento) — usuário perde toda a seleção ao pressionar F5.

const APP_URL = 'https://caioandrian.github.io/webstore-ingressos-sample'

describe('[ST] EXP-016 — Recarregamento de página durante fluxo de compra @real', () => {
  let usuario

  before(() => {
    cy.fixture('showtickets/usuario').then((f) => { usuario = f.base })
  })

  beforeEach(() => {
    cy.stIniciar(usuario)
  })

  it('deve perder o estado do wizard ao recarregar na etapa 4 (Pagamento)', () => {
    cy.stIrParaCompra('rock-festival-2025')

    // Avançar até a etapa 4
    cy.stSelecionarIngresso('pista', 'inteira', 1)
    cy.stAvancar()                          // → etapa 2
    cy.stAvancar()                          // → etapa 3
    cy.stConfirmarEmail(usuario.email)
    cy.stAvancar()                          // → etapa 4
    cy.get('#step-payment').should('be.visible')

    // Simula F5
    cy.reload()

    // Hipótese: reinicia em etapa 1, sem dados selecionados
    cy.get('#purchase-page', { timeout: 8000 }).should('be.visible')
    cy.get('#step-tickets').should('be.visible')
    cy.get('#step-payment').should('not.exist')
    // Resumo deve estar zerado (sem ingressos selecionados)
    cy.get('#qty-value-pista-inteira').should('contain', '0')
  })

  it('deve perder ingressos selecionados ao recarregar na etapa 2 (Add-ons)', () => {
    cy.stIrParaCompra('rock-festival-2025')

    cy.stSelecionarIngresso('pista', 'inteira', 2)
    cy.get('#qty-value-pista-inteira').should('contain', '2')
    cy.stAvancar()
    cy.get('#step-addons').should('be.visible')

    cy.reload()

    cy.get('#step-tickets', { timeout: 8000 }).should('be.visible')
    cy.get('#step-addons').should('not.exist')
    // Quantidade deve ter resetado para 0
    cy.get('#qty-value-pista-inteira').should('contain', '0')
  })

  it('deve perder dados pessoais ao recarregar na etapa 3', () => {
    cy.stIrParaCompra('rock-festival-2025')

    cy.stSelecionarIngresso('pista', 'inteira', 1)
    cy.stAvancar()
    cy.stAvancar()
    cy.get('#step-user-data').should('be.visible')
    // Alterar campo antes do reload
    cy.get('#field-name').clear().type('Nome Alterado Antes Do Reload')

    cy.reload()

    cy.get('#step-tickets', { timeout: 8000 }).should('be.visible')
    cy.get('#step-user-data').should('not.exist')
  })
})
