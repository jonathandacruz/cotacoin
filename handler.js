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
                    <td>{$nome}</td>
                    <td>{$nome}</td>
                  </tr>`;


    listaAcao.forEach((element) => {
        listaAcaoTabela += layout.replace("", element.tipo)
                                 .replace("", element.codigoIdent)
                                 .replace("", element.fracionario)
                                 .replace("", element.setor)
    });
}

var criaListaUsuario = (listaUsuario) => {
    let listaUsuarioTabela = '';

    let layout = `<tr>
                    <td>{$nome}</td>
                    <td>{$nome}</td>
                  </tr>`;


    listaUsuario.forEach((element) => {
        listaUsuarioTabela += layout.replace("", element.codigo)
                                    .replace("", element.nome)
                                    .replace("", element.cpf)
    });
}

var criaListaCompra = (listaCompra) => {
    let listaCompraTabela = '';

    let layout = `<tr>
                    <td>{$nome}</td>
                    <td>{$nome}</td>
                  </tr>`;


    listaCompra.forEach((element) => {
        listaCompraTabela += layout.replace("", element.usuarioId)
                                   .replace("", element.codigoAcao)
                                   .replace("", element.tipo)
                                   .replace("", element.quantidade)
                                   .replace("", element.cotacao)
    });
}

var criaListaVenda = (listaVenda) => {
    let listaVendaTabela = '';

    let layout = `<tr>
                    <td>{$nome}</td>
                    <td>{$nome}</td>
                  </tr>`;


    listaVenda.forEach((element) => {
        listaVendaTabela += layout.replace("", element.usuarioId)
                                  .replace("", element.codigoAcao)
                                  .replace("", element.tipo)
                                  .replace("", element.quantidade)
                                  .replace("", element.cotacao)
    });
}

var collectData = (rq, cal) => {
    var data = '';
    rq.on('data', (chunk) => {
        data += chunk;
    });
    rq.on ('end', () => {
        var parseData = parse(data);
        var r = url.parse(rq.url, true);

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

        console.log(listaAcao);

        if(r == '/new_usuario'){
            var novo_usuario;

            novo_usuario = new UsuarioModel(
                parseData['codigo'],
                parseData['nome'],
                parseData['cpf']
            );

            listaUsuario.push(novo_usuario);  
        }

        console.log(listaUsuario);

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
                response.end(readFile("acoes.html"));
                break;
            case '/usuarios':
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(readFile("usuarios.html"));
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
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    console.log(data.fname);
                    response.end("Elemento: " + data.fname + " cadastrado!");
                });    
                break;
        
            case '/new_usuario':
                collectData(request, (data) => {
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    console.log(data);
                    response.end("Elemento: " + data.fname + " cadastrado!");
                });    
                break;

            case '/new_movimentacao':
                collectData(request, (data) => {
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    console.log(data.fname);
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