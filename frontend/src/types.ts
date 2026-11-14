
export interface UsuarioLogado {
    token: string,
    clientId: number,
    nome: string,
    email: string,
}

export interface ResumoLote{
    idLote: number,
    dataAplicacao: string,
    diasCorridos: number,
    valorAplicado: number,
    lucroBruto: number,
    aliquotaIof: number,
    valorIof: number,
    aliquotaIr: number,
    valorIr: number,
    impostoTotal: number,
    lucroLiquido: number,
    saldoLiquidoDisponivel: number,
}

export interface ResultadoSimulacao{
    valorSolicitado: number,
    impostoOtimizado: number,
    impostoSemOtimizar: number,
    economiaGerada: number,
}