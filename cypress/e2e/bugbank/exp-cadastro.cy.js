// EXP-001 | Conta sem saldo → saldo = R$ 0,00
// EXP-002 | Conta com saldo → saldo > 0 (checkbox "Criar conta com saldo?")
// EXP-008 | E-mail duplicado → bloqueado
// EXP-011 | Senhas diferentes → bloqueado
// EXP-012 | E-mails inválidos → bloqueados
// EXP-015 | Campos vazios → validação ativa

const { criarUsuario } = require('../../support/bugbank/factories/usuario');
const APP_URL = 'https://bugbank.netlify.app';

describe('Exploratório — Cadastro e Saldo', () => {

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit(APP_URL);
    cy.disableTransitions();
  });

  // ─── EXP-001 ───────────────────────────────────────────────────────────────
  it('@real | EXP-001 — conta sem saldo deve exibir R$ 0,00 após login', () => {
    const u = criarUsuario({ comSaldo: false });

    cy.cadastrarEVoltar(u.email, u.nome, u.senha);
    cy.loginBugBank(u.email, u.senha);
    cy.url().should('include', '/home');

    // Bug hipótese: saldo pode ser diferente de zero mesmo sem marcar o checkbox
    cy.get('#textBalance').invoke('text').should('match', /R\$\s*0[,.]00/);
  });

  // ─── EXP-002 ───────────────────────────────────────────────────────────────
  it('@real | EXP-002 — checkbox "Criar conta com saldo?" deve gerar saldo maior que zero', () => {
    const u = criarUsuario();

    cy.get('.card__login .login__buttons button[type="button"]').click();
    cy.get('.card__register input[name="email"]').clear({ force: true }).type(u.email, { force: true });
    cy.get('.card__register input[name="name"]').clear({ force: true }).type(u.nome, { force: true });
    cy.get('.card__register input[name="password"]').clear({ force: true }).type(u.senha, { force: true });
    cy.get('.card__register input[name="passwordConfirmation"]').clear({ force: true }).type(u.senha, { force: true });
    cy.get('#toggleAddBalance').click({ force: true });
    cy.get('.card__register button[type="submit"]').click({ force: true });
    cy.fecharModal();

    cy.loginBugBank(u.email, u.senha);
    cy.url().should('include', '/home');

    // Bug hipótese: checkbox não tem efeito — saldo permanece R$ 0,00
    cy.capturarSaldo().then((saldo) => {
      expect(saldo, 'Saldo deve ser maior que zero quando checkbox marcado').to.be.greaterThan(0);
    });
  });

  // ─── EXP-008 ───────────────────────────────────────────────────────────────
  it('@real | EXP-008 — cadastro com e-mail já existente deve ser bloqueado', () => {
    const u = criarUsuario();

    cy.cadastrarEVoltar(u.email, u.nome, u.senha);

    // Segundo cadastro com mesmo e-mail
    cy.cadastrar(u.email, 'Outro Nome', u.senha, { fecharModal: false });

    // Bug hipótese: sistema cria segunda conta sobrescrevendo a primeira
    cy.get('#modalText').should('be.visible');
    cy.lerModal().then((msg) => {
      cy.log(`Mensagem para e-mail duplicado: "${msg}"`);
      expect(msg.toLowerCase()).to.match(/j[aá] cadastrado|e-?mail.*exist|conta.*exist|cadastrado/i);
    });
    cy.fecharModal();
    cy.url().should('eq', APP_URL);
  });

  // ─── EXP-011 ───────────────────────────────────────────────────────────────
  it('@real | EXP-011 — senhas diferentes no cadastro devem bloquear criação da conta', () => {
    const u = criarUsuario();

    cy.get('.card__login .login__buttons button[type="button"]').click();
    cy.get('.card__register input[name="email"]').clear({ force: true }).type(u.email, { force: true });
    cy.get('.card__register input[name="name"]').clear({ force: true }).type(u.nome, { force: true });
    cy.get('.card__register input[name="password"]').clear({ force: true }).type(u.senha, { force: true });
    cy.get('.card__register input[name="passwordConfirmation"]').clear({ force: true }).type('SenhaDIFERENTE@456', { force: true });
    cy.get('.card__register button[type="submit"]').click({ force: true });

    // Bug hipótese: conta é criada com senhas divergentes — usuário fica impossibilitado de logar
    cy.get('#modalText').should('be.visible');
    cy.lerModal().then((msg) => {
      cy.log(`Mensagem para senhas diferentes: "${msg}"`);
      expect(msg.toLowerCase()).to.match(/senha.*diferente|confirma.*senha|n[ãa]o.*coinc|as senhas/i);
    });
    cy.fecharModal();
    cy.url().should('eq', APP_URL);
  });

  // ─── EXP-012 ───────────────────────────────────────────────────────────────
  context('EXP-012 — e-mails em formato inválido', () => {
    const emailsInvalidos = ['abc', '@dominio.com', 'usuario@', 'usuario@.com'];

    emailsInvalidos.forEach((emailInvalido) => {
      it(`@real | EXP-012 — deve rejeitar e-mail inválido: "${emailInvalido}"`, () => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.visit(APP_URL);

        const u = criarUsuario();

        cy.disableTransitions();
        cy.get('.card__login .login__buttons button[type="button"]').click();
        cy.get('.card__register input[name="email"]').clear({ force: true }).type(emailInvalido, { force: true });
        cy.get('.card__register input[name="name"]').clear({ force: true }).type(u.nome, { force: true });
        cy.get('.card__register input[name="password"]').clear({ force: true }).type(u.senha, { force: true });
        cy.get('.card__register input[name="passwordConfirmation"]').clear({ force: true }).type(u.senha, { force: true });
        cy.get('.card__register button[type="submit"]').click({ force: true });

        // Bug hipótese: e-mail inválido aceito sem validação — conta criada com dado corrompido
        cy.url().should('eq', APP_URL);
        cy.get('#textBalance').should('not.exist');
      });
    });
  });

  // ─── EXP-015 ───────────────────────────────────────────────────────────────
  it('@real | EXP-015 — formulário de cadastro com todos os campos vazios deve validar', () => {
    cy.get('.card__login .login__buttons button[type="button"]').click();
    cy.get('.card__register button[type="submit"]').click({ force: true });

    // Bug hipótese: submit sem dados causa crash JS ou navega indevidamente para /home
    cy.get('#textBalance').should('not.exist');
    cy.url().should('eq', APP_URL);
  });

  it('@real | EXP-015b — formulário de login com campos vazios deve validar', () => {
    cy.contains('button', 'Acessar').click();

    // Bug hipótese: submit vazio concede acesso ou gera erro JS não tratado
    cy.get('#textBalance').should('not.exist');
    cy.url().should('eq', APP_URL);
  });

  // ─── EXP-015-XSS ───────────────────────────────────────────────────────────
  it('@real | EXP-015-XSS — nome com payload XSS não deve executar script na home', () => {
    const xssPayload = "<script>window.__xss_executed=true</script>";
    const u = criarUsuario({ nome: xssPayload });

    cy.cadastrarEVoltar(u.email, xssPayload, u.senha);
    cy.loginBugBank(u.email, u.senha);
    cy.url().should('include', '/home');

    // Bug hipótese: campo nome não sanitizado — XSS reflexivo executa na home
    cy.window().then((win) => {
      expect(
        win.__xss_executed,
        'XSS não deve ser executado — campo nome deve ser sanitizado'
      ).to.be.undefined;
    });

    // O payload deve aparecer como texto, não como HTML interpretado
    cy.get('body').should('not.contain.html', '<script>');
  });
});
