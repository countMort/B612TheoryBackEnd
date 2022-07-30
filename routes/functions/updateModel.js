function updateModel(model, body, props) {
  props.forEach((prop) => {
    if (Object.prototype.hasOwnProperty.call(body, prop)) {
      const el = body[prop]
      model[prop] = typeof el === 'string' ? el.trim() : el
    }
  })
  return model
}
module.exports = {
  updateModel,
}
