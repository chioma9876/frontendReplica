const transactionModel = require('../models/transactionModel');
const accountModel = require('../models/accountModel');
const userModel = require('../models/userModel');   

exports.createTransaction = async (req, res, next) => {
    try {
        const {id} = req.user;
        const { accountId, fromAccount, recepientAccountNumber, amount, memo } = req.body;

        const getBenefeciary = await userModel.findOne({ accountNumber: recepientAccountNumber });
        if (!getBenefeciary) {
            return next({
                message: 'Beneficiary not found',
                statusCode: 404
            });
        } 

        const getAccount = await accountModel.findOne({ accountType: fromAccount });
        if (!getAccount) {
            return next({
                message: 'Account not found',
                statusCode: 404
            });
        }

        const transaction = await transactionModel.create({
            userId: id,
            accountId,
            fromAccount,
            recepientName: getBenefeciary.fullName,
            recepientAccountNumber,
            amount,
            memo
        });

        res.status(201).json({
            message: 'Transaction created successfully',
            data: transaction
        });
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        });
    }
}

// exports.totalBalance =async (req, res, next) => {
//     try {
//         const { id } = req.user;
//         const user = await userModel.findById(id);
//         if(!user) {
//             return next({
//                 message: 'User does not exist',
//                 statusCode: 404
//             })
//         }
//         const totalBalance = await accountModel.find({userId: id});
//         if(!totalBalance) {
//             return next({
//                 message: 'Account does not exist',
//                 statusCode: 404
//             })
//         }

//         const total = totalBalance.reduce((acc, account) => acc + parseFloat(account.balance), 0);

//         res.status(200).json({
//             message: 'Total funds retrieved successfully',
//             totalFunds: total
//         })
//     } catch (error) {
//         next({
//                 message: error.message,
//                 statusCode: 500
//             })
//     }
// };

exports.transferFunds = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { sendersAccountNumber, recipientAccountNumber, amount, pin } = req.body;

        const sender = await userModel.findById(id);
        if(!sender) {
            return next({
                message: 'User does not exist',
                statusCode: 404
            })
        }
        const senderAccount = await accountModel.findOne({ accountNumber: sendersAccountNumber });
        if (!senderAccount) {
            return next({
                message: 'Sender account does not exist',
                statusCode: 404
            })
        }
        const recipientAccount = await accountModel.findOne({ accountNumber: recipientAccountNumber});

        if (senderAccount.lockUntil && senderAccount.lockUntil > Date.now()) {
            return next({
                message: `Account locked until ${senderAccount.lockUntil}`,
                statusCode: 403
            })
        }

        // console.log(recipientAccount);
        if (!recipientAccount) {
            return next({
                message: 'Recipient account does not exist',
                statusCode: 404
            })
        }
        if (amount > senderAccount.balance) {
            return next({
                message: 'Insufficient funds',
                statusCode: 400
            })
        }
        if (senderAccount.pin !== pin) {
            senderAccount.transferAttempts += 1;
            if (senderAccount.transferAttempts >= 5) {
                senderAccount.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
                senderAccount.transferAttempts = 0;
            }
            await senderAccount.save();
            return next({
                message: 'Invalid pin',
                statusCode: 400
            })
        }

        senderAccount.balance -= amount;
        recipientAccount.balance += amount;

        await transactionHistoryModel.create({
        accountId: senderAccount._id,
        debit: amount,
        credit: 0
        });
        await transactionHistoryModel.create({
        accountId: recipientAccount._id,
        credit: amount,
        debit: 0
        });
        await senderAccount.save();
        await recipientAccount.save();
        res.status(200).json({
            message: 'Funds transferred successfully',
            data: { senderAccountNumber: senderAccount.accountNumber, recipientAccountNumber: recipientAccount.accountNumber, recipientName: recipientAccount.accountName, amount }
        });
    } catch (error) {
        next({
                message: error.message,
                statusCode: 500
            })
    }
}