// EXP-018 — Duplo clique em "Finalizar Compra" durante o delay de 2.2s
// @real
//
// Hipóteses de bug:
//   1. Botão não é desabilitado durante o processamento → dois pedidos no localStorage
//   2. Indicador de "processando" (#payment-processing) não aparece imediatamente
//      após o primeiro clique

const APP_URL = 'https://caioandrian.github.io/webstore-ingressos-sample'

describe('[ST] EXP-018 — Duplo clique em Finalizar Compra @real', () => {
  let usuario
  let pagamento

  before(() => {
    cy.fixture('showtickets/usuario').then((f) => { usuario = f.base })
    cy.fixture('showtickets/pagamento').then((f) => { pagamento = f })
  })

  // Navega até a etapa 4 com tudo preenchido, pronto para finalizar
  const chegarNoPagamento = (cartao) => {
    cy.stIrParaCompra('rock-festival-2025')
    cy.stSelecionarIngresso('pista', 'inteira', 1)
    cy.stAvancar()
    cy.stAvancar()
    cy.stConfirmarEmail(usuario.email)
    cy.stAvancar()
    cy.get('#step-payment').should('be.visible')
    cy.stSelecionarPagamento('credit')
    cy.stPreencherCartao(cartao)
  }

  beforeEach(() => {
    cy.stIniciar(usuario)
  })

  it('não deve gerar pedido duplicado ao clicar duas vezes rapidamente', () => {
    chegarNoPagamento(pagamento.cartaoAprovado)

    // Duplo clique rápido — segundo clique usa force:true pois o botão pode já
    // estar desabilitado (comportamento esperado correto) ou ainda estar ativo (bug)
    cy.get('#next-btn').click()
    cy.get('#next-btn').click({ force: true })

    cy.stAguardarConfirmacao('success')

    // Hipótese de bug 1: duplo clique pode ter gerado dois pedidos
    cy.stLerPedidos().then((pedidos) => {
      expect(pedidos).to.have.length(1)
    })
  })

  it('deve desabilitar o botão ou mostrar processamento imediatamente após o clique', () => {
    chegarNoPagamento(pagamento.cartaoAprovado)

    cy.get('#next-btn').click()

    // Hipótese de bug 2: indicador de processamento deve aparecer imediatamente
    // Valida que o usuário recebe feedback visual antes do delay de 2.2s terminar
    cy.get('#payment-processing').should('be.visible')

    cy.stAguardarConfirmacao('success')
  })

  it('não deve processar duplo clique com cartão recusado', () => {
    chegarNoPagamento(pagamento.cartaoRecusado)

    cy.get('#next-btn').click()
    cy.get('#next-btn').click({ force: true })

    cy.stAguardarConfirmacao('error')

    // Nenhum pedido deve ter sido salvo (nem duplicado)
    cy.stLerPedidos().then((pedidos) => {
      expect(pedidos).to.have.length(0)
    })
  })
})
