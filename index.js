#!/usr/bin/env babel-node

require('./helper');
let fs = require('fs').promise ; // IMPORTANT: Use the promisified version of fs
let Hapi = require('hapi');
let asyncHandlerPlugin = require('hapi-async-handler');
async function main() {
    let server = new Hapi.Server();
    server.register(asyncHandlerPlugin);
    let port = 8000;
    await server.connection({port});
    await server.start();
    console.log(`LISTENING @ http://127.0.0.1:${port}`);

    server.route([{
        method: 'GET',
        path: '/{fileName}',
        handler: {
            async: readHandler
        }
    },{
        method: 'PUT',
        path: '/{filePath}',
        handler: {
            async: createHandler
        }
    },{
        method: 'POST',
        path: '/{filePath}',
        config: {
            payload:{
                parse: false
            }
        },
        handler: {
            async: updateHandler
        }
    },{
        method: 'DELETE',
        path: '/{filePath}',
        handler: {
            async: deleteHandler
        }
    }]);
}



async function readHandler(request, reply) {
    /*curl http://127.0.0.1:8000/hello.txt*/
    let response = await fs.readFile("files/"+request.params.fileName);
    reply(response);
}
async function createHandler(request, reply) {
    /*curl -X PUT http://127.0.0.1:8000/helloCopy1.txt*/
    await fs.open("files/"+request.params.filePath, "wx");
    reply("Created\n");
}
async function updateHandler(request, reply) {
    /*curl -X POST -d @files/bar.txt http://127.0.0.1:8000/foo.txt*/
    await fs.writeFile("files/"+request.params.filePath, request.payload);
    reply("Updated\n");
}
async function deleteHandler(request, reply) {
    /*curl -X DELETE http://127.0.0.1:8000/foo.txt*/
    await fs.unlink("files/"+request.params.filePath);
    reply("Deleted\n");
}

main();
