package liquidador.liquidador_resgate_RF.service;

import liquidador.liquidador_resgate_RF.dto.ResultadoImpostoDTO;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class CalculadoraImpostoService {

    private static final int[] TABELA_IOF = {
            96, 93, 90, 86, 83, 80, 76, 73, 70, 66, // 1 - 10
            63, 60, 56, 53, 50, 46, 43, 40, 36, 33, // 11 - 20
            30, 26, 23, 20, 16, 13, 10, 6, 3        // 21 - 29
    };

    public ResultadoImpostoDTO calcularImpostos(BigDecimal lucroBruto, int diasCorridos){
        validarEntrada(lucroBruto, diasCorridos);

        BigDecimal aliquota = obterAliquotaIof(diasCorridos);

        BigDecimal valorIof = calcularPorcentagem(lucroBruto, aliquota);

        BigDecimal baseCalcIR = lucroBruto.subtract(valorIof);

        BigDecimal aliquotaIR = obterAliquotaIr(diasCorridos);

        BigDecimal valorIR = calcularPorcentagem(baseCalcIR, aliquotaIR);

        BigDecimal impostoTotal = valorIof.add(valorIR);

        BigDecimal lucroLiquido = lucroBruto.subtract(impostoTotal);

        return new ResultadoImpostoDTO(
                lucroBruto,
                aliquota,
                valorIof,
                aliquotaIR,
                valorIR,
                impostoTotal,
                lucroLiquido
        );
    }

    private BigDecimal obterAliquotaIof(int diasCorridos){
        if (diasCorridos >= 30){
            return BigDecimal.ZERO;
        }

        int percentual = TABELA_IOF[diasCorridos - 1];
        return BigDecimal.valueOf(percentual);
    }

    private BigDecimal obterAliquotaIr(int diasCorridos){
        if (diasCorridos <= 180){
            return new BigDecimal("22.5");
        }

        if (diasCorridos <= 360){
            return new BigDecimal("20.0");
        }

        if (diasCorridos <= 720){
            return new BigDecimal("17.5");
        }

        return new BigDecimal("15.0");
    }

    private void validarEntrada(BigDecimal lucroBruto, int diasCorridos){
        if (lucroBruto == null || lucroBruto.compareTo(BigDecimal.ZERO) < 0){
            throw new IllegalArgumentException("Lucro Bruto invalido");
        }

        if (diasCorridos < 1){
            throw new IllegalArgumentException("Dias Corridos devem ser no mínimo 1.");
        }
    }

    private BigDecimal calcularPorcentagem(BigDecimal valorBase, BigDecimal aliquota){
        BigDecimal calc = valorBase.multiply(aliquota);
        return calc.divide(BigDecimal.valueOf(100),2, BigDecimal.ROUND_HALF_UP);
    }
}
