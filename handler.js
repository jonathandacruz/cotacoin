const fs = require("fs");
const {parse} = require("querystring");

var url = require('url');
var path = require('path');

var list = [];


var readFile = (file) => {
    let html = fs.readFileSync(__dirname + "/views/html/"+ file, "utf8");
    return html;
};

var collectData = (rq, cal) => {
    var data = '';
    rq.on('data', (chunk) => {
        data += chunk;
    });
    rq.on ('end', () => {
        let new_element = parse(data);
        list.push(new_element);
        cal(parse(data));
    });
}

module.exports = (request, response) => {
    if (request.method === 'GET') {
        
        let url_parsed = url.parse(request.url, true);
        switch (url_parsed.pathname) {
            case '/':
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(readFile("index.html").replace("@$list@ ", list.length));
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
            case '/action':
                collectData(request, (data) => {
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    console.log(data.fname);
                    response.end("Elemento: " +data.fname + " cadastrado!");
                });    
                break;
        
            default:
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.end('Not a post action!');
                break;
        }
      }
};