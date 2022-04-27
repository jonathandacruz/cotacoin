const fs = require("fs");
const {parse} = require("querystring");

const db = require("./db");

var url = require('url');
var path = require('path');
const AcaoModel = require('./src/models/acao.js');
const UsuarioModel = require("./src/models/usuario.js");
const MovimentacaoModel = require("./src/models/movimentacao.js");
const DividendoModel = require("./src/models/dividendos");

var listaAcao = [];
var listaUsuario = [];
var listaMovimentacao = [];
var listaCompra = [];
var listaVenda= [];

var readFile = (file) => {
    let html = fs.readFileSync(__dirname + "/src/views/"+ file, "utf8");
    return html;
};

var readCss = (file) => {
    let html = fs.readFileSync(__dirname + "/src/css/"+ file );
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

var criaSelectAcao = (listaAcao) => {
    let listaAcaoTabela = '';

    let layout = ` <option value="{$codigoIdent}">{$nome}</option> `;


    listaAcao.forEach((element) => {
        listaAcaoTabela += layout.replace("{$codigoIdent}", element.codigoIdent)
                                 .replace("{$nome}", element.codigoIdent)
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

var criaListaUsuarioSelect = (listaUsuario) => {
    let listaUsuarioTabela = '';

    let layout = ` <option value="{$codigo}">{$nome}</option> `;

    listaUsuario.forEach((element) => {
        listaUsuarioTabela += layout.replace("{$codigo}", element.codigo)
                                    .replace("{$nome}", element.nome)
                                   
    });

    return listaUsuarioTabela;
}


var criaListaCompra = (listaCompra) => {
    let listaCompraTabela = '';

    

    let layout = `<tr>
                    <td>{$codigoAcao}</td>
                    <td>{$tipo}</td>
                    <td>{$quantidade}</td>
                    <td>{$cotacao}</td>
                  </tr>`;


    listaCompra.forEach((element) => {
         
        listaCompraTabela += layout.replace("{$codigoAcao}", element.codigoAcao)
                                   .replace("{$tipo}", element.tipo)
                                   .replace("{$quantidade}", element.quantidade)
                                   .replace("{$cotacao}", element.cotacao)
    });

    return listaCompraTabela;
}

var criaListaVenda = (listaVenda) => {
    let listaVendaTabela = '';

    let layout = `<tr>
                    <td>{$codigoAcao}</td>
                    <td>{$tipo}</td>
                    <td>{$quantidade}</td>
                    <td>{$cotacao}</td>
                    
                  </tr>`;


    listaVenda.forEach((element) => {

        listaVendaTabela += layout.replace("{$codigoAcao}", element.codigoAcao)
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
            global.connection.collection("acoes").insertOne(nova_acao);
            //listaAcao.push(nova_acao);           
        }

        if(r == '/new_usuario'){
            var novo_usuario;

            novo_usuario = new UsuarioModel(
                parseData['codigo'],
                parseData['nome'],
                parseData['cpf']
            );
            global.connection.collection("usuarios").insertOne(novo_usuario);
            //listaUsuario.push(novo_usuario);  
        }

        if(r == '/new_dividendo'){
            var novo_dividendo;

            novo_dividendo = new DividendoModel(
                parseData['usuarioId'],
                parseData['codigoAcao'],
                parseData['valor'],
                parseData['dataCompra'],
                parseData['dataPagamento']
            );
            global.connection.collection("dividendos").insertOne(novo_dividendo);
            //listaUsuario.push(novo_usuario);  
        }

        if(r == '/new_movimentacao'){
            var nova_movimentacao;
            var qtde = 0;
            
            if (parseData['tipo'] == 'lote'){
                qtde = parseData['quantidade'] * 100;
            } else {
                qtde = parseData['quantidade'];
            }
            if(parseData['typeOrder'] === 'compra'){
                nova_movimentacao = new MovimentacaoModel(
                    parseData['usuarioId'],
                    parseData['codigoAcao'],
                    parseData['typeOrder'],
                    qtde,
                    parseData['cotacao']
                );

                global.connection.collection("movimentacao").insertOne(nova_movimentacao);
            }

            if(parseData['typeOrder'] === 'venda'){
                nova_movimentacao = new MovimentacaoModel(
                    parseData['usuarioId'],
                    parseData['codigoAcao'],
                    parseData['typeOrder'],
                    qtde,
                    parseData['cotacao']
                );

                global.connection.collection("movimentacao").insertOne(nova_movimentacao);
            }
            
        }

        cal(parse(data));
    });
}

var loadDataAcoes = (response) => {
    let list = [];
     global.connection.collection("acoes").find({}).toArray((err, docs) => {
        if (err) {
            console.log("Deu merda!");
            return;
        }
        console.log(docs);

        docs.forEach(element => {
            list.push(element);  
        });


        response.end(readFile("acoes.html").replace("{$listaAcaoTabela}", criaListaAcao(list)));
    });
}

var loadDataUsuarios = (response) => {
    let list = [];
     global.connection.collection("usuarios").find({}).toArray((err, docs) => {
        if (err) {
            console.log("Deu merda!");
            return;
        }
        console.log(docs);

        docs.forEach(element => {
            list.push(element);  
        });


        response.end(readFile("usuarios.html").replace("{$listaUsuarioTabela}", criaListaUsuario(list)));
    });
}

var loadDataMovimentacao = (response) => {
    let listaUsuario = [];
    let listaAcao = [];
    global.connection.collection("usuarios").find({}).toArray((err, docs) => {
        if (err) {
            console.log("Deu merda!");
            return;
        }
        console.log(docs);

        docs.forEach(element => {
            listaUsuario.push(element);  
        });

        
        global.connection.collection("acoes").find({}).toArray((err, docs) => {
            if (err) {
                console.log("Deu merda!");
                return;
            }
            console.log(docs);
    
            docs.forEach(element => {
                listaAcao.push(element);  
            });

        response.end(readFile("movimentacao.html").replace("{$listaUsuarioSelect}", criaListaUsuarioSelect(listaUsuario))
            .replace("{$listaAcaoSelect}", criaSelectAcao(listaAcao)));
        });

        
    });
}

var loadDataOrdens = (response) => {
    let list = [];
     global.connection.collection("movimentacao").find({}).toArray((err, docs) => {
        if (err) {
            console.log("Deu merda!");
            return;
        }
        console.log(docs);

        docs.forEach(element => {
            list.push(element);  
        });


        response.end(readFile("ordens.html").replace("{$listaMovimentoCompra}", criaListaCompra(list))
                                            .replace("{$listaMovimentoVenda}", criaListaVenda(list)));
                    
    });
}

var loadDataDividendo = (response) => {
    let listaUsuario = [];
    let listaAcao = [];
    global.connection.collection("usuarios").find({}).toArray((err, docs) => {
        if (err) {
            console.log("Deu merda!");
            return;
        }
        console.log(docs);

        docs.forEach(element => {
            listaUsuario.push(element);  
        });

        
        global.connection.collection("acoes").find({}).toArray((err, docs) => {
            if (err) {
                console.log("Deu merda!");
                return;
            }
            console.log(docs);
    
            docs.forEach(element => {
                listaAcao.push(element);  
            });

        response.end(readFile("dividendos.html").replace("{$listaUsuarioSelect}", criaListaUsuarioSelect(listaUsuario))
            .replace("{$listaAcaoSelect}", criaSelectAcao(listaAcao)));
        });

        
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
                loadDataAcoes(response);
                //response.end(readFile("acoes.html").replace("{$listaAcaoTabela}", criaListaAcao(listaAcao)));
                break;
            case '/usuarios':
                response.writeHead(200, {'Content-Type': 'text/html'});
                loadDataUsuarios(response);
                //response.end(readFile("usuarios.html").replace("{$listaUsuarioTabela}", criaListaUsuario(listaUsuario)));
                break;
            case '/movimentacao':
                response.writeHead(200, {'Content-Type': 'text/html'});
                loadDataMovimentacao(response);
                //response.end(readFile("movimentacao.html").replace("{$listaUsuarioSelect}", criaListaUsuarioSelect(listaUsuario)).replace("{$listaAcaoSelect}", criaSelectAcao(listaAcao)));
                break;
            case '/ordens':
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    loadDataOrdens(response);
                    //response.end(readFile("ordens.html").replace("{$listaMovimentoCompra}", criaListaCompra(listaCompra))
                    //                                    .replace("{$listaMovimentoVenda}", criaListaVenda(listaVenda)));
                    break;
            case '/dividendos':
                response.writeHead(200, {'Content-Type': 'text/html'});
                loadDataDividendo(response);
                break;
            case '/element':
                response.writeHead(200, {'Content-Type': 'text/plain'});
                response.end("Elemento: " +url_parsed.query.id + " acessado!");

                break;
            default:
                break;
        }
      }
       
      else if (request.method === 'POST') {

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
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.end(readFile("new_movimentacao.html").replace("{tipoOrdem}", data.typeOrder ));
                });    
                break;
            case '/new_dividendo':
                collectData(request, (data) => {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.end(readFile("new_dividendo.html").replace("{tipoOrdem}", data.typeOrder ));
                });    
                break;
            default:
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.end('Not a post action!');
                break;
        }
      }
};