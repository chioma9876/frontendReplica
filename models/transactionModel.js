const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema ({
    userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
    accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'accounts',
            required: true
        },
    fromAccount: {
        type: String,
        enum: ['savings', 'current'],
        required: true
    },
    recepientName: {
        type: String,
        required: true
    },
    recepientAccountNumber: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    memo: {
        type: String,
        required: false
    },
}, {timestamps: true});

const transactionModel = mongoose.model('transactions', transactionSchema);

module.exports = transactionModel;