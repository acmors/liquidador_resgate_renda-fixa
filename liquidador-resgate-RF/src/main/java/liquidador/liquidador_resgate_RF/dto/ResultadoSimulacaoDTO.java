package liquidador.liquidador_resgate_RF.dto;

import java.math.BigDecimal;

public class ResultadoSimulacaoDTO {

    private BigDecimal valorSolicitado;
    private BigDecimal impostoOtimizado;
    private BigDecimal impostoSemOtimizar;
    private BigDecimal economiaGerada;

    public ResultadoSimulacaoDTO() {
    }

    public ResultadoSimulacaoDTO(BigDecimal valorSolicitado, BigDecimal impostoOtimizado, BigDecimal impostoSemOtimizar, BigDecimal economiaGerada) {
        this.valorSolicitado = valorSolicitado;
        this.impostoOtimizado = impostoOtimizado;
        this.impostoSemOtimizar = impostoSemOtimizar;
        this.economiaGerada = economiaGerada;
    }

    public BigDecimal getValorSolicitado() {
        return valorSolicitado;
    }

    public void setValorSolicitado(BigDecimal valorSolicitado) {
        this.valorSolicitado = valorSolicitado;
    }

    public BigDecimal getImpostoOtimizado() {
        return impostoOtimizado;
    }

    public void setImpostoOtimizado(BigDecimal impostoOtimizado) {
        this.impostoOtimizado = impostoOtimizado;
    }

    public BigDecimal getImpostoSemOtimizar() {
        return impostoSemOtimizar;
    }

    public void setImpostoSemOtimizar(BigDecimal impostoSemOtimizar) {
        this.impostoSemOtimizar = impostoSemOtimizar;
    }

    public BigDecimal getEconomiaGerada() {
        return economiaGerada;
    }

    public void setEconomiaGerada(BigDecimal economiaGerada) {
        this.economiaGerada = economiaGerada;
    }
}
