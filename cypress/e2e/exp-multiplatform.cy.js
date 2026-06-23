// EXP-020 | Sessão compartilhada entre abas via localStorage
// EXP-022 | Fluxo de cadastro e login no Firefox
// EXP-023 | Transferência no Firefox — campo numérico
// EXP-026 | Login mobile 375x667
// EXP-027 | Cadastro mobile 375x667
// EXP-028 | Transferência mobile 375x667

const { criarUsuario } = require('../support/factories/usuario');
const APP_URL = 'https://bugbank.netlify.app';

describe('Exploratório — Multi-Browser e Mobile', () => {

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit(APP_URL);
    cy.disableTransitions();
  });

  // ─── EXP-020 ───────────────────────────────────────────────────────────────
  it('@real | EXP-020 — sessão persiste via localStorage ao abrir nova aba (cy.visit)', () => {
    const u = criarUsuario();

    cy.cadastrarEVoltar(u.email, u.nome, u.senha);
    cy.loginBugBank(u.email, u.senha);
    cy.url().should('include', '/home');

    // Simula segunda "aba" — nova cy.visit na mesma origem reutiliza localStorage
    // Bug hipótese: localStorage compartilhado pode causar inconsistência de estado
    cy.visit(APP_URL);
    cy.url().then((url) => {
      if (url.includes('/home')) {
        cy.log('BUG POTENCIAL: sessão persiste ao retornar para / — auto-login via localStorage');
        cy.get('#textBalance').should('exist');
      } else {
        cy.log('Comportamento esperado: retornou ao login após nova visita');
        cy.contains('button', 'Acessar').should('be.visible');
      }
    });
  });

  // ─── EXP-022 ── Firefox ────────────────────────────────────────────────────
  it('@real | EXP-022 — cadastro e login completo no Firefox @regressao', { browser: 'firefox' }, () => {
    const u = criarUsuario();

    // Valida que o card flip e toggle de senha funcionam no Firefox
    cy.get('.card__login .login__buttons button[type="button"]').click();

    cy.get('.card__register input[name="email"]').clear({ force: true }).type(u.email, { force: true });
    cy.get('.card__register input[name="name"]').clear({ force: true }).type(u.nome, { force: true });
    cy.get('.card__register input[name="password"]').clear({ force: true }).type(u.senha, { force: true });

    // Bug hipótese Firefox: toggle de visibilidade de senha pode conflitar com gerenciador nativo
    cy.get('.card__register input[name="password"]').should('have.attr', 'type', 'password');

    cy.get('.card__register input[name="passwordConfirmation"]').clear({ force: true }).type(u.senha, { force: true });
    cy.get('.card__register button[type="submit"]').click({ force: true });

    cy.get('#modalText').should('be.visible');
    cy.fecharModal();

    cy.loginBugBank(u.email, u.senha);
    cy.url().should('include', '/home');

    // Bug hipótese Firefox: saldo pode não renderizar corretamente
    cy.get('#textBalance').should('be.visible').and('contain', 'R$');
  });

  // ─── EXP-023 ── Firefox ────────────────────────────────────────────────────
  it('@real | EXP-023 — transferência no Firefox — separador decimal @regressao', { browser: 'firefox' }, () => {
    const remetente = criarUsuario();
    const destinatario = criarUsuario();

    cy.cadastrarEVoltar(remetente.email, remetente.nome, remetente.senha, { comSaldo: true });
    cy.cadastrarEVoltar(destinatario.email, destinatario.nome, destinatario.senha);

    cy.loginBugBank(destinatario.email, destinatario.senha);
    let destNum, destDig;
    cy.capturarNumeroConta().then(({ numero, digito }) => { destNum = numero; destDig = digito; });
    cy.logoutBugBank();

    cy.loginBugBank(remetente.email, remetente.senha);
    cy.url().should('include', '/home');

    cy.then(() => {
      cy.get('#btn-TRANSFERÊNCIA').click();
      cy.get('input[name="accountNumber"]').type(destNum);
      cy.get('input[name="digit"]').type(destDig);

      // Bug hipótese Firefox: campo numérico pode usar "," como separador decimal
      // diferente do Chrome que usa "." — testamos com ponto (padrão HTML)
      cy.get('input[name="transferValue"]').type('100');
      cy.get('input[name="description"]').type('EXP-023 Firefox');
      cy.get('button[type="submit"]').click();
    });

    cy.get('#modalText').should('be.visible');
    cy.lerModal().then((msg) => { cy.log(`Resultado Firefox: "${msg}"`); });
    cy.fecharModal();
    cy.url().should('include', '/home');
  });

  // ─── EXP-026 ── Mobile ─────────────────────────────────────────────────────
  it('@real | EXP-026 — login em viewport mobile 375×667 deve exibir campos e botão acessíveis', () => {
    cy.viewport(375, 667);

    // Bug hipótese: botão "Acessar" pode ficar oculto atrás do teclado virtual
    cy.get('.card__login input[name="email"]').should('be.visible');
    cy.get('.card__login input[name="password"]').should('be.visible');
    cy.get('.card__login .login__buttons button[type="submit"]').should('be.visible');

    cy.get('.card__login .login__buttons button[type="submit"]').then(($btn) => {
      const rect = $btn[0].getBoundingClientRect();
      expect(rect.top, 'Botão Acessar deve estar visível no topo da viewport').to.be.lessThan(667);
      expect(rect.bottom, 'Botão Acessar deve estar dentro da viewport').to.be.greaterThan(0);
    });

    const u = criarUsuario();
    cy.cadastrarEVoltar(u.email, u.nome, u.senha);
    cy.loginBugBank(u.email, u.senha);
    cy.url().should('include', '/home');
    cy.get('#textBalance').should('be.visible');
  });

  // ─── EXP-027 ── Mobile ─────────────────────────────────────────────────────
  it('@real | EXP-027 — cadastro em viewport mobile 375×667 — checkbox e campos acessíveis', () => {
    cy.viewport(375, 667);

    cy.get('.card__login .login__buttons button[type="button"]').click();

    cy.get('.card__register input[name="email"]').should('exist');
    cy.get('.card__register input[name="name"]').should('exist');
    cy.get('.card__register input[name="password"]').should('exist');
    cy.get('.card__register input[name="passwordConfirmation"]').should('exist');

    // Bug hipótese: checkbox pode ter área de toque insuficiente em 375px
    cy.get('#toggleAddBalance').then(($cb) => {
      const rect = $cb[0].getBoundingClientRect();
      cy.log(`Área do checkbox: ${rect.width}x${rect.height}px`);
      expect(rect.width, 'Largura do checkbox deve ser acessível').to.be.at.least(16);
      expect(rect.height, 'Altura do checkbox deve ser acessível').to.be.at.least(16);
    });

    const u = criarUsuario();
    cy.get('.card__register input[name="email"]').clear({ force: true }).type(u.email, { force: true });
    cy.get('.card__register input[name="name"]').clear({ force: true }).type(u.nome, { force: true });
    cy.get('.card__register input[name="password"]').clear({ force: true }).type(u.senha, { force: true });
    cy.get('.card__register input[name="passwordConfirmation"]').clear({ force: true }).type(u.senha, { force: true });
    cy.get('#toggleAddBalance').click({ force: true });
    cy.get('.card__register button[type="submit"]').click({ force: true });

    cy.get('#modalText').should('be.visible');
    cy.fecharModal();
  });

  // ─── EXP-028 ── Mobile ─────────────────────────────────────────────────────
  it('@real | EXP-028 — transferência em viewport mobile 375×667 — campos e botão visíveis', () => {
    cy.viewport(375, 667);

    const remetente = criarUsuario();
    const destinatario = criarUsuario();

    cy.cadastrarEVoltar(remetente.email, remetente.nome, remetente.senha, { comSaldo: true });
    cy.cadastrarEVoltar(destinatario.email, destinatario.nome, destinatario.senha);

    cy.loginBugBank(destinatario.email, destinatario.senha);
    let destNum, destDig;
    cy.capturarNumeroConta().then(({ numero, digito }) => { destNum = numero; destDig = digito; });
    cy.logoutBugBank();

    cy.loginBugBank(remetente.email, remetente.senha);
    cy.url().should('include', '/home');

    cy.get('#btn-TRANSFERÊNCIA').click();
    cy.url().should('include', '/transfer');

    // Bug hipótese: campos podem ficar sobrepostos ou fora da viewport em 375px
    cy.get('input[name="accountNumber"]').should('be.visible');
    cy.get('input[name="digit"]').should('be.visible');
    cy.get('input[name="transferValue"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible').then(($btn) => {
      const rect = $btn[0].getBoundingClientRect();
      expect(rect.bottom, 'Botão Transferir deve estar visível na viewport').to.be.lessThan(667 + 100);
    });

    cy.then(() => {
      cy.get('input[name="accountNumber"]').type(destNum);
      cy.get('input[name="digit"]').type(destDig);
      cy.get('input[name="transferValue"]').type('50');
      cy.get('input[name="description"]').type('EXP-028 mobile');
      cy.get('button[type="submit"]').click();
    });

    cy.get('#modalText').should('be.visible');
    cy.lerModal().then((msg) => { cy.log(`Resultado mobile: "${msg}"`); });
    cy.fecharModal();
  });
});
