import { validarCNPJ } from "@/lib/validacao-cnpj"

function gerarCNPJValido(base12 = "123456780001") {
  const calcDV = (base: string, pesos: number[]) => {
    const soma = base.split('').reduce((acc, num, idx) => acc + parseInt(num, 10) * pesos[idx], 0)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }
  const dv1 = calcDV(base12, [5,4,3,2,9,8,7,6,5,4,3,2])
  const dv2 = calcDV(base12 + dv1.toString(), [6,5,4,3,2,9,8,7,6,5,4,3,2])
  const cnpj = base12 + dv1.toString() + dv2.toString()
  // Formatar como 00.000.000/0000-00
  return `${cnpj.slice(0,2)}.${cnpj.slice(2,5)}.${cnpj.slice(5,8)}/${cnpj.slice(8,12)}-${cnpj.slice(12,14)}`
}

describe("Validar CNPJ", () => {
  it("CNPJ válido gerado por DV", () => {
    const cnpj = gerarCNPJValido()
    expect(validarCNPJ(cnpj)).toBe(true)
  })

  it("CNPJs inválidos", () => {
    const invalids = [
      "11.111.111/1111-11",
      "00.000.000/0000-00",
      "123",
      "12345678901234",
    ]
    for (const c of invalids) {
      expect(validarCNPJ(c)).toBe(false)
    }
  })
})
