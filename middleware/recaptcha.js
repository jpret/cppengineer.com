const https = require('https');

function doVerifyReCapthca (userResponse) {
    return new Promise((resolve, reject) => {
        var postData = JSON.stringify({
            secret: `${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}`,
            response: userResponse
        });

        var options = {
            hostname: 'www.google.com',
            port: 443,
            path: '/recaptcha/api/siteverify',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };

        var req = https.request(options, async (res) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
            let responseBody = '';

            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                console.log(JSON.parse(responseBody))
                resolve(JSON.parse(responseBody));
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.write(postData)
        req.end();
    });
}

module.exports = {
    verifyReCapthca: async function (userResponse) {
        // return await the response
        return await doVerifyReCapthca(userResponse);
    }
};