module.exports = class DividendoModel {

    constructor(usuarioId, codigoAcao, valor, dataCompra, dataPagamento){
        this.usuarioId = usuarioId;
        this.codigoAcao = codigoAcao;
        this.valor = valor;
        this.dataCompra = dataCompra;
        this.dataPagamento = dataPagamento;
    }
}