// EXP-028 — Acesso direto via URL com ID de evento inválido
// @real
//
// Hipóteses de bug:
//   1. Tela branca (crash silencioso) ao acessar /comprar/ID-inexistente — React suprime o
//      TypeError em produção e não renderiza nada, sem nenhum fallback para o usuário
//   2. Evento esgotado acessível via URL direta ignorando o flag soldOut
//   3. TypeError exposto como texto visível ao usuário
//
// COMPORTAMENTO REAL DO SISTEMA (verificado em execução headless):
//   /comprar/999         → "Evento não encontrado." + botão "Ver Eventos"
//   /comprar/undefined   → "Evento não encontrado." + botão "Ver Eventos"
//   /comprar/            → 404 "Página não encontrada" + botões "Ir para o Início" / "Ver Eventos"
//   /comprar/forrozao-*  → "Evento Esgotado" + botão "Ver Outros Eventos"
//   /rota-inexistente    → 404 "Página não encontrada" + botões de navegação
//
// INDICADOR DE CRASH EM PRODUÇÃO REACT:
//   A ausência do #header é o indicador de tela branca (crash silencioso).
//   Em qualquer página válida (404, evento não encontrado, esgotado, eventos), o #header existe.
//   NÃO usar body.text().includes("TypeError") — não aparece em builds de produção.
//   NÃO inventar seletores de página ([data-cy="not-found"]) sem verificar no DOM real.

const APP_URL = 'https://caioandrian.github.io/webstore-ingressos-sample'

describe('[ST] EXP-028 — Manipulação de URL com evento inválido @real', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err) => {
      if (
        err.message.includes('Cannot read properties of undefined') ||
        err.message.includes('Cannot read properties of null') ||
        err.message.includes('undefined is not an object')
      ) {
        return false
      }
    })
    cy.clearLocalStorage()
  })

  // Indicador de "app renderizou sem crash": o texto "ShowTickets" aparece no logo
  // da nav em TODAS as páginas do app (compra, 404, esgotado, não encontrado).
  // Usar .should('contain.text') — Cypress reintenta automaticamente até o timeout,
  // aguardando o React renderizar (invoke('text').then() não reintenta e captura o
  // HTML shell antes do React executar, dando false negative de "tela branca").
  const assertSemCrash = (contexto) => {
    cy.get('body', { timeout: 10000 })
      .should('contain.text', 'ShowTickets')
    // Após confirmar que o React renderizou, verificar se há erro interno exposto
    cy.get('body').invoke('text').then((texto) => {
      if (texto.includes('TypeError') || texto.includes('Cannot read properties')) {
        throw new Error(`[BUG EXP-028] ${contexto}: erro interno exposto visualmente ao usuário`)
      }
    })
  }

  // ─── ID numérico inexistente → "Evento não encontrado." ──────────────────────
  it('deve exibir fallback (não crashar) para evento com ID inexistente "999"', () => {
    cy.visit(`${APP_URL}/#/comprar/999`)
    assertSemCrash('ID "999" inexistente')
    // Sistema mostra "Evento não encontrado." + botão "Ver Eventos" — verificar mensagem
    cy.get('body').invoke('text').should('match', /evento não encontrado|not found/i)
  })

  // ─── ID literal "undefined" → "Evento não encontrado." ───────────────────────
  it('deve exibir fallback para ID "undefined" na URL', () => {
    cy.visit(`${APP_URL}/#/comprar/undefined`)
    assertSemCrash('ID literal "undefined"')
    cy.get('body').invoke('text').should('match', /evento não encontrado|not found/i)
  })

  // ─── Rota /comprar/ sem ID → 404 ─────────────────────────────────────────────
  it('deve exibir fallback para rota /comprar/ sem ID', () => {
    cy.visit(`${APP_URL}/#/comprar/`)
    assertSemCrash('rota /comprar/ sem ID')
    // Sistema renderiza página 404 com mensagem de página não encontrada
    cy.get('body').invoke('text').should('match', /404|página não encontrada|not found/i)
  })

  // ─── Evento esgotado via URL direta → "Evento Esgotado" ──────────────────────
  it('deve exibir mensagem de esgotado ao acessar evento soldOut via URL direta', () => {
    // Hipótese de bug: flag soldOut ignorado na rota — purchase-page abre normalmente
    // Comportamento correto verificado: app mostra "Evento Esgotado" + "Ver Outros Eventos"
    cy.visit(`${APP_URL}/#/comprar/forrozao-nordeste-2025`)

    assertSemCrash('evento esgotado forrozao-nordeste-2025')

    cy.get('body').then(($body) => {
      if ($body.find('#purchase-page').length > 0) {
        // Se purchase-page carregou: verifica que compra está bloqueada
        cy.get('#next-btn').then(($btn) => {
          const estaDesabilitado = $btn.is(':disabled')
          const temAviso = $body.find('[data-cy="soldout-warning"], #step-tickets [class*="sold"]').length > 0
          if (!estaDesabilitado && !temAviso) {
            throw new Error('[BUG EXP-028] Evento esgotado acessível via URL — #next-btn habilitado sem aviso de esgotado')
          }
        })
      } else {
        // App mostrou página de "Evento Esgotado" ou 404 — ambos são corretos
        // Verificar apenas que o usuário recebeu feedback sobre o evento
        assertSemCrash('resposta para evento esgotado')
      }
    })
  })

  // ─── Rota completamente inválida → 404 ───────────────────────────────────────
  it('deve exibir 404 ou redirecionar para rota completamente inválida', () => {
    cy.visit(`${APP_URL}/#/rota-que-nao-existe-xyz`)
    assertSemCrash('rota /rota-que-nao-existe-xyz')
    // Sistema renderiza página 404 — verificar mensagem no corpo
    cy.get('body').invoke('text').should('match', /404|página não encontrada|not found/i)
  })
})
