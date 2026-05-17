const router = require('express').Router();
const { createAccount, totalBalance } = require('../controller/account');
const { createTransaction, transferFunds } = require('../controller/transaction');
const { signUp, getOneUser, login } = require('../controller/User');
const rateLimiter = require('../middleware/rateLimiter');
const { verifyLogin } = require('../middleware/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: User's full name
 *           example: John Doe
 *         email:
 *           type: string
 *           description: User email address
 *           example: example@example.com
 *         password:
 *           type: string
 *           description: User password
 *           example: password123
 *         confirmPassword:
 *           type: string
 *           description: Confirm user password
 *           example: password123
 */


/**
 * @swagger
 * /api/v1/user/signUp:
 *   post:
 *     tags:
 *       - User
 *     summary: Sign up a new user
 *     description: Sign up a new user with name, email,password and confirm password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: User email address
 *                 example: example@example.com
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: password123
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm user password
 *                 example: password123
 *     responses:
 *       201:
 *         description: User signed up successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: User signed up successfully
 */
router.post('/signUp', signUp)

router.get('/getOneUser/:id', getOneUser)

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     tags:
 *       - User
 *     summary: login a user
 *     description: Login an existing user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email address
 *                 example: example@example.com
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: password123
 *     responses:
 *       201:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: User logged in successfully
 */
router.post('/login',rateLimiter , login)

/**
 * @swagger
 * /api/v1/user/createAccount:
 *   post:
 *     tags:
 *       - User
 *     summary: Create a new account for a user
 *     description: Create a new account for a user with account type and account number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountType:
 *                 type: string
 *                 description: Type of the account
 *                 example: savings
 *               accountNumber:
 *                 type: number
 *                 description: Account number
 *                 example: 1234567890
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account created successfully
 */
router.post('/createAccount', verifyLogin, createAccount)

/**
 * @swagger
 * /api/v1/user/totalBalance/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get total balance of a user
 *     description: Get total balance of a user by summing up the balances of all their accounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Total balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBalance:
 *                   type: number
 *                   description: The total balance of the user
 *                   example: 1000.00
 */
router.get('/totalBalance/:id', verifyLogin, totalBalance)

/** 
 * @swagger
 * /api/v1/user/createTransaction:
 *   post:
 *     tags:
 *       - User
 *     summary: Create a new transaction for a user
 *     description: Create a new transaction for a user with transaction details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Transaction amount
 *                 example: 100.00
 *               description:
 *                 type: string
 *                 description: Transaction description
 *                 example: Deposit
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transaction created successfully
 */
router.post('/createTransaction',verifyLogin, createTransaction )

/**
 * @swagger
 * /api/v1/user/transferFunds/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Transfer funds from one account to another
 *     description: Transfer funds from one account to another by providing sender's account number, recipient's account number, amount, and pin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sendersAccountNumber:
 *                 type: string
 *                 description: Sender's account number
 *                 example: 1234567890
 *               recipientAccountNumber:
 *                 type: string
 *                 description: Recipient's account number
 *                 example: 0987654321
 *               amount:
 *                 type: number
 *                 description: Transfer amount
 *                 example: 100.00
 *               pin:
 *                 type: string
 *                 description: User's account pin
 *                 example: 1234
 *     responses:
 *       200:
 *         description: Funds transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Funds transferred successfully
 */
router.get('/transferFunds/:id', verifyLogin, transferFunds)

module.exports = router;