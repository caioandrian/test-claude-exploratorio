// Seletores extraídos do DOM inspecionado — caioandrian.github.io/webstore-ingressos-sample
// Fonte: src/components/Header.jsx · src/pages/Login.jsx · src/pages/Events.jsx
//        src/pages/Purchase.jsx · src/components/EventCard.jsx · src/pages/MyTickets.jsx
// Todos os atributos id e data-cy verificados diretamente no código-fonte do repositório.
//
// PADRÃO DOM: SPA com HashRouter — rotas via /#/caminho
// Não há card flip — inputs têm ids estáveis diretos.
// Wizard de compra: steps controlados por estado React (sem tabs no DOM simultâneas).

export const ST_APP_URL = 'https://caioandrian.github.io/webstore-ingressos-sample'
export const ST_EVENT_ID = 'rock-festival-2025' // evento disponível com tickets e add-ons

// ─── HEADER ──────────────────────────────────────────────────────────────────
export const ST_HEADER = {
  root:         '#header',
  loginBtn:     '#header-login-btn',
  logoutBtn:    '#header-logout-btn',
  userMenuBtn:  '#user-menu-btn',
  userDropdown: '#user-dropdown',
  navEventos:   '#nav-eventos',
  navHome:      '#nav-home',
  navContato:   '#nav-contato',
  menuProfile:  '#menu-profile',
  menuOrders:   '#menu-orders',
  menuTickets:  '#menu-tickets',
}

// ─── LOGIN (/login) ───────────────────────────────────────────────────────────
export const ST_LOGIN = {
  page:             '#login-page',
  tabLogin:         '#tab-login',
  tabRegister:      '#tab-register',
  email:            '#login-email',
  password:         '#login-password',
  btnSubmit:        '#login-submit-btn',
  error:            '#login-error',
  switchToRegister: '#switch-to-register',
  switchToLogin:    '#switch-to-login',
}

// ─── REGISTRO (/login — aba cadastro) ────────────────────────────────────────
export const ST_REGISTER = {
  nome:         '#reg-name',
  email:        '#reg-email',
  cpf:          '#reg-cpf',
  telefone:     '#reg-phone',
  dataNasc:     '#reg-birthdate',
  senha:        '#reg-password',
  confirmSenha: '#reg-confirm-password',
  btnSubmit:    '#register-submit-btn',
  errorNome:    '#error-reg-name',
  errorEmail:   '#error-reg-email',
  errorCpf:     '#error-reg-cpf',
  errorSenha:   '#error-reg-password',
  apiError:     '#register-api-error',
}

// ─── EVENTOS (/eventos) ───────────────────────────────────────────────────────
export const ST_EVENTS = {
  page:      '#events-page',
  search:    '#events-search',
  grid:      '#events-grid',
  noEvents:  '#no-events-found',
  count:     '#events-count',
  eventCard: '[data-cy="event-card"]',
  buyBtn:    (id) => `#event-buy-btn-${id}`,
  soldout:   (id) => `#event-soldout-${id}`,
  title:     (id) => `#event-title-${id}`,
}

// ─── COMPRA (/comprar/:eventId) ───────────────────────────────────────────────
// Wizard de 5 etapas — cada step é renderizado condicionalmente (não simultâneo no DOM)
//
// Tickets do rock-festival-2025: pista | pista-premium | cadeira | camarote
// Tipos de ingresso por ticket: inteira | meia
// Padrão de ID: qty-increase-{ticket.id}-{tipo}
// ex: #qty-increase-pista-inteira, #qty-increase-pista-meia
//
// Campos de dados pessoais — field.id verificado no fonte:
//   name | email | confirmEmail | cpf | phone | birthdate
// Padrão: id="field-{field.id}" / data-cy="field-{field.id}"
//
// Métodos de pagamento: credit | debit | pix | boleto
// Padrão: id="payment-method-{m.id}"
export const ST_PURCHASE = {
  page:            '#purchase-page',
  eventHeader:     '#purchase-event-header',
  nextBtn:         '#next-btn',
  backBtn:         '#back-btn',
  // Step 1 — Seleção de Ingressos
  stepTickets:     '#step-tickets',
  qtyIncrease:     (ticketId, tipo) => `#qty-increase-${ticketId}-${tipo}`,
  qtyDecrease:     (ticketId, tipo) => `#qty-decrease-${ticketId}-${tipo}`,
  qtyValue:        (ticketId, tipo) => `#qty-value-${ticketId}-${tipo}`,
  // Step 2 — Add-ons
  stepAddons:      '#step-addons',
  stepAddonsEmpty: '#step-addons-empty',
  addonCard:       (id) => `#addon-${id}`,
  // Step 3 — Dados Pessoais
  stepUserData:    '#step-user-data',
  fieldNome:       '#field-name',
  fieldEmail:      '#field-email',
  fieldConfirm:    '#field-confirmEmail',
  fieldCpf:        '#field-cpf',
  fieldTelefone:   '#field-phone',
  fieldNasc:       '#field-birthdate',
  errorNome:       '#error-name',
  errorEmail:      '#error-email',
  errorConfirm:    '#error-confirmEmail',
  errorCpf:        '#error-cpf',
  errorTelefone:   '#error-phone',
  // Step 4 — Pagamento
  stepPayment:     '#step-payment',
  paymentTotal:    '#payment-total',
  methodCredit:    '#payment-method-credit',
  methodDebit:     '#payment-method-debit',
  methodPix:       '#payment-method-pix',
  methodBoleto:    '#payment-method-boleto',
  cardForm:        '#card-form',
  cardNumber:      '#field-cardNumber',
  cardName:        '#field-cardName',
  cardExpiry:      '#field-expiry',
  cardCvv:         '#field-cvv',
  pixSection:      '#pix-section',
  boletoSection:   '#boleto-section',
  processing:      '#payment-processing',
  // Step 5 — Confirmação
  success:         '#purchase-success',
  error:           '#purchase-error',
  orderId:         '#order-id',
  retryBtn:        '#retry-payment-btn',
  viewTicketsBtn:  '#view-tickets-btn',
  buyMoreBtn:      '#buy-more-btn',
  goEventsBtn:     '#go-events-btn',
  confirmCard:     '#order-confirmation-card',
  // Order Summary (sidebar)
  orderSummary:    '#order-summary',
  summaryTotal:    '#summary-total',
  // LoginGate
  loginGate:       '#login-gate',
  loginGateClose:  '#login-gate-close',
  gateLoginBtn:    '#gate-login-btn',
  gateRegisterBtn: '#gate-register-btn',
}

// ─── MEUS INGRESSOS (/meus-ingressos) ─────────────────────────────────────────
export const ST_MY_TICKETS = {
  page:       '#my-tickets-page',
  title:      '#my-tickets-title',
  ordersList: '#orders-list',
  noTickets:  '#no-tickets',
  loginBtn:   '#login-to-see-tickets-btn',
  exploreBtn: '#explore-events-btn',
  ticketCard: '[data-cy="ticket-card"]',
  orderTitle: (id) => `#order-event-title-${id}`,
  orderStatus:(id) => `#order-status-${id}`,
  orderTotal: (id) => `#order-total-${id}`,
  expandBtn:  (id) => `#expand-order-${id}`,
}
