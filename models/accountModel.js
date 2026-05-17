const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema ({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    accountType: {
        type: String,
        enum: ['savings', 'current'],
        required: true
    },
    accountNumber: {
        type: Number,
        required: true
    },
}, {timestamps: true});

const accountModel = mongoose.model('accounts', accountSchema);

module.exports = accountModel;