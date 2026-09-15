function obterDigitos(valor) {
  return (valor || "").replace(/\D/g, "");
}

function validarEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validarSenha(senha) {
  if (typeof senha !== "string") return false;
  return senha.length >= 8 && /\d/.test(senha);
}

function validarConfirmacao(senha, confirmarSenha) {
  return senha === confirmarSenha;
}

function validarTelefone(telefone) {
  const digitos = obterDigitos(telefone);
  return digitos.length === 10 || digitos.length === 11;
}

function validarCPF(cpf) {
  const digitos = obterDigitos(cpf);
  if (digitos.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(digitos.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(digitos.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(digitos.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(digitos.charAt(10));
}

function validarCNPJ(cnpj) {
  const digitos = obterDigitos(cnpj);
  if (digitos.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digitos)) return false;

  const calcularDigito = (pesos) => {
    let soma = 0;
    for (let i = 0; i < pesos.length; i++) soma += Number(digitos.charAt(i)) * pesos[i];
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiro = calcularDigito([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (primeiro !== Number(digitos.charAt(12))) return false;

  const segundo = calcularDigito([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return segundo === Number(digitos.charAt(13));
}

function mascaraTelefone(valor) {
  const digitos = obterDigitos(valor).slice(0, 11);
  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

function mascaraCpf(valor) {
  const digitos = obterDigitos(valor).slice(0, 11);
  if (digitos.length <= 3) return digitos;
  if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
  if (digitos.length <= 9) return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

function mascaraCnpj(valor) {
  const digitos = obterDigitos(valor).slice(0, 14);
  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 5) return `${digitos.slice(0, 2)}.${digitos.slice(2)}`;
  if (digitos.length <= 8) return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5)}`;
  if (digitos.length <= 12) return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8)}`;
  return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`;
}

function aplicarMascara(idCampo, mascara) {
  const campo = document.getElementById(idCampo);
  if (!campo) return;
  campo.addEventListener("input", () => {
    campo.value = mascara(campo.value);
  });
}