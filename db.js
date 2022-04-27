const mongoClient = require("mongodb").MongoClient;

const uri = "mongodb+srv://admin:admin@cluster0.baf6x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const client = mongoClient.connect(uri, {useUnifiedTopology: true }, (error, connection) => {
    if (error) {
        console.log("falha na conexão");
        console.log(error);
        return;
    }
    global.connection = connection.db("aula");
    console.log("conectou!");
});

module.exports = {}; 