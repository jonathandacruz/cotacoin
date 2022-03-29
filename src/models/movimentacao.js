module.exports = class MovimentacaoModel {

    constructor(usuarioId, codigoAcao, tipo, quantidade, cotacao){
        this.usuarioId = usuarioId;
        this.codigoAcao = codigoAcao;
        this.tipo = tipo;
        this.quantidade = quantidade;
        this.cotacao = cotacao;
    }
}