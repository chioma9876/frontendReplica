const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users'
    },
     accountType: {
        type: String,
        enum: ['savings', 'current'],
        default: 'savings',
        require: true
    },
    accountName: {
        type: String,
        require: true
    },
    accountNumber: {
       type: String,
       require: true
   },
    accountBalance: {
        type: Number,
        default: 20000
    }
}, {timestamps: true})

const walletModel = mongoose.model('wallets', walletSchema)

module.exports = walletModel