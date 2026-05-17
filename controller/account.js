const accountModel = require('../models/accountModel');
const otpGenerator = require('otp-generator');
const walletModel = require('../models/walletModel');
const userModel = require('../models/userModel');

exports.createAccount = async (req, res, next) => {
    try {
        const {id} = req.user;
        const { accountType } = req.body;
        const accountNumber = otpGenerator.generate(10, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        const account = await accountModel.create({
            userId: id,
            accountType,
            accountNumber: accountNumber
        })
        res.status(201).json({
            message: 'Account created successfully',
            data: account
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        });
    }
}

exports.totalBalance = async (req, res, next) => {
    try {

        const { id } = req.user;

        const wallets = await walletModel.find({ userId: id });
        const user = await userModel.findById(id)

        let total = 0;

        for (const wallet of wallets) {
            total += wallet.accountBalance;
        }

        user.balance = total

        await user.save()

        res.status(200).json({
            message: 'Total funds retrieved successfully',
            totalFunds: total
        });

    } catch (error) {
        next(error);
    }
};