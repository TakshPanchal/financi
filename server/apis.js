//dependencies
const db = require('./queries')
const express = require('express')

const { request } = require('http')
const { countReset } = require('console')
const { fs } = require('fs')
const dotenv = require('dotenv')
dotenv.config()
const app = express()
var bodyParser = require('body-parser');
const { initApyhub, charts } = require("apyhub");
require("dotenv").config();


// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// PORT
const port = process.env.REST_PORT || 8000

app.get('/', (req, res) => {
    res.send('This is an Node.js REST API example using node-postres driver')
})

app.options('')

// create users and fetch APIs
app.post('/api/customers',db.createCustomer)
app.post('/api/customers/login', db.getCustomerById)

// create tags and fetch APIs
app.get('/api/tags', db.getAllPublicTags)
app.get('/api/tags/:id', db.getAllTagsUser)
app.post('/api/tags/create', db.createPrivateTag)

// create transactions and fetch APIs
app.post('/api/transactions', db.createTransaction)
app.get('/api/transactions/:id', db.getTransactionById)
//app.put('/api/customers/:id', db.updateCustomer)
//app.delete('/api/customers/:id', db.deleteCustomer)
//app.get('/api/customers', db.getCustomers)


// get details of user on monthly transactions 
app.get('/api/monthlytransactions/:neededmonth/:id',db.getmonthlyTransactionById)

// get details of user on count of monthly transactions 
// app.get('/api/monthlytransactionscount/:neededmonth/:id',db.getmonthlyTransactioncountById)

app.post('/api/chart',(req,res)=>{
    initApyhub(process.env.APYTOKEN);
    console.log(process.env.APYTOKEN);
    const {uid, data} = req.body
    // will need uid and data. UID to store the filename as that image
    // data will be used to form the image
    // const { charts } = require("apyhub");
//       const data = [
//         { value: 10, label: "A" },
//     { value: 20, label: "B" },
//     { value: 30, label: "C" },
//     { value: 40, label: "D" },
//   ];
    console.log(uid)
    console.log(data)
    charts({
        responseFormat: "file",
        chartType: "bar",
        output: "chart.png",
        title: "My Chart",
        theme: "light",
        data,
    }).then((result) => {
    // Specify the path to the desired folder
    const folder = 'static';

    // Create the full path to the image file
    const filepath = `${folder}/${uid}.jpg`;
    fs.writeFile(String(uid)+".jpg", result, 'binary', (err) => {
        if (err) {
          // Handle the error
          console.error(err);
          res.sendStatus(500);
          return;
        }
    
        // The image was saved successfully
        res.sendStatus(200);
    });
})

  });

app.listen(port, () => console.log(`Listening on port ${port}`))

module.exports=app