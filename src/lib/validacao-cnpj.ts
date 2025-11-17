// Validação de CNPJ (Brasil)
// Remove caracteres não numéricos e aplica algoritmo oficial.
export function validarCNPJ(input: string): boolean {
  if (!input) return false
  const cnpj = (input || '').replace(/\D/g, '')
  if (cnpj.length !== 14) return false
  // Rejeita sequências iguais (ex: 00.., 11..)
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  // Cálculo dos dígitos verificadores
  const calcDV = (base: string, pesos: number[]) => {
    const soma = base.split('').reduce((acc, num, idx) => acc + parseInt(num, 10) * pesos[idx], 0)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }

  const base12 = cnpj.slice(0, 12)
  const dv1 = calcDV(base12, [5,4,3,2,9,8,7,6,5,4,3,2])
  const dv2 = calcDV(base12 + dv1.toString(), [6,5,4,3,2,9,8,7,6,5,4,3,2])

  return cnpj === base12 + dv1.toString() + dv2.toString()
}
