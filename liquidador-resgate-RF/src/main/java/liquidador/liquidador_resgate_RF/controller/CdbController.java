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

    @GetMapping("/carteira/{clienteId}")
    public List<ResumoLoteDTO> listarCarteira(@PathVariable Long clienteId){
        return resgateCdbService.listarCarteiraDetalhada(clienteId);
    }

    @GetMapping("/simular/{clienteId}")
    public ResultadoSimulacaoDTO simularResgate(@RequestParam BigDecimal valor, @PathVariable Long clienteId) {
        return resgateCdbService.simularResgate(valor, clienteId);
    }

    @PostMapping("/aportes/{clienteId}")
    public LoteCdb criarAporte(
            @RequestParam BigDecimal valor,
            @RequestParam int diasAtras,
            @RequestParam(defaultValue = "110") BigDecimal percentualCdi,
            @PathVariable Long clienteId
    ) {
        LocalDateTime dataRetroativa = LocalDateTime.now().minusDays(diasAtras);
        return loteCdbService.criarAporte(clienteId,valor, dataRetroativa, percentualCdi);
    }

}
