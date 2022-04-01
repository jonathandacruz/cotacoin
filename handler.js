const fs = require("fs");
const {parse} = require("querystring");

var url = require('url');
var path = require('path');
const AcaoModel = require('./src/models/acao.js');
const UsuarioModel = require("./src/models/usuario.js");
const MovimentacaoModel = require("./src/models/movimentacao.js");

var listaAcao = [];
var listaUsuario = [];
var listaMovimentacao = [];
var listaCompra = [];
var listaVenda= [];

var readFile = (file) => {
    let html = fs.readFileSync(__dirname + "/src/views/"+ file, "utf8");
    return html;
};

var criaListaAcao = (listaAcao) => {
    let listaAcaoTabela = '';

    let layout = `<tr>
                    <td>{$tipo}</td>
                    <td>{$codigoIdent}</td>
                    <td>{$fracionario}</td>
                    <td>{$setor}</td>
                  </tr>`;


    listaAcao.forEach((element) => {
        listaAcaoTabela += layout.replace("{$tipo}", element.tipo)
                                 .replace("{$codigoIdent}", element.codigoIdent)
                                 .replace("{$fracionario}", element.fracionario)
                                 .replace("{$setor}", element.setor)
    });

    return listaAcaoTabela;
}

var criaListaUsuario = (listaUsuario) => {
    let listaUsuarioTabela = '';

    let layout = `<tr>
                    <td>{$codigo}</td>
                    <td>{$nome}</td>
                    <td>{$cpf}</td>
                  </tr>`;


    listaUsuario.forEach((element) => {
        listaUsuarioTabela += layout.replace("{$codigo}", element.codigo)
                                    .replace("{$nome}", element.nome)
                                    .replace("{$cpf}", element.cpf)
    });

    return listaUsuarioTabela;
}

var criaListaCompra = (listaCompra) => {
    let listaCompraTabela = '';

    let layout = `<tr>
                    <td>{$usuarioId}</td>
                    <td>{$codigoAcao}</td>
                    <td>{$tipo}</td>
                    <td>{$quantidade}</td>
                    <td>{$cotacao}</td>
                  </tr>`;


    listaCompra.forEach((element) => {
        listaCompraTabela += layout.replace("{$usuarioId}", element.usuarioId)
                                   .replace("{$codigoAcao}", element.codigoAcao)
                                   .replace("{$tipo}", element.tipo)
                                   .replace("{$quantidade}", element.quantidade)
                                   .replace("{$cotacao}", element.cotacao)
    });

    return listaCompraTabela;
}

var criaListaVenda = (listaVenda) => {
    let listaVendaTabela = '';

    let layout = `<tr>
                    <td>{$usuarioId}</td>
                    <td>{$codigoAcao}</td>
                    <td>{$tipo}</td>
                    <td>{$quantidade}</td>
                    <td>{$cotacao}</td>
                  </tr>`;


    listaVenda.forEach((element) => {
        listaVendaTabela += layout.replace("{$usuarioId}", element.usuarioId)
                                  .replace("{$codigoAcao}", element.codigoAcao)
                                  .replace("{$tipo}", element.tipo)
                                  .replace("{$quantidade}", element.quantidade)
                                  .replace("{$cotacao}", element.cotacao)
    });

    return listaVendaTabela;
}

var collectData = (rq, cal) => {
    var data = '';
    rq.on('data', (chunk) => {
        data += chunk;
    });
    rq.on ('end', () => {
        var parseData = parse(data);
        var r = rq.url;

        if (r == '/new_acao') {
            var nova_acao;

            nova_acao = new AcaoModel(
                parseData['tipo'],
                parseData['codigoIdent'],
                parseData['fracionario'],
                parseData['setor']
            );
            listaAcao.push(nova_acao);           
        }

        if(r == '/new_usuario'){
            var novo_usuario;

            novo_usuario = new UsuarioModel(
                parseData['codigo'],
                parseData['nome'],
                parseData['cpf']
            );
            listaUsuario.push(novo_usuario);  
        }

        if(r == '/new_movimentacao'){
            var nova_movimentacao;

            if(parseData['tipo'] === 0){
                nova_movimentacao = new MovimentacaoModel(
                    parseData['usuarioId'],
                    parseData['codigoAcao'],
                    parseData['tipo'],
                    parseData['quantidade'],
                    parseData['cotacao']
                );

                listaCompra.push(nova_movimentacao);
            }

            if(parseData['tipo'] === 1){
                nova_movimentacao = new MovimentacaoModel(
                    parseData['usuarioId'],
                    parseData['codigoAcao'],
                    parseData['tipo'],
                    parseData['quantidade'],
                    parseData['cotacao']
                );

                listaVenda.push(nova_movimentacao);
            }
            
        }

        cal(parse(data));
    });
}

module.exports = (request, response) => {
    if (request.method === 'GET') {
        
        let url_parsed = url.parse(request.url, true);
        switch (url_parsed.pathname) {
            case '/':
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(readFile("index.html"));
                break;

            case '/acoes':
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(readFile("acoes.html").replace("{$listaAcaoTabela}", criaListaAcao(listaAcao)));
                break;
            case '/usuarios':
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(readFile("usuarios.html").replace("{$listaUsuarioTabela}", criaListaUsuario(listaUsuario)));
                break;
            case '/movimentacao':
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(readFile("movimentacao.html"));
                break;
            case '/element':
                response.writeHead(200, {'Content-Type': 'text/plain'});
                response.end("Elemento: " +url_parsed.query.id + " acessado!");

                break;
            default:
                break;
        }
      } else if (request.method === 'POST') {

        switch (request.url.trim()) {
            case '/new_acao':
                collectData(request, (data) => {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.end(readFile("/new_acao.html"));
                });    
                break;
        
            case '/new_usuario':
                collectData(request, (data) => {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.end(readFile("new_usuario.html").replace("{$nome}", data.nome));
                });    
                break;

            case '/new_movimentacao':
                collectData(request, (data) => {
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.end("Elemento: " + data.fname + " cadastrado!");
                });    
                break;
            default:
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.end('Not a post action!');
                break;
        }
      }
};