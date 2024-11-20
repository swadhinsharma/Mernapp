const mongoose = require('mongoose')

const slideSchema = new mongoose.Schema({
   id : String,
   image_url : String,
   title : String,
   discription : String,
   cta_text : String,
   cta_url : String
})

const slideModel = mongoose.model('slideModel', slideSchema, 'slider')
module.exports = slideModel