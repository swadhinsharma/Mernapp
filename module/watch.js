const mongoose = require('mongoose')

const watchSchema = new mongoose.Schema({
   name : String,
   img : String,
   price : String,
   discription : String,
})

const watchModel = mongoose.model('watchModel', watchSchema, 'watch')
module.exports = watchModel