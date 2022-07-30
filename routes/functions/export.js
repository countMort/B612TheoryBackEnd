const fs = require('fs/promises'),
  JSZip = require('jszip'),
  tempFolderPath = './routes/temp files'

async function createZip(filePathsArray, exportPath) {
  const zip = new JSZip()
  for (let index = 0; index < filePathsArray.length; index++) {
    const path = filePathsArray[index]
    const file = await fs.readFile(path)
    zip.file(`${index}.png`, file)
  }
  const createdZip = await zip.generateAsync({ type: 'uint8array' })
  await fs.writeFile(exportPath, createdZip)
  return exportPath
}

module.exports = {
  createZip,
}
