const jwt = require('jsonwebtoken')

const userModel = require('../models/userModel');

exports.verifyLogin = async(req,res,next)=>{
   try { //const token = req.headers.authorization.split(' ')[1]
     const authHeader = req.headers && req.headers.authorization
     if(!authHeader){
         return next({
             message: 'auth required',
             statusCode: 400
         })
     }

     const parts = authHeader.split(' ')
     if(parts.length !== 2){
         return next({
             message: 'Invalid authorization format',
             statusCode: 400
         })
     }

     const token = parts[1]

     const result = await new Promise((resolve, reject) => {
         jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
             if(error) return reject(error)
             resolve(decoded)
         })
     })

     req.user = result
     next()
    
   } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
        return next({
            message: 'session expired, login to continue',
            statusCode: 400
        })
    }
    next({
        message: error.message,
        statusCode: 500
    })
   }
};


// exports.checkAdmin = async(req,res,next)=>{
//     const token = req.headers.authorization.split(' ')[1]

//     if(!token){
//         return next({
//             message: 'auth required',
//             statusCode: 400
//         })
//     }

//      await jwt.verify(token, process.env.JWT_SECRET, async(error, result)=>{
//         if(error){
//             return next({
//                 message: error.message,
//                 statusCode: 400
//             })
//         }
//         const findUser = await userModel.findById(result.id)
//         if(!findUser){
//             return next({
//                 message: 'user not found',
//                 statusCode: 404
//             })
//         }

//         const role = findUser.role

//         if (role !== 'admin'){
//             return next({
//                 message: 'unauthorized access',
//                 statusCode: 403
//             })
//         }
//         req.user = result

//         next()
        
//     })

// };