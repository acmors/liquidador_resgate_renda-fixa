package liquidador.liquidador_resgate_RF.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ResumoLoteDTO {

    private Long idLote;
    private LocalDate dataAplicacao;
    private int diasCorridos;
    private BigDecimal valorAplicado;
    private BigDecimal lucroBruto;
    private BigDecimal aliquotaIof;
    private BigDecimal valorIof;
    private BigDecimal aliquotaIr;
    private BigDecimal valorIr;
    private BigDecimal impostoTotal;
    private BigDecimal lucroLiquido;
    private BigDecimal saldoLiquidoDisponivel;

    public ResumoLoteDTO() {}

    public ResumoLoteDTO(Long idLote, LocalDate dataAplicacao, int diasCorridos, BigDecimal valorAplicado, BigDecimal lucroBruto, BigDecimal aliquotaIof, BigDecimal valorIof, BigDecimal aliquotaIr, BigDecimal valorIr, BigDecimal impostoTotal, BigDecimal lucroLiquido, BigDecimal saldoLiquidoDisponivel) {
        this.idLote = idLote;
        this.dataAplicacao = dataAplicacao;
        this.diasCorridos = diasCorridos;
        this.valorAplicado = valorAplicado;
        this.lucroBruto = lucroBruto;
        this.aliquotaIof = aliquotaIof;
        this.valorIof = valorIof;
        this.aliquotaIr = aliquotaIr;
        this.valorIr = valorIr;
        this.impostoTotal = impostoTotal;
        this.lucroLiquido = lucroLiquido;
        this.saldoLiquidoDisponivel = saldoLiquidoDisponivel;
    }

    public Long getIdLote() {
        return idLote;
    }

    public void setIdLote(Long idLote) {
        this.idLote = idLote;
    }

    public LocalDate getDataAplicacao() {
        return dataAplicacao;
    }

    public void setDataAplicacao(LocalDate dataAplicacao) {
        this.dataAplicacao = dataAplicacao;
    }

    public int getDiasCorridos() {
        return diasCorridos;
    }

    public void setDiasCorridos(int diasCorridos) {
        this.diasCorridos = diasCorridos;
    }

    public BigDecimal getValorAplicado() {
        return valorAplicado;
    }

    public void setValorAplicado(BigDecimal valorAplicado) {
        this.valorAplicado = valorAplicado;
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

    public BigDecimal getSaldoLiquidoDisponivel() {
        return saldoLiquidoDisponivel;
    }

    public void setSaldoLiquidoDisponivel(BigDecimal saldoLiquidoDisponivel) {
        this.saldoLiquidoDisponivel = saldoLiquidoDisponivel;
    }
}
