// Seletores extraídos do DOM inspecionado — bugbank.netlify.app
// Fonte: src/pages/index.tsx + src/components/FormLogin/index.tsx
//        + src/components/FormRegister/index.tsx
//
// PADRÃO DOM: Card Flip 3D
//   <Wrapper isLogin={isLogin}>           ← rotateY(180deg) quando !isLogin
//     <div className="card__login">       ← frente (login)
//       <ContainerFormLogin>              ← styled-component (classe dinâmica)
//     <div className="card__register">   ← verso (cadastro)
//       <ContainerFormRegister>          ← styled-component (classe dinâmica)
//
// ESTRATÉGIA: escopar ao container pai estático (.card__login / .card__register)
// Usar cy.disableTransitions() no beforeEach — injeta backface-visibility:visible
// tornando o flip instantâneo e evitando erros de visibilidade no .card__register.

// ─── LOGIN (frente do card — .card__login) ───────────────────────────────────
// Inputs não têm id; form não tem id. Seletor: container + name.
export const LOGIN = {
  email:    '.card__login input[name="email"]',
  password: '.card__login input[name="password"]',
  btnAcessar:    '.card__login .login__buttons button[type="submit"]',
  linkRegistrar: '.card__login .login__buttons button[type="button"]',
}

// ─── CADASTRO (verso do card — .card__register) ──────────────────────────────
// Inputs não têm id; form não tem id. Seletor: container + name.
// toggleAddBalance e btnBackButton têm id estável.
// btnRegister: Button compartilhado NÃO repassa id ao DOM — usar type="submit".
export const REGISTER = {
  email:               '.card__register input[name="email"]',
  name:                '.card__register input[name="name"]',
  password:            '.card__register input[name="password"]',
  passwordConfirmation: '.card__register input[name="passwordConfirmation"]',
  checkboxSaldo:       '#toggleAddBalance',                      // ToggleSwitch repassa id ✓
  btnCadastrar:        '.card__register button[type="submit"]',  // Button compartilhado não repassa id
  btnVoltar:           '#btnBackButton',                         // BackText styled-a repassa id ✓
}

// ─── TRANSFERÊNCIA (/transfer) ────────────────────────────────────────────────
// Fonte: src/components/FormTransfer/index.tsx
// form tag sem id; inputs com name.
// btnTransferNow: Button compartilhado NÃO repassa id ao DOM — único submit na página.
export const TRANSFER = {
  accountNumber: 'input[name="accountNumber"]',
  digit:         'input[name="digit"]',
  value:         'input[name="transferValue"]',
  description:   'input[name="description"]',
  btnTransferir: 'button[type="submit"]',  // Button compartilhado não repassa id; único submit em /transfer
}

// ─── HOME (/home) ─────────────────────────────────────────────────────────────
// Fonte: src/pages/home/index.tsx — todos os elementos têm id estável.
export const HOME = {
  balance:       '#textBalance',
  accountNumber: '#textAccountNumber',
  btnTransfer:   '#btn-TRANSFERÊNCIA',
  btnStatement:  '#btn-EXTRATO',
  btnLogout:     '#btnExit',
}

// ─── EXTRATO (/bank-statement) ────────────────────────────────────────────────
// Fonte: src/pages/bank-statement/index.tsx — todos têm id estável.
export const STATEMENT = {
  balance:         '#textBalanceAvailable',
  transactionType: '#textTypeTransaction',
  description:     '#textDescription',
  value:           '#textTransferValue',
  date:            '#textDateTransaction',
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
// Fonte: src/components/Modal/index.tsx — ids estáveis verificados nos commands existentes.
export const MODAL = {
  text:  '#modalText',
  btnOk: '#btnCloseModal',
}
