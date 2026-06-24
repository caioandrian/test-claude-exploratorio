let _seq = 0

/**
 * Cria objeto de usuário ShowTickets com valores únicos por padrão.
 */
const criarUsuarioST = (opts = {}) => {
  _seq++
  const ts = Date.now()
  return {
    nome:      opts.nome      ?? `QA ST ${_seq}`,
    email:     opts.email     ?? `qa_st_${ts}_${_seq}@showtests.com`,
    cpf:       opts.cpf       ?? '111.222.333-45',
    telefone:  opts.telefone  ?? '(11) 91234-5678',
    dataNasc:  opts.dataNasc  ?? '1990-06-15',
    senha:     opts.senha     ?? 'Senha@123',
  }
}

/**
 * Converte dados de usuário para o formato armazenado no localStorage (showtickets_users).
 */
const montarStorageUser = (user) => ({
  id:        `test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  name:      user.nome,
  email:     user.email,
  password:  user.senha,
  cpf:       user.cpf,
  phone:     user.telefone,
  birthdate: user.dataNasc,
  createdAt: new Date().toISOString(),
})

/**
 * Retorna o objeto de sessão (sem password) para showtickets_session.
 */
const montarSessao = (storedUser) => {
  const { password, ...sessao } = storedUser
  return sessao
}

module.exports = { criarUsuarioST, montarStorageUser, montarSessao }
