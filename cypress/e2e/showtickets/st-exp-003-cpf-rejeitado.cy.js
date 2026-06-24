// EXP-003 — CPF terminado em "00" é rejeitado pelo mock de pagamento
// @real
//
// Hipóteses de bug:
//   1. Mensagem de erro genérica sem indicar o motivo da recusa
//   2. Etapa de confirmação sem botão de retry — usuário fica preso
//   3. Pedido salvo mesmo com CPF rejeitado

const APP_URL = 'https://caioandrian.github.io/webstore-ingressos-sample'

describe('[ST] EXP-003 — CPF rejeitado pelo mock (termina em 00) @real', () => {
  let usuarioCpf00

  before(() => {
    cy.fixture('showtickets/usuario').then((f) => { usuarioCpf00 = f.cpfRejeitado })
  })

  beforeEach(() => {
    // Usuário com CPF terminado em 00 — mock rejeita o pagamento
    cy.stIniciar(usuarioCpf00)
    cy.stIrParaCompra('rock-festival-2025')
    cy.stSelecionarIngresso('pista', 'inteira', 1)
    cy.stAvancar()
    cy.stAvancar() // pular addons
    cy.get('#step-user-data').should('be.visible')
    cy.stConfirmarEmail(usuarioCpf00.email)
    cy.stAvancar()
    cy.get('#step-payment').should('be.visible')
  })

  it('deve rejeitar pagamento via PIX com CPF terminado em 00', () => {
    cy.stSelecionarPagamento('pix')
    cy.get('#pix-section').should('be.visible')
    cy.stAvancar()

    // Deve exibir erro de pagamento
    cy.stAguardarConfirmacao('error')
    cy.get('#purchase-error').should('be.visible')

    // Mensagem deve ser informativa (não vazia)
    cy.get('#purchase-error').invoke('text').then((texto) => {
      expect(texto.trim().length).to.be.greaterThan(10)
    })

    // Nenhum pedido deve ter sido salvo
    cy.stLerPedidos().then((pedidos) => {
      expect(pedidos).to.have.length(0)
    })
  })

  it('deve oferecer botão de Tentar Novamente após CPF rejeitado', () => {
    // Hipótese de bug: etapa pode travar sem permitir nova tentativa
    cy.stSelecionarPagamento('pix')
    cy.stAvancar()

    cy.stAguardarConfirmacao('error')
    cy.get('#retry-payment-btn').should('be.visible').and('not.be.disabled')
  })

  it('deve rejeitar pagamento via cartão com CPF terminado em 00', () => {
    cy.fixture('showtickets/pagamento').then((pag) => {
      cy.stSelecionarPagamento('credit')
      cy.stPreencherCartao(pag.cartaoAprovado) // cartão válido, mas CPF rejeita
      cy.stAvancar()

      cy.stAguardarConfirmacao('error')
      cy.get('#purchase-error').should('be.visible')
      cy.stLerPedidos().then((pedidos) => {
        expect(pedidos).to.have.length(0)
      })
    })
  })
})
