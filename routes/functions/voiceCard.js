async function createVoiceCard (req, VoiceCard) {
    let voiceCard = new VoiceCard();
    voiceCard.photo = req.body.photo
    voiceCard.audio = req.body.audio
    voiceCard.qrNumber = req.body.qrNumber || 6
    voiceCard.waveColor = req.body.waveColor || "#000000"
    voiceCard.type = req.body.type
    voiceCard.user = req.decoded._id
    voiceCard.saleMethod = req.body.saleMethod ?? 'website'
    voiceCard.password = (req.decoded.role == 'admin' && req.body.password) || '000000'
    await voiceCard.save();
    return voiceCard
}

const { unload }    = require('../../utils/ftp')

async function deleteVoiceCard (voiceCard) {
    await voiceCard.remove()
    if(voiceCard.photo && voiceCard.photo.indexOf('/admin/') == -1) await unload(voiceCard.photo)
    if(voiceCard.thumbnail && voiceCard.thumbnail.indexOf('/admin/') == -1) await unload(voiceCard.thumbnail)
    await unload(voiceCard.audio)
}

module.exports = {
    createVoiceCard,
    deleteVoiceCard
}