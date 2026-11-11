package liquidador.liquidador_resgate_RF.entitiy;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_lote_cdb")
public class LoteCdb {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long clienteId;
    private BigDecimal valorAplicado;
    private LocalDateTime dataAplicacao;
    private BigDecimal percentualCdi;
    private boolean resgatado = false;

    public LoteCdb() {
    }

    public LoteCdb(Long id, Long clienteId, BigDecimal valorAplicado, LocalDateTime dataAplicacao, BigDecimal percentualCdi, boolean resgatado) {
        this.id = id;
        this.clienteId = clienteId;
        this.valorAplicado = valorAplicado;
        this.dataAplicacao = dataAplicacao;
        this.percentualCdi = percentualCdi;
        this.resgatado = resgatado;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public BigDecimal getValorAplicado() {
        return valorAplicado;
    }

    public void setValorAplicado(BigDecimal valorAplicado) {
        this.valorAplicado = valorAplicado;
    }

    public LocalDateTime getDataAplicacao() {
        return dataAplicacao;
    }

    public void setDataAplicacao(LocalDateTime dataAplicacao) {
        this.dataAplicacao = dataAplicacao;
    }

    public BigDecimal getPercentualCdi() {
        return percentualCdi;
    }

    public void setPercentualCdi(BigDecimal percentualCdi) {
        this.percentualCdi = percentualCdi;
    }

    public boolean isResgatado() {
        return resgatado;
    }

    public void setResgatado(boolean resgatado) {
        this.resgatado = resgatado;
    }
}
