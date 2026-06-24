let _seq = 0;

const criarUsuario = (opts = {}) => {
  _seq++;
  const ts = Date.now();
  return {
    email:    opts.email    !== undefined ? opts.email    : `qa_${ts}_${_seq}@bugbank.test`,
    nome:     opts.nome     !== undefined ? opts.nome     : `Testador ${_seq}`,
    senha:    opts.senha    !== undefined ? opts.senha    : 'Senha@123',
    comSaldo: opts.comSaldo !== undefined ? opts.comSaldo : false,
  };
};

module.exports = { criarUsuario };
