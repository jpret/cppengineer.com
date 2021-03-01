/* Or use this example tcp client written in node.js.  (Originated with 
example code from 
http://www.hacksparrow.com/tcp-socket-programming-in-node-js.html.) */

function doConnectToSocketAndWrite(port, payload) {
    return new Promise((resolve, reject) => {

        var net = require('net');

        var client = new net.Socket();
        client.connect(port, '127.0.0.1', function () {
            console.log('Connected');
            client.write(payload);
            client.end();
        });

        let responseBody = '';

        client.on('data', function (data) {
            responseBody += data;
        });

        client.on('end', function (data) {
            console.log('Received: ' + responseBody);
            resolve(responseBody);
        });

        client.on('close', function (err) {
            console.log('Connection closed');
            resolve(responseBody);
        });

        client.on('error', function (err) {
            console.log(err)
            client.destroy(); // kill client after server's response
            reject(err);
        });
    });
}

module.exports = {
    connectToSocketAndWrite: async function (port, payload) {
        // return await the response
        return await doConnectToSocketAndWrite(port, payload);
    }
};