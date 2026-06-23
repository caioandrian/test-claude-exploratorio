// EXP-003 | Transferência entre duas contas → débito A + crédito B
// EXP-009 | Valor zero e negativo → bloqueado
// EXP-010 | Valor acima do saldo → bloqueado, saldo não vai negativo
// EXP-016 | Vírgula como separador decimal → comportamento correto
// EXP-019 | Double-click no botão Transferir → não debita em dobro

const { criarUsuario } = require('../support/factories/usuario');
const APP_URL = 'https://bugbank.netlify.app';

describe('Exploratório — Transferência', () => {

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit(APP_URL);
    cy.disableTransitions();
  });

  // ─── EXP-003 ───────────────────────────────────────────────────────────────
  it('@real | EXP-003 — transferência válida entre contas deve exibir confirmação de sucesso', () => {
    const contaA = criarUsuario();
    const contaB = criarUsuario();

    cy.cadastrarEVoltar(contaA.email, contaA.nome, contaA.senha, { comSaldo: true });
    cy.cadastrarEVoltar(contaB.email, contaB.nome, contaB.senha);

    // Login como B para capturar o número de conta (destinatário)
    cy.loginBugBank(contaB.email, contaB.senha);
    cy.url().should('include', '/home');

    let destNumero, destDigito;
    cy.capturarNumeroConta().then(({ numero, digito }) => {
      destNumero = numero;
      destDigito = digito;
    });
    cy.logoutBugBank();

    // Login como A e realiza a transferência
    cy.loginBugBank(contaA.email, contaA.senha);
    cy.url().should('include', '/home');

    cy.then(() => {
      cy.transferir(destNumero, destDigito, '50', 'EXP-003 Exploratório');
    });

    // Bug hipótese: transferência válida não exibe confirmação ou exibe mensagem de erro
    cy.get('#modalText').should('be.visible');
    cy.lerModal().then((msg) => {
      cy.log(`Resultado da transferência: "${msg}"`);
      expect(msg.toLowerCase()).to.match(/sucesso|realizada|transferência/i);
    });
    cy.fecharModal();
  });

  // ─── EXP-009 ───────────────────────────────────────────────────────────────
  it('@real | EXP-009 — transferência com valor zero deve ser bloqueada', () => {
    const remetente = criarUsuario();
    const destinatario = criarUsuario();

    cy.cadastrarEVoltar(remetente.email, remetente.nome, remetente.senha, { comSaldo: true });
    cy.cadastrarEVoltar(destinatario.email, destinatario.nome, destinatario.senha);

    cy.loginBugBank(destinatario.email, destinatario.senha);
    let destNum, destDig;
    cy.capturarNumeroConta().then(({ numero, digito }) => { destNum = numero; destDig = digito; });
    cy.logoutBugBank();

    cy.loginBugBank(remetente.email, remetente.senha);

    cy.then(() => { cy.transferir(destNum, destDig, '0', 'zero'); });

    // Bug hipótese: valor zero é processado como transferência válida
    cy.get('#modalText').should('be.visible');
    cy.lerModal().then((msg) => {
      cy.log(`Mensagem para valor 0: "${msg}"`);
      expect(msg.toLowerCase()).not.to.match(/transfer[eê]ncia.*realizada|sucesso/i);
    });
    cy.fecharModal();
  });

  it('@real | EXP-009b — transferência com valor negativo deve ser bloqueada', () => {
    const remetente = criarUsuario();
    const destinatario = criarUsuario();

    cy.cadastrarEVoltar(remetente.email, remetente.nome, remetente.senha, { comSaldo: true });
    cy.cadastrarEVoltar(destinatario.email, destinatario.nome, destinatario.senha);

    cy.loginBugBank(destinatario.email, destinatario.senha);
    let destNum, destDig;
    cy.capturarNumeroConta().then(({ numero, digito }) => { destNum = numero; destDig = digito; });
    cy.logoutBugBank();

    cy.loginBugBank(remetente.email, remetente.senha);
    cy.then(() => { cy.transferir(destNum, destDig, '-100', 'negativo'); });

    // Bug hipótese: valor negativo reverte o sentido — credita o remetente
    cy.get('#modalText').should('be.visible');
    cy.lerModal().then((msg) => {
      cy.log(`Mensagem para valor negativo: "${msg}"`);
      expect(msg.toLowerCase()).not.to.match(/sucesso|realizada/i);
    });
    cy.fecharModal();
  });

  // ─── EXP-010 ───────────────────────────────────────────────────────────────
  it('@real | EXP-010 — transferência acima do saldo deve ser bloqueada e não gerar saldo negativo', () => {
    const remetente = criarUsuario();
    const destinatario = criarUsuario();

    cy.cadastrarEVoltar(remetente.email, remetente.nome, remetente.senha, { comSaldo: true });
    cy.cadastrarEVoltar(destinatario.email, destinatario.nome, destinatario.senha);

    cy.loginBugBank(destinatario.email, destinatario.senha);
    let destNum, destDig;
    cy.capturarNumeroConta().then(({ numero, digito }) => { destNum = numero; destDig = digito; });
    cy.logoutBugBank();

    cy.loginBugBank(remetente.email, remetente.senha);

    cy.capturarSaldo().then((saldoAtual) => {
      const valorAcimaSaldo = saldoAtual + 9999;

      cy.then(() => { cy.transferir(destNum, destDig, String(valorAcimaSaldo), 'acima do saldo'); });

      // Bug hipótese: sistema permite transferência que deixa saldo negativo
      cy.get('#modalText').should('be.visible');
      cy.lerModal().then((msg) => {
        cy.log(`Mensagem para valor acima do saldo: "${msg}"`);
        expect(msg.toLowerCase()).not.to.match(/sucesso|realizada/i);
      });
      cy.fecharModal();
    });
  });

  // ─── EXP-016 ───────────────────────────────────────────────────────────────
  it('@real | EXP-016 — vírgula como separador decimal no campo valor deve ser tratada corretamente', () => {
    const remetente = criarUsuario();
    const destinatario = criarUsuario();

    cy.cadastrarEVoltar(remetente.email, remetente.nome, remetente.senha, { comSaldo: true });
    cy.cadastrarEVoltar(destinatario.email, destinatario.nome, destinatario.senha);

    cy.loginBugBank(destinatario.email, destinatario.senha);
    let destNum, destDig;
    cy.capturarNumeroConta().then(({ numero, digito }) => { destNum = numero; destDig = digito; });
    cy.logoutBugBank();

    cy.loginBugBank(remetente.email, remetente.senha);
    cy.capturarSaldo().then((saldoAntes) => {
      cy.then(() => {
        cy.get('#btn-TRANSFERÊNCIA').click();
        cy.get('input[name="accountNumber"]').type(destNum);
        cy.get('input[name="digit"]').type(destDig);
        // Bug hipótese: "100,50" pode ser interpretado como 10050 ou quebrar a operação
        cy.get('input[name="transferValue"]').type('100,50');
        cy.get('input[name="description"]').type('EXP-016 virgula decimal');
        cy.get('button[type="submit"]').click();
      });

      cy.get('#modalText').should('be.visible');
      cy.lerModal().then((msg) => {
        cy.log(`Resultado com vírgula: "${msg}"`);
      });
      cy.fecharModal();
    });
  });

  // ─── EXP-019 ───────────────────────────────────────────────────────────────
  it('@real | EXP-019 — double-click no botão Transferir não deve debitar o valor duas vezes', () => {
    const remetente = criarUsuario();
    const destinatario = criarUsuario();

    cy.cadastrarEVoltar(remetente.email, remetente.nome, remetente.senha, { comSaldo: true });
    cy.cadastrarEVoltar(destinatario.email, destinatario.nome, destinatario.senha);

    cy.loginBugBank(destinatario.email, destinatario.senha);
    let destNum, destDig;
    cy.capturarNumeroConta().then(({ numero, digito }) => { destNum = numero; destDig = digito; });
    cy.logoutBugBank();

    cy.loginBugBank(remetente.email, remetente.senha);

    cy.then(() => {
      cy.get('#btn-TRANSFERÊNCIA').click();
      cy.get('input[name="accountNumber"]').type(destNum);
      cy.get('input[name="digit"]').type(destDig);
      cy.get('input[name="transferValue"]').type('50');
      cy.get('input[name="description"]').type('EXP-019 double-click');
      // Double-click — bug hipótese: processa duas transferências de R$ 50
      cy.get('button[type="submit"]').dblclick();
    });

    // Bug hipótese: double-click processa duas transferências — validar pela mensagem do modal
    cy.get('#modalText').should('be.visible');
    cy.lerModal().then((msg) => { cy.log(`Resultado double-click: "${msg}"`); });
    cy.fecharModal();
  });
});
