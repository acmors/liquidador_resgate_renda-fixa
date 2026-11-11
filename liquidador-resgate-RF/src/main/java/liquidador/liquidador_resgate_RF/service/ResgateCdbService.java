package liquidador.liquidador_resgate_RF.service;

import liquidador.liquidador_resgate_RF.dto.ResultadoImpostoDTO;
import liquidador.liquidador_resgate_RF.dto.ResultadoSimulacaoDTO;
import liquidador.liquidador_resgate_RF.dto.ResumoLoteDTO;
import liquidador.liquidador_resgate_RF.entitiy.LoteCdb;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ResgateCdbService {

    private final LoteCdbService loteCdbService;
    private final CalculadoraRendimentoService calculadoraRendimentoService;
    private final CalculadoraImpostoService calculadoraImpostoService;

    public ResgateCdbService(LoteCdbService loteCdbService, CalculadoraRendimentoService calculadoraRendimentoService, CalculadoraImpostoService calculadoraImpostoService) {
        this.loteCdbService = loteCdbService;
        this.calculadoraRendimentoService = calculadoraRendimentoService;
        this.calculadoraImpostoService = calculadoraImpostoService;
    }

    public List<ResumoLoteDTO> listarCarteiraDetalhada(Long clienteId){
        List<LoteCdb> lotes = loteCdbService.findByResgatadoFalse(clienteId);
        List<ResumoLoteDTO> resumos = new ArrayList<>();

        for (LoteCdb lote : lotes) {
            //ResumoLoteDTO resumo = montarResumoDoLote(lote);
            resumos.add(montarResumoDoLote(lote));
        }

        return resumos;
    }

    public ResultadoSimulacaoDTO simularResgate(BigDecimal valorDesejado, Long clienteId){
        if(valorDesejado == null || valorDesejado.compareTo(BigDecimal.ZERO) <= 0){
            throw new IllegalArgumentException("Valor de resgate inválido.");
        }

        List<ResumoLoteDTO> carteira = listarCarteiraDetalhada(clienteId);

        carteira.sort(Comparator.comparing(ResumoLoteDTO::getImpostoTotal));
        BigDecimal impostoOtimizado = calcularImpostoDoSaque(carteira, valorDesejado);

        carteira.sort(Comparator.comparing(ResumoLoteDTO::getImpostoTotal).reversed());
        BigDecimal impostoSemOtimizar = calcularImpostoDoSaque(carteira, valorDesejado);

        BigDecimal economia = impostoSemOtimizar.subtract(impostoOtimizado);

        return new ResultadoSimulacaoDTO(
                valorDesejado,
                impostoOtimizado,
                impostoSemOtimizar,
                economia
        );
    }

    private ResumoLoteDTO montarResumoDoLote(LoteCdb loteCdb) {
        int diasCorridos = (int) ChronoUnit.DAYS.between(loteCdb.getDataAplicacao().toLocalDate(), LocalDate.now());
        if (diasCorridos <= 0) diasCorridos = 1;

        BigDecimal lucroBruto = calculadoraRendimentoService.calcularLucroBruto(loteCdb);
        ResultadoImpostoDTO impostos = calculadoraImpostoService.calcularImpostos(lucroBruto, diasCorridos);
        BigDecimal saldoLiquido = loteCdb.getValorAplicado().add(impostos.getLucroLiquido());
        return new ResumoLoteDTO(
                loteCdb.getId(),
                loteCdb.getDataAplicacao().toLocalDate(),
                diasCorridos,
                loteCdb.getValorAplicado(),
                lucroBruto,
                impostos.getAliquotaIof(),
                impostos.getValorIof(),
                impostos.getAliquotaIr(),
                impostos.getValorIr(),
                impostos.getImpostoTotal(),
                impostos.getLucroLiquido(),
                saldoLiquido
        );
    }

    private BigDecimal calcularImpostoDoSaque(List<ResumoLoteDTO> lotesOrdenados, BigDecimal valorSolicitado){
        BigDecimal faltaSacar = valorSolicitado;
        BigDecimal impostoAcumulado = BigDecimal.ZERO;

        for (ResumoLoteDTO lote: lotesOrdenados){
            if(faltaSacar.compareTo(BigDecimal.ZERO) <= 0){
                break;
            }

            BigDecimal disponivelNoLote = lote.getSaldoLiquidoDisponivel();

            if (disponivelNoLote.compareTo(faltaSacar) <= 0){
                impostoAcumulado = impostoAcumulado.add(lote.getImpostoTotal());
                faltaSacar = faltaSacar.subtract(disponivelNoLote);
            }else {
                BigDecimal impostoProporcional = lote.getImpostoTotal().multiply(faltaSacar).divide(disponivelNoLote, 2, RoundingMode.HALF_UP);

                impostoAcumulado = impostoAcumulado.add(impostoProporcional);
                faltaSacar = BigDecimal.ZERO;
            }
        }

        if (faltaSacar.compareTo(BigDecimal.ZERO) > 0){
            throw new IllegalStateException("Saldo líquido insuficiente na carteira para este resgate");
        }

        return impostoAcumulado;
    }
}
