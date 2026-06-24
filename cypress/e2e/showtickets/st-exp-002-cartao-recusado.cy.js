// EXP-002 — Cartão iniciado em "5555" é recusado pelo mock de pagamento
// @real
//
// Hipóteses de bug:
//   1. Pedido salvo no localStorage mesmo com pagamento recusado
//   2. Dados do cartão apagados ao clicar em "Tentar Novamente"
//   3. Botão de retry ausente ou não retorna para a etapa de pagamento

const APP_URL = 'https://caioandrian.github.io/webstore-ingressos-sample'

describe('[ST] EXP-002 — Cartão recusado pelo mock (5555) @real', () => {
  let usuario
  let pagamento

  before(() => {
    cy.fixture('showtickets/usuario').then((f) => { usuario = f.base })
    cy.fixture('showtickets/pagamento').then((f) => { pagamento = f })
  })

  beforeEach(() => {
    cy.stIniciar(usuario)
    cy.stIrParaCompra('rock-festival-2025')
    cy.stSelecionarIngresso('pista', 'inteira', 1)
    cy.stAvancar()
    cy.stAvancar() // pular addons
    cy.get('#step-user-data').should('be.visible')
    cy.stConfirmarEmail(usuario.email)
    cy.stAvancar()
    cy.get('#step-payment').should('be.visible')
  })

  it('deve exibir tela de erro ao usar cartão recusado e não salvar pedido', () => {
    cy.stSelecionarPagamento('credit')
    cy.stPreencherCartao(pagamento.cartaoRecusado)
    cy.stAvancar()

    // Confirmação de erro
    cy.stAguardarConfirmacao('error')
    cy.get('#purchase-error').should('be.visible')

    // Hipótese de bug 1: nenhum pedido deve ter sido salvo
    cy.stLerPedidos().then((pedidos) => {
      expect(pedidos).to.have.length(0)
    })
  })

  it('deve exibir botão de Tentar Novamente e retornar à etapa de pagamento', () => {
    cy.stSelecionarPagamento('credit')
    cy.stPreencherCartao(pagamento.cartaoRecusado)
    cy.stAvancar()

    cy.stAguardarConfirmacao('error')
    cy.get('#retry-payment-btn').should('be.visible')

    // Hipótese de bug 2: clicar em retry deve voltar para step de pagamento
    cy.get('#retry-payment-btn').click()
    cy.get('#step-payment', { timeout: 5000 }).should('be.visible')
    cy.get('#card-form').should('be.visible')
  })

  it('deve permitir nova tentativa com cartão aprovado após rejeição', () => {
    cy.stSelecionarPagamento('credit')
    cy.stPreencherCartao(pagamento.cartaoRecusado)
    cy.stAvancar()

    cy.stAguardarConfirmacao('error')
    cy.get('#retry-payment-btn').click()

    // Tentar novamente com cartão aprovado
    cy.get('#step-payment').should('be.visible')
    cy.stSelecionarPagamento('credit')
    cy.stPreencherCartao(pagamento.cartaoAprovado)
    cy.stAvancar()

    cy.stAguardarConfirmacao('success')
    cy.get('#purchase-success').should('be.visible')

    cy.stLerPedidos().then((pedidos) => {
      expect(pedidos).to.have.length(1)
    })
  })
})
