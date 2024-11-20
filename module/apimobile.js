const mongoose = require('mongoose')

const fetSchema = new mongoose.Schema({
   name : String,
   brand : String,
   description : String,
   price : String,
   id: String,
   type: String,
   discount:  String,
   warranty: String,
   img : String


})

const fetModel = mongoose.model('fetModel', fetSchema, 'api_mobile')
module.exports = fetModel

