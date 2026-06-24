// EXP-030 | Rotas protegidas acessíveis sem login → deve redirecionar para /

const APP_URL = 'https://bugbank.netlify.app';

describe('Exploratório — Segurança Básica', () => {

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // ─── EXP-030 ───────────────────────────────────────────────────────────────
  const rotasProtegidas = [
    { rota: '/home',           descricao: 'dashboard principal' },
    { rota: '/transfer',       descricao: 'tela de transferência' },
    { rota: '/bank-statement', descricao: 'extrato bancário' },
  ];

  rotasProtegidas.forEach(({ rota, descricao }) => {
    it(`@real | EXP-030 — "${rota}" (${descricao}) sem sessão deve redirecionar para login`, () => {
      cy.visit(`${APP_URL}${rota}`);

      // Bug hipótese: SPA sem guarda de rota — tela autenticada é exibida sem credenciais
      cy.url().then((url) => {
        const naRotaProtegida = url.includes(rota.replace('/', ''));
        if (naRotaProtegida) {
          cy.log(`BUG DETECTADO: Rota "${rota}" acessível sem autenticação. URL atual: ${url}`);
        }
      });

      cy.url().should('eq', APP_URL + '/');
      cy.contains('button', 'Acessar').should('be.visible');
      cy.get('#textBalance').should('not.exist');
    });
  });
});
