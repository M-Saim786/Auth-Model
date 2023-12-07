const mongoose = require("mongoose")

const userModel = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    newPsassword: {
        type: String,
        // required: true
    },
    isVerify: {
        type: Boolean,
        default: false
        // required:true
    },
    otp: {
        type: Number,
        required: true

    }
    // password: {
    //     type: String,
    //     required: true
    // },

})


module.exports = mongoose.model("NodeUser", userModel)