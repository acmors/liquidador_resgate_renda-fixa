package liquidador.liquidador_resgate_RF.integration;

public class TaxaBacenResponse{

    private String data;
    private String valor;

    public TaxaBacenResponse(){}

    public TaxaBacenResponse(String data, String valor) {
        this.data = data;
        this.valor = valor;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getValor() {
        return valor;
    }

    public void setValor(String valor) {
        this.valor = valor;
    }
}
