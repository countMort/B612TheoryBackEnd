    const fs    = require('fs/promises'),
    https       = require('https')

function download (uri,filePath, callback) {
    return new Promise ((resolve, reject) => {
        let body = ''
        console.log('downloading: ', uri);
        https.request(uri)
        .on('response', function(res) {

            res.setEncoding('binary')
            res
            .on('error', function(err) {
                console.log(err);
                reject(callback(err))
            })
            .on('data', function(chunk) {
                body += chunk
            })
            .on('end', async () => {
                // What about Windows?!
                await fs.writeFile(filePath, body, 'binary')
                console.log('written');
                body = ''
                resolve(body, filePath)
            })
        })
        .on('error', function(err) {
            console.log(err);
            reject(callback(err))
        })
        .end();
    })
}

async function unlink(pathArray) {
    for (let index = 0; index < pathArray.length; index++) {
        const path = pathArray[index];
        await fs.unlink(path)
    }
}

module.exports = {
    download,
    unlink
}