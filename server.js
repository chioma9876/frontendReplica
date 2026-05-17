const express = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 5252;
const userRouter = require('./routes/userRouter')
const rateLimiter = require('./middleware/rateLimiter');
const swaggerUI = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc')

const app = express()
app.use(express.json())
app.use('/api/v1/user', userRouter)


const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Frontend Replication',
    version: '2.0.0',
    description:
      'This is a REST API application made with Express. It retrieves data from JSONPlaceholder.',
    license: {
      name: 'Official URL',
      url: 'https://google.com',
    },
    contact: {
      name: 'JSONPlaceholder',
      url: 'https://jsonplaceholder.typicode.com',
    },
  },
  servers: [
    {
      url: 'https://frontendreplica.onrender.com',
      description: 'Development server',
    },
  ],
  security: [
    {
        bearerAuth: []
    }
  ],
  components: {
    securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
        }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api/v1/documentations', swaggerUI.serve, swaggerUI.setup(swaggerSpec))


app.use((error, req, res, next)=> {
    console.log(error);
    res.status(error.statusCode).json({
        message: error.message,
        status: error.statusCode
    })
})

const mongoose = require('mongoose');
app.use((req, res, next) => {
    res.status(500).json({
        message: `route ${req.originalUrl} and ${req.method} not found`
    })
})


mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, ()=> {
        console.log(`Server listening to Port: ${PORT}`);
    })
    
})
.catch((error) => {
    console.log(error.message);
    
})


