package liquidador.liquidador_resgate_RF.repository;

import liquidador.liquidador_resgate_RF.entitiy.LoteCdb;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoteCdbRepository extends JpaRepository<LoteCdb, Long> {

    List<LoteCdb> findByResgatadoFalse();
}
