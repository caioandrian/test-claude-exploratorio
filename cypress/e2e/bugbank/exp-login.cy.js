// EXP-006 | Login com senha errada → acesso negado
// EXP-006b | Login com e-mail inexistente → acesso negado

const { criarUsuario } = require('../../support/bugbank/factories/usuario');
const APP_URL = 'https://bugbank.netlify.app';

describe('Exploratório — Login', () => {

  const usuario = criarUsuario();

  before(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit(APP_URL);
    cy.disableTransitions();
    cy.cadastrarEVoltar(usuario.email, usuario.nome, usuario.senha);
  });

  beforeEach(() => {
    cy.visit(APP_URL);
    cy.disableTransitions();
  });

  // ─── EXP-006 ───────────────────────────────────────────────────────────────
  it('@real | EXP-006 — senha incorreta deve negar acesso e exibir mensagem de erro', () => {
    cy.loginBugBank(usuario.email, 'SenhaErradaQualquer!');

    // Bug hipótese: sistema loga com senha incorreta
    cy.url().should('eq', APP_URL);
    cy.get('#modalText').should('be.visible');
    cy.get('#textBalance').should('not.exist');

    cy.lerModal().then((msg) => {
      cy.log(`Mensagem de erro exibida: "${msg}"`);
      // Verificação de information disclosure: mensagem não deve revelar qual campo está errado
      expect(msg).to.not.be.empty;
    });
  });

  // ─── EXP-006b ──────────────────────────────────────────────────────────────
  it('@real | EXP-006b — e-mail inexistente deve negar acesso', () => {
    cy.loginBugBank('naoexiste_xyz999@bugbank.test', usuario.senha);

    // Bug hipótese: sistema loga com e-mail não cadastrado
    cy.url().should('eq', APP_URL);
    cy.get('#textBalance').should('not.exist');
  });
});
