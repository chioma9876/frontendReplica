const mongoose = require('mongoose')

const transferSchema = new mongoose.Schema({
    userId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users',
        require: true
    },
    walletId:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'wallets',
        require: true
    },
    fromAccount: {
        type: String,
        enum: ['savings', 'current'],
        require: true
    },
    recipientFullName: {
        type: String,
        require: true
    },
    recipientAccountNumber: {
        type: Number,
        require: true
    },
    amount: {
        type: Number,
        require: true
    },
    memo: {
        type: String
    }
}, {timestamps: true})

const transferModel = mongoose.model('transfers', transferSchema)

module.exports = transferModel