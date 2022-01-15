var Client  = require('ftp'),
    dotenv  = require('dotenv')

dotenv.config() ;
const c = new Client();
var ready = false
const ftp = new Promise ((resolve , reject) => {
    // connect to localhost:21 as anonymous
    const ftpOptions = {
        host: '5.9.3.36',
        user: 'b612@dl.b612theory.ir',
        port: 21,
        password: process.env.FTP_SECRET
    }
    c.connect(ftpOptions);
    c.on('ready', () => {
        ready = true
        console.log('FTP Connected');
        resolve(c)
    });
    c.on('error' , err => {
        ready = false
        console.log('FTP error: ', err);
        setTimeout(() => {
            c.connect(ftpOptions)
        } , 2000)
        // reject(err)
    })
    c.on('end' , () => {
        ready = false
        console.log('FTP ended');
        c.connect(ftpOptions)
    })
})

function runFtp(type) {
    if(type = 'initiate') return ftp
    else return c
}

unload = async function (path) {
    try {
        if(!ready) await ftp()
        new Promise((resolve, reject) => {
            console.log('deleting: ', path.slice(path.indexOf('.ir/')+4));
            c.delete(path.slice(path.indexOf('.ir/')+4),(error)=> {
                reject(error)
            })
            resolve({path, result: 'deleted'})
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    runFtp,
    unload
}
