// URL base declarada aqui e nos specs — cada spec conhece seu sistema.
const ST_APP_URL = 'https://caioandrian.github.io/webstore-ingressos-sample'

/**
 * Visita o ShowTickets, limpa o localStorage e opcionalmente injeta um usuário
 * com sessão ativa. Recebe { nome, email, senha, cpf, telefone, dataNasc }.
 * Quando user é fornecido, faz reload para a app reconhecer a sessão.
 */
Cypress.Commands.add('stIniciar', (user = null) => {
  cy.visit(ST_APP_URL)
  cy.clearLocalStorage()
  if (user) {
    cy.window().then((win) => {
      const storedUser = {
        id:        `test_${Date.now()}`,
        name:      user.nome,
        email:     user.email,
        password:  user.senha,
        cpf:       user.cpf,
        phone:     user.telefone,
        birthdate: user.dataNasc,
        createdAt: new Date().toISOString(),
      }
      const sessao = {
        id:       storedUser.id,
        name:     storedUser.name,
        email:    storedUser.email,
        cpf:      storedUser.cpf,
        phone:    storedUser.phone,
        birthdate:storedUser.birthdate,
      }
      win.localStorage.setItem('showtickets_users', JSON.stringify([storedUser]))
      win.localStorage.setItem('showtickets_session', JSON.stringify(sessao))
    })
    cy.reload()
    cy.get('#user-menu-btn', { timeout: 8000 }).should('be.visible')
  }
})

/**
 * Registra um novo usuário via UI (aba Cadastro na página de login).
 * Não valida se o login automático ocorreu — use cy.get('#user-menu-btn') depois.
 */
Cypress.Commands.add('stRegistrar', (user) => {
  cy.get('#header-login-btn').click()
  cy.get('#tab-register').click()
  cy.get('#reg-name').type(user.nome)
  cy.get('#reg-email').type(user.email)
  cy.get('#reg-cpf').type(user.cpf)
  cy.get('#reg-phone').type(user.telefone)
  cy.get('#reg-birthdate').type(user.dataNasc)
  cy.get('#reg-password').type(user.senha)
  cy.get('#reg-confirm-password').type(user.senha)
  cy.get('#register-submit-btn').click()
})

/**
 * Faz login via UI. Pré-condição: #header-login-btn visível (usuário não logado).
 */
Cypress.Commands.add('stLogin', (email, senha) => {
  cy.get('#header-login-btn').click()
  cy.get('#login-email').type(email)
  cy.get('#login-password').type(senha)
  cy.get('#login-submit-btn').click()
})

/**
 * Faz logout via menu do usuário no header.
 */
Cypress.Commands.add('stLogout', () => {
  cy.get('#user-menu-btn').click()
  cy.get('#header-logout-btn').click()
  cy.get('#header-login-btn', { timeout: 5000 }).should('be.visible')
})

/**
 * Navega diretamente para a página de compra de um evento pelo ID.
 * ex: cy.stIrParaCompra('rock-festival-2025')
 */
Cypress.Commands.add('stIrParaCompra', (eventId) => {
  cy.visit(`${ST_APP_URL}/#/comprar/${eventId}`)
  cy.get('#purchase-page', { timeout: 8000 }).should('be.visible')
})

/**
 * Seleciona quantidade de ingressos na etapa 1.
 * ticketId: 'pista' | 'pista-premium' | 'cadeira' | 'camarote' (rock-festival-2025)
 * tipo: 'inteira' | 'meia'
 */
Cypress.Commands.add('stSelecionarIngresso', (ticketId, tipo, quantidade = 1) => {
  for (let i = 0; i < quantidade; i++) {
    cy.get(`#qty-increase-${ticketId}-${tipo}`).click()
  }
  cy.get(`#qty-value-${ticketId}-${tipo}`).should('contain', String(quantidade))
})

/**
 * Clica no botão de navegação "Próximo / Finalizar Compra".
 */
Cypress.Commands.add('stAvancar', () => {
  cy.get('#next-btn').click()
})

/**
 * Preenche o campo de confirmação de email (geralmente não pré-preenchido pelo session).
 */
Cypress.Commands.add('stConfirmarEmail', (email) => {
  cy.get('#field-confirmEmail').clear().type(email)
})

/**
 * Preenche dados pessoais na etapa 3. Apenas os campos presentes em `dados` são alterados.
 * Os demais ficam com o valor pré-preenchido da sessão.
 */
Cypress.Commands.add('stPreencherDadosPessoais', (dados) => {
  cy.get('#step-user-data').should('be.visible')
  if (dados.nome !== undefined)         cy.get('#field-name').clear().type(dados.nome)
  if (dados.email !== undefined)        cy.get('#field-email').clear().type(dados.email)
  if (dados.confirmEmail !== undefined) cy.get('#field-confirmEmail').clear().type(dados.confirmEmail)
  if (dados.cpf !== undefined)          cy.get('#field-cpf').clear().type(dados.cpf)
  if (dados.telefone !== undefined)     cy.get('#field-phone').clear().type(dados.telefone)
  if (dados.dataNasc !== undefined)     cy.get('#field-birthdate').clear().type(dados.dataNasc)
})

/**
 * Seleciona o método de pagamento na etapa 4.
 * metodo: 'credit' | 'debit' | 'pix' | 'boleto'
 */
Cypress.Commands.add('stSelecionarPagamento', (metodo) => {
  cy.get(`#payment-method-${metodo}`).click()
})

/**
 * Preenche os dados do cartão na etapa 4.
 * cartao: { numero, titular, validade, cvv }
 */
Cypress.Commands.add('stPreencherCartao', (cartao) => {
  cy.get('#card-form').should('be.visible')
  cy.get('#field-cardNumber').clear().type(cartao.numero)
  cy.get('#field-cardName').clear().type(cartao.titular)
  cy.get('#field-expiry').clear().type(cartao.validade)
  cy.get('#field-cvv').clear().type(cartao.cvv)
})

/**
 * Aguarda a confirmação de sucesso ou erro do pagamento.
 * O mock tem delay fixo de 2.2s — timeout de 10s cobre com folga.
 * tipo: 'success' | 'error'
 */
Cypress.Commands.add('stAguardarConfirmacao', (tipo = 'success') => {
  const seletor = tipo === 'success' ? '#purchase-success' : '#purchase-error'
  cy.get(seletor, { timeout: 10000 }).should('be.visible')
})

/**
 * Lê e retorna o array de pedidos do localStorage como cy.wrap([]).
 */
Cypress.Commands.add('stLerPedidos', () => {
  return cy.window().then((win) => {
    const raw = win.localStorage.getItem('showtickets_orders') || '[]'
    return cy.wrap(JSON.parse(raw))
  })
})
