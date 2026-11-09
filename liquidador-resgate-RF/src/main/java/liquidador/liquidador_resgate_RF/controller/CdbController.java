package liquidador.liquidador_resgate_RF.controller;

import liquidador.liquidador_resgate_RF.dto.ResultadoSimulacaoDTO;
import liquidador.liquidador_resgate_RF.dto.ResumoLoteDTO;
import liquidador.liquidador_resgate_RF.entitiy.LoteCdb;
import liquidador.liquidador_resgate_RF.service.LoteCdbService;
import liquidador.liquidador_resgate_RF.service.ResgateCdbService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/cdb")
@CrossOrigin(origins = "*")
public class CdbController {

    private final LoteCdbService loteCdbService;
    private final ResgateCdbService resgateCdbService;

    public CdbController(LoteCdbService loteCdbService, ResgateCdbService resgateCdbService) {
        this.loteCdbService = loteCdbService;
        this.resgateCdbService = resgateCdbService;
    }

    @GetMapping("/carteira")
    public List<ResumoLoteDTO> listarCarteira(){
        return resgateCdbService.listarCarteiraDetalhada();
    }

    @GetMapping("/simular")
    public ResultadoSimulacaoDTO simularResgate(@RequestParam BigDecimal valor) {
        return resgateCdbService.simularResgate(valor);
    }

    @PostMapping("/aportes")
    public LoteCdb criarAporte(
            @RequestParam BigDecimal valor,
            @RequestParam int diasAtras,
            @RequestParam(defaultValue = "110") BigDecimal percentualCdi
    ) {
        LocalDateTime dataRetroativa = LocalDateTime.now().minusDays(diasAtras);
        return loteCdbService.criarAporte(valor, dataRetroativa, percentualCdi);
    }

    @PostMapping("/popular-simulacao")
    public List<ResumoLoteDTO> popularSimulacao() {
        loteCdbService.criarAporte(new BigDecimal("1000.00"), LocalDateTime.now().minusDays(750), new BigDecimal("110"));
        loteCdbService.criarAporte(new BigDecimal("1500.00"), LocalDateTime.now().minusDays(200), new BigDecimal("110"));
        loteCdbService.criarAporte(new BigDecimal("2000.00"), LocalDateTime.now().minusDays(12), new BigDecimal("110"));
        return resgateCdbService.listarCarteiraDetalhada();
    }
}
