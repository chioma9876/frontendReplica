const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

exports.signUp = async (req, res, next) => {
    try {

        const userDetails = {
            fullName: req.body.fullName,
            emailAddress: req.body.emailAddress,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        };

         if ( userDetails.password !== userDetails.confirmPassword) {
                     return next({
                        message: 'passswords do not match',
                        statusCode: 400
                    })
            }
        

 const emailExists = await userModel.findOne({ email: userDetails.emailAddress });
                if (emailExists) {
                    return next ({
                        message: 'email already exists', 
                        statusCode: 400
                    })
                    
                }
        

 const OTP = otpGenerator.generate(4, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
 const account = otpGenerator.generate(10, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        
                const expiresAt = new Date(Date.now() + 10 * 60000);
        
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userDetails.password, salt);
        
                const user = await userModel.create({
                            fullName: userDetails.fullName,
                            emailAddress: userDetails.emailAddress,
                            accountNumber:  account,
                            otp: OTP,
                            password: hashedPassword,
                            confirmPassword: hashedPassword,  
                            otpExpiresAt: expiresAt
                        });
    const data = {
            fullName: user.fullName,
            emailAddress: user.emailAddress,
            accountNumber: user.accountNumber,
        }
        res.status(201).json({
            message: 'User created successfully',
            data
        });
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        });
    }
}

exports.getOneUser = async (req, res, next) => {
    try {
        const user = await userModel.findOne({ id: req.params.id });
        if (!user) {
            return next({
                message: 'User not found',
                statusCode: 404
            });
        }
        res.status(200).json({
            message: 'User retrieved successfully',
            data: user
        });
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        });
    }
}

exports.getAllUsers = async(req, res, next) => {
    try {
        const users = await userModel.find();
        if(!users){
            res.status(404).json({
                message: 'No users found'
            })
        }

        res.status(200).json({
            message: 'All users fetched successfully',
            users
        })
    } catch (error) {
        next ({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.login = async (req, res, next) => {
    try {
         const { emailAddress, password } = req.body

        const user = await userModel.findOne({emailAddress})
        if (!user) {
            return next({
                message: 'User not found',
                statusCode: 404
            })
        }

        if (user.isVerified == false) {
            return next({
                message: 'Please verify your email',
                statusCode: 404
            })
        }

        
        //check if account is locked due to too many failed login attempts
                if (user.lockUntil && user.lockUntil > Date.now()) {
                    return next({
                        message: `Account locked until ${user.lockUntil}`,
                        statusCode: 403
                    })
                }
        
                 const passwordCorrect = await bcrypt.compare(password, user.password);
        
                if (!passwordCorrect) {
                    //increment login attempts and lock account if necessary
                    user.loginAttempts += 1;
                    if(user.loginAttempts >= 5) {
                        user.lockUntil = new Date(Date.now() + 30 * 60000);
                        user.loginAttempts = 0; // Reset login attempts after locking the account
                    }
                    await user.save();
                    return next({
                        message: 'Invalid credentials',
                        statusCode: 400
                    })
                }
        
                //reset login attempts on successful login
                user.loginAttempts = 0;
                await user.save();
        
       // const passwordCorrect = await bcrypt.compare(password, user.password);

        // if (!passwordCorrect) {
        //     return next({
        //         message: 'Invalid credentials',
        //         statusCode: 400
        //     })
        // }

        const token = await jwt.sign({ id: user._id, emailAddress: user.emailAddress }, process.env.JWT_SECRET, { expiresIn: '2days'});

        res.status(200).json({
            message: 'Login Successful',
            token
        })
    } catch (error) {
        next({
            message: error.message,
            statusCode: 500
        });
    }
}