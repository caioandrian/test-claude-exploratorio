// EXP-005 — Login, logout e proteção de rotas autenticadas
// @real
//
// Hipóteses de bug:
//   1. Logout remove sessão mas não redireciona o usuário
//   2. /meus-ingressos acessível sem login (não verifica autenticação)
//   3. Erro ao logar com senha incorreta não exibe mensagem clara

const APP_URL = 'https://caioandrian.github.io/webstore-ingressos-sample'

describe('[ST] EXP-005 — Autenticação: login, logout e proteção de rotas @real', () => {
  let usuario

  before(() => {
    cy.fixture('showtickets/usuario').then((f) => { usuario = f.base })
  })

  context('Login via UI', () => {
    beforeEach(() => {
      // Pré-cria o usuário no localStorage sem sessão ativa
      cy.visit(APP_URL)
      cy.clearLocalStorage()
      cy.window().then((win) => {
        const storedUser = {
          id:        'test-exp-005',
          name:      usuario.nome,
          email:     usuario.email,
          password:  usuario.senha,
          cpf:       usuario.cpf,
          phone:     usuario.telefone,
          birthdate: usuario.dataNasc,
          createdAt: new Date().toISOString(),
        }
        win.localStorage.setItem('showtickets_users', JSON.stringify([storedUser]))
      })
      cy.reload()
    })

    it('deve autenticar com credenciais válidas e exibir menu do usuário', () => {
      cy.get('#header-login-btn').should('be.visible')
      cy.stLogin(usuario.email, usuario.senha)
      cy.get('#user-menu-btn', { timeout: 5000 }).should('be.visible')
      cy.get('#header-login-btn').should('not.exist')
    })

    it('deve exibir mensagem de erro ao logar com senha incorreta', () => {
      cy.stLogin(usuario.email, 'SenhaErrada@999')
      cy.get('#login-error', { timeout: 5000 }).should('be.visible')
      cy.get('#user-menu-btn').should('not.exist')
    })

    it('deve exibir mensagem de erro ao logar com email não cadastrado', () => {
      cy.stLogin('nao.existe@showtests.com', usuario.senha)
      cy.get('#login-error', { timeout: 5000 }).should('be.visible')
    })
  })

  context('Logout', () => {
    beforeEach(() => {
      cy.stIniciar(usuario)
    })

    it('deve fazer logout e remover sessão autenticada', () => {
      cy.stLogout()
      // Hipótese de bug 1: logout sem redirecionamento visível
      cy.get('#header-login-btn').should('be.visible')
      cy.get('#user-menu-btn').should('not.exist')
    })

    it('deve limpar a sessão do localStorage após logout', () => {
      cy.stLogout()
      cy.window().then((win) => {
        const sessao = win.localStorage.getItem('showtickets_session')
        expect(sessao).to.be.null
      })
    })
  })

  context('Proteção de rotas', () => {
    beforeEach(() => {
      cy.visit(APP_URL)
      cy.clearLocalStorage()
    })

    it('deve exibir estado deslogado em /meus-ingressos sem autenticação', () => {
      // Hipótese de bug 2: página não verifica autenticação no carregamento direto
      cy.visit(`${APP_URL}/#/meus-ingressos`)
      cy.get('#my-tickets-page', { timeout: 5000 }).should('be.visible')
      // Deve mostrar o botão de login (não mostrar pedidos)
      cy.get('#login-to-see-tickets-btn').should('be.visible')
      cy.get('#orders-list').should('not.exist')
    })

    it('deve exibir Meus Ingressos corretamente quando autenticado', () => {
      cy.stIniciar(usuario)
      cy.get('#user-menu-btn').click()
      cy.get('#menu-tickets').click()
      cy.get('#my-tickets-page', { timeout: 5000 }).should('be.visible')
      cy.get('#login-to-see-tickets-btn').should('not.exist')
    })

    it('deve exibir Meus Ingressos vazio (sem pedidos) para usuário recém-criado', () => {
      cy.stIniciar(usuario)
      cy.get('#user-menu-btn').click()
      cy.get('#menu-tickets').click()
      cy.get('#my-tickets-page').should('be.visible')
      // Usuário sem compras deve ver estado vazio
      cy.get('#no-tickets').should('be.visible')
    })
  })
})
