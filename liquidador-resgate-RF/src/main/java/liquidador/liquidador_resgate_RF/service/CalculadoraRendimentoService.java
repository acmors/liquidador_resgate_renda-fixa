package liquidador.liquidador_resgate_RF.service;

import liquidador.liquidador_resgate_RF.entitiy.LoteCdb;
import liquidador.liquidador_resgate_RF.integration.BacenApiClient;
import liquidador.liquidador_resgate_RF.integration.TaxaBacenResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class CalculadoraRendimentoService {

    private final BacenApiClient bacenApiClient;

    public CalculadoraRendimentoService(BacenApiClient bacenApiClient) {
        this.bacenApiClient = bacenApiClient;
    }


    public BigDecimal calcularLucroBruto(LoteCdb loteCdb){
        LocalDate dataInicial = loteCdb.getDataAplicacao().toLocalDate();
        LocalDate dataFinal = LocalDate.now();

        List<TaxaBacenResponse> listaTaxaBacen = bacenApiClient.buscarTaxaCdi(dataInicial, dataFinal);
        
        BigDecimal saldoAtual = loteCdb.getValorAplicado();

        for (TaxaBacenResponse dia : listaTaxaBacen){
            BigDecimal rendeuHoje = calcularRendimentoDoDia(saldoAtual, dia.getValor(), loteCdb.getPercentualCdi());
            saldoAtual = saldoAtual.add(rendeuHoje);
        }

        BigDecimal lucroBruto = saldoAtual.subtract(loteCdb.getValorAplicado());
        return lucroBruto.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calcularRendimentoDoDia(BigDecimal saldoAtual, String taxaBacen, BigDecimal percentualCdi){
        BigDecimal taxaGoverno = new BigDecimal(taxaBacen);

        BigDecimal taxaCliente = taxaGoverno
                .multiply(percentualCdi)
                .divide(BigDecimal.valueOf(100), 8, RoundingMode.HALF_UP);

        return saldoAtual
                .multiply(taxaCliente)
                .divide(BigDecimal.valueOf(100), 8, RoundingMode.HALF_UP);
    }
}
