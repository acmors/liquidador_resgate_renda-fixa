package liquidador.liquidador_resgate_RF.integration;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class BacenApiClient {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private final RestClient restClient;

    public BacenApiClient() {
        this.restClient = RestClient
                .builder()
                .baseUrl("https://api.bcb.gov.br/dados/serie/bcdata.sgs.12")
                .build();
    }

    public List<TaxaBacenResponse> buscarTaxaCdi(LocalDate dataInicial, LocalDate dataFinal){
        validarData(dataInicial, dataFinal);

        String inicio = formatter.format(dataInicial);
        String fim = formatter.format(dataFinal);

        try{
            return restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/dados")
                            .queryParam("formato", "json")
                            .queryParam("dataInicial", inicio)
                            .queryParam("dataFinal", fim)
                            .build()
                    )
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<TaxaBacenResponse>>() {} );
        }catch(Exception e){
            throw new RuntimeException("Erro ao buscar CDI no Banco Central"+ e);
        }
    }

    private void validarData(LocalDate dataInicial, LocalDate dataFinal){
        if (dataInicial.isAfter(dataFinal)){
            throw new IllegalArgumentException("A data inicial não pode ser posterior a data final.");
        }

        if(dataInicial == null || dataFinal == null){
            throw new IllegalArgumentException("As datas não podem ser nulas.");
        }
    }
}
