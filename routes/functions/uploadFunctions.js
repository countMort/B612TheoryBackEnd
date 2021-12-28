const   {runFtp}    = require('../../utils/ftp'),
        moment      = require('jalali-moment'),
        formidable  = require('formidable'),
        baseURL     = 'https://dl.b612theory.ir',
        sharp       = require('sharp'),
        amrToMp3    = require('amrToMp3'),
        fs          = require('fs/promises')


let clientFtp
runFtp('initiate')
.then(res => clientFtp = res)

function giveNewPath(type) {
    const date    = new Date(),
    time    = moment(date).local('fa').format('hh-mm-ss')
    var newPath;
    if (type == 'admin') {
        newPath = 'admin'
    } else {
        newPath = moment(date).local('fa').format('jYYYY/jMM/jDD')
    }
    return {time, newPath}
}

function parseForm(req) {
    return new Promise((resolve, reject) => {
        let form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.log('in parsing',err);
                reject(err)
            }
            resolve({files, fields})
        })
    })
}

function mkdir(path) {
    return new Promise((resolve, reject) => {
        // true makes it recursive (mkdir -t)
        clientFtp.mkdir(path, true, (err) => {
            if(err) {
                console.log(err);
                reject(err)
            }
            resolve(true)
        })
    })
}

function putFile(oldpath, newPath) {
    return new Promise((resolve, reject) => {
        clientFtp.put(oldpath, newPath, (err) => {
            if(err) {
                console.log(`in putting file for ${newPath}`,err);
                reject(err)
            }
            // clientFtp.end()
            const url = baseURL + '/' + newPath
            resolve(url)
            console.log(`uploaded: ${url}`);
        })
    })
}

async function amrToMp3Function(file, oldpath) {
    const newFile = await fs.readFile(oldpath)
    await fs.writeFile(oldpath + '.amr', newFile)
    oldpath = oldpath + '.amr'
    return oldpath = await amrToMp3(oldpath,'./', 'amrToMp3')
}

upload = async function (type, req) {
    return new Promise(async (resolve, reject) => {
        try {
            // clientFtp.list(function(err, list) {
            //     if (err) res.status(500).json({
            //     message: err.message || err,
            //     success: false
            // });
            //     console.dir(list);
            //     console.log(req);
            //     clientFtp.end();
            // });
            const {time, newPath} = giveNewPath()
            await mkdir(newPath)
            const {files} = await parseForm(req)

            if (!files.file) return reject({message: 'فایلی ارسال نشده است.'})

            let oldpath = files.file.path;

            const userId = (req.decoded && req.decoded._id) || req.ip
            let newFilePath = type == 'admin'
            ? newPath + `/${files.file.name}` :
            newPath + `/${userId}-${time}-${files.file.name}`

            if (['audio/amr'].includes(files.file.type)) {
                oldpath = await amrToMp3Function(files.file, oldpath)
                newFilePath = newFilePath.slice(0, newFilePath.length - 3) + 'mp3'
            }
            const url = await putFile(oldpath, newFilePath)
            let response = {
                success: true,
                message: 'با موفقیت آپلود شد',
                info: {
                    url,
                    name: files.file.name,
                    size: files.file.size
                }
            }
            if (['image/jpeg', 'image/bmp', 'image/png'].includes(files.file.type)) {
                await sharp(oldpath).resize({width: 80, height: 80, fit: 'inside'}).png().toFile('thumbnail.png')
                let newThumbnailPath = type == 'admin' ?
                newPath + `/thumbnail-${files.file.name}` :
                newPath + `/thumbnail-${req.decoded._id}-${time}-${files.file.name}`
                const thumbnail = await putFile('thumbnail.png', newThumbnailPath)
                response.info.thumbnail = thumbnail
            }
            resolve(response)
            await fs.unlink(oldpath)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    giveNewPath,
    parseForm,
    mkdir,
    putFile,
    amrToMp3Function,
    upload
}