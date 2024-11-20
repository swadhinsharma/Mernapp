const mongoose = require('mongoose')

const registerSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String,
    cartData: {
        type: Object,
        default: {}
    }
})

const registerModel = mongoose.model("register", registerSchema)
module.exports = registerModel