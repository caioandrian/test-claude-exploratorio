import { buildAccount, seedAccount } from './factories/account.factory'

// ─── TRANSITIONS ─────────────────────────────────────────────────────────────
// Desativa transições CSS — torna o card flip instantâneo.
// Chamar no beforeEach de qualquer describe que interaja com o card flip.

Cypress.Commands.add('disableTransitions', () => {
  cy.document().then((doc) => {
    if (!doc.getElementById('__cypress-disable-transitions__')) {
      const style = doc.createElement('style')
      style.id = '__cypress-disable-transitions__'
      style.innerHTML = '*, *::before, *::after { transition: none !important; animation: none !important; }'
      doc.head.appendChild(style)
    }
  })
})

Cypress.Commands.add('enableTransitions', () => {
  cy.document().then((doc) => {
    const style = doc.getElementById('__cypress-disable-transitions__')
    if (style) style.remove()
  })
})

// ─── CADASTRO ────────────────────────────────────────────────────────────────
// Pré-condição: cy.disableTransitions() chamado no beforeEach.
// { force: true } obrigatório em todos os elementos de .card__register —
// backface-visibility:hidden é herdado do container 3D e não pode ser removido
// sem quebrar o layout visual do card flip.

Cypress.Commands.add('cadastrar', (email, nome, senha, { comSaldo = false, fecharModal = true } = {}) => {
  cy.get('.card__login .login__buttons button[type="button"]').click()
  cy.get('.card__register input[name="email"]').clear({ force: true }).type(email, { force: true })
  cy.get('.card__register input[name="name"]').clear({ force: true }).type(nome, { force: true })
  cy.get('.card__register input[name="password"]').clear({ force: true }).type(senha, { force: true })
  cy.get('.card__register input[name="passwordConfirmation"]').clear({ force: true }).type(senha, { force: true })
  if (comSaldo) cy.get('#toggleAddBalance').click({ force: true })
  cy.get('.card__register button[type="submit"]').click({ force: true })
  if (fecharModal) cy.get('#btnCloseModal').click()
})

Cypress.Commands.add('cadastrarEVoltar', (email, nome, senha, opts = {}) => {
  cy.cadastrar(email, nome, senha, { ...opts, fecharModal: true })
  // Após fechar o modal a app já está no login — onBack() é chamado no handleRegister
  // antes de abrir o modal, então o card flip ocorre automaticamente.
})

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// Pré-condição: card está na face de login (.card__login visível).

Cypress.Commands.add('loginBugBank', (email, senha) => {
  cy.get('.card__login input[name="email"]').clear().type(email)
  cy.get('.card__login input[name="password"]').clear().type(senha)
  cy.get('.card__login .login__buttons button[type="submit"]').click()
})

Cypress.Commands.add('logoutBugBank', () => {
  cy.get('#btnExit').click()
  cy.get('.card__login .login__buttons button[type="submit"]').should('be.visible')
})

Cypress.Commands.add('loginWithSession', (email, senha, baseUrl = 'https://bugbank.netlify.app') => {
  cy.session(
    [email, senha],
    () => {
      cy.visit(baseUrl)
      cy.disableTransitions()
      cy.loginBugBank(email, senha)
      cy.url().should('include', '/home')
    },
    {
      validate() {
        cy.visit(`${baseUrl}/home`)
        cy.get('#textBalance').should('exist')
      },
    }
  )
})

// ─── CONTA ────────────────────────────────────────────────────────────────────

Cypress.Commands.add('capturarNumeroConta', () => {
  cy.get('#textAccountNumber').invoke('text').then((texto) => {
    const match = texto.match(/(\d+)-(\d+)/)
    return cy.wrap({ numero: match[1], digito: match[2] })
  })
})

Cypress.Commands.add('capturarSaldo', () => {
  cy.get('#textBalance').invoke('text').then((texto) => {
    // texto completo: "Saldo em conta R$ 1.000,00" — extrair só o número após R$
    const match = texto.match(/R\$\s*([\d.,]+)/)
    const valor = match ? match[1].replace(/\./g, '').replace(',', '.') : '0'
    return cy.wrap(parseFloat(valor))
  })
})

Cypress.Commands.add('criarContaViaLS', (overrides = {}) => {
  const account = buildAccount(overrides)
  return seedAccount(account)
})

// ─── MODAL ───────────────────────────────────────────────────────────────────

Cypress.Commands.add('fecharModal', () => {
  cy.get('#btnCloseModal').should('be.visible').click()
  cy.get('#btnCloseModal').should('not.exist')
})

Cypress.Commands.add('lerModal', () => {
  return cy.get('#modalText').invoke('text')
})

// ─── TRANSFERÊNCIA ────────────────────────────────────────────────────────────

Cypress.Commands.add('transferir', (numeroConta, digito, valor, descricao = 'Teste exploratório') => {
  cy.get('#btn-TRANSFERÊNCIA').click()
  cy.get('input[name="accountNumber"]').type(numeroConta)
  cy.get('input[name="digit"]').type(digito)
  cy.get('input[name="transferValue"]').type(valor)
  cy.get('input[name="description"]').type(descricao)
  cy.get('button[type="submit"]').click()
})
