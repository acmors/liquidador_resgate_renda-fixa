package liquidador.liquidador_resgate_RF.service;

import liquidador.liquidador_resgate_RF.entitiy.LoteCdb;
import liquidador.liquidador_resgate_RF.repository.LoteCdbRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoteCdbService {

    private final LoteCdbRepository loteCdbRepository;

    public LoteCdbService(LoteCdbRepository loteCdbRepository) {
        this.loteCdbRepository = loteCdbRepository;
    }

    @Transactional
    public LoteCdb criarAporte(Long clienteId, BigDecimal valor, LocalDateTime dataAplicacao, BigDecimal percentualCdi) {
        validarNovoAporte(valor, dataAplicacao, percentualCdi);

        LoteCdb loteCdb = new LoteCdb();
        loteCdb.setClienteId(clienteId);
        loteCdb.setResgatado(false);
        loteCdb.setDataAplicacao(dataAplicacao);
        loteCdb.setPercentualCdi(percentualCdi);
        loteCdb.setValorAplicado(valor);
        return loteCdbRepository.save(loteCdb);
    }

    @Transactional(readOnly = true)
    public List<LoteCdb> findByResgatadoFalse(Long clienteId) {
        return loteCdbRepository.findByClienteIdAndResgatadoFalse(clienteId);
    }

    private void validarNovoAporte(BigDecimal valor, LocalDateTime dataAplicacao, BigDecimal percentualCdi){
        if(valor == null || valor.compareTo(BigDecimal.ONE) < 0){
            throw new IllegalArgumentException("O valor mínimo para aporte é R$1,00");
        }

        if(dataAplicacao == null || dataAplicacao.isAfter(LocalDateTime.now())){
            throw new IllegalArgumentException("A data do aporte não pode ser posterior a data atual ou vazia");
        }

        if(percentualCdi == null || percentualCdi.compareTo(BigDecimal.ZERO) <= 0){
            throw new IllegalArgumentException("Percentual CDI deve ser maior de 1%");
        }
    }
}
