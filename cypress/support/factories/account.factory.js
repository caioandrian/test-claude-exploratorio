// Schema localStorage — BugBank:
//   chave principal: email do usuário
//   valor: { name, email, password, accountNumber, balance, logged }
//   transações: chave "transaction:${email}" → []
//   balance inicial: 1000 se checkbox marcado, 0 caso contrário

const uid = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`

const buildAccountNumber = () => {
  const n = Math.floor(Math.random() * 1000)
  const d = Math.floor(Math.random() * 10)
  return { full: `${n}-${d}`, number: String(n), digit: String(d) }
}

export const buildAccount = (overrides = {}) => {
  const acc = buildAccountNumber()
  return {
    name: `Usuário ${uid()}`,
    email: `user_${uid()}@test.com`,
    password: 'Senha@123',
    accountNumber: acc.full,
    accountNumberOnly: acc.number,
    accountDigit: acc.digit,
    balance: 0,
    logged: false,
    ...overrides,
  }
}

// Injeta conta diretamente no localStorage (evita UI no setup)
export const seedAccount = (account) => {
  cy.window().then((win) => {
    const { accountNumberOnly, accountDigit, ...stored } = account
    win.localStorage.setItem(account.email, JSON.stringify(stored))
    win.localStorage.setItem(`transaction:${account.email}`, JSON.stringify([]))
  })
  return cy.wrap(account)
}

export const buildAndSeedAccount = (overrides = {}) => {
  const account = buildAccount(overrides)
  return seedAccount(account)
}
