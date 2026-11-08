package liquidador.liquidador_resgate_RF.dto;

import java.math.BigDecimal;

public class ResultadoImpostoDTO {

    private BigDecimal lucroBruto;
    private BigDecimal aliquotaIof;
    private BigDecimal valorIof;
    private BigDecimal aliquotaIr;
    private BigDecimal valorIr;
    private BigDecimal impostoTotal;
    private BigDecimal lucroLiquido;

    public ResultadoImpostoDTO() {}

    public ResultadoImpostoDTO(BigDecimal lucroBruto, BigDecimal aliquotaIof, BigDecimal valorIof, BigDecimal aliquotaIr, BigDecimal valorIr, BigDecimal impostoTotal, BigDecimal lucroLiquido) {
        this.lucroBruto = lucroBruto;
        this.aliquotaIof = aliquotaIof;
        this.valorIof = valorIof;
        this.aliquotaIr = aliquotaIr;
        this.valorIr = valorIr;
        this.impostoTotal = impostoTotal;
        this.lucroLiquido = lucroLiquido;
    }

    public BigDecimal getLucroBruto() {
        return lucroBruto;
    }

    public void setLucroBruto(BigDecimal lucroBruto) {
        this.lucroBruto = lucroBruto;
    }

    public BigDecimal getAliquotaIof() {
        return aliquotaIof;
    }

    public void setAliquotaIof(BigDecimal aliquotaIof) {
        this.aliquotaIof = aliquotaIof;
    }

    public BigDecimal getValorIof() {
        return valorIof;
    }

    public void setValorIof(BigDecimal valorIof) {
        this.valorIof = valorIof;
    }

    public BigDecimal getAliquotaIr() {
        return aliquotaIr;
    }

    public void setAliquotaIr(BigDecimal aliquotaIr) {
        this.aliquotaIr = aliquotaIr;
    }

    public BigDecimal getValorIr() {
        return valorIr;
    }

    public void setValorIr(BigDecimal valorIr) {
        this.valorIr = valorIr;
    }

    public BigDecimal getImpostoTotal() {
        return impostoTotal;
    }

    public void setImpostoTotal(BigDecimal impostoTotal) {
        this.impostoTotal = impostoTotal;
    }

    public BigDecimal getLucroLiquido() {
        return lucroLiquido;
    }

    public void setLucroLiquido(BigDecimal lucroLiquido) {
        this.lucroLiquido = lucroLiquido;
    }
}
