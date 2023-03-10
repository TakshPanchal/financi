const fs = require('fs')
const dotenv = require('dotenv')
const express = require("express")
const app = express()
app.use(express.json())
dotenv.config()
const Pool = require('pg').Pool

// const ca_cert = process.env.SSL_CERT_CONTENTS ? process.env.SSL_CERT_CONTENTS : fs.readFileSync(process.env.SSL_CERT)
// host: process.env.DB_HOST,
//   database: process.env.DB_DBNAME,
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT

const pool = new Pool({
  connectionString: process.env.DATABASEURL
})
//create a customer(user)
const createCustomer = (req, res)  => {
    
    //console.log(req.body)
    const {uid, user_name, email} = req.body
    //use RETURNING to return uuid generated by CRDB
    pool.query('INSERT INTO users (user_name, email, uid) VALUES ($1, $2, $3) RETURNING user_id;',
     [user_name, email, uid], (error, results) => {
        if (error) {
            res.status(404).send('The user with the given ID was not found.')
            throw error
        }
        res.status(200).json(results.rows[0])
    })
}

//check if the particular user exists or not by checking their uid
const getCustomerById = (req, res) => {
    const {id} = req.body
    //console.log(id)
    pool.query('SELECT user_id FROM users WHERE uid=$1;',
        [id], (error, results) => {
        if (error) {
            res.status(404).send('The user with the given ID was not found.')
            throw error
        }
        res.status(200).json(results.rows[0])
    })
}

//create a Transaction
//raft write
const createTransaction = (req, res)  => {
    const {user_id, merchant_name, amount, closing_balance, tag_id, type, date, description, reference_number} = req.body
    //use RETURNING to return uuid generated by CRDB
    // type of transaction refers to Credit/Debit, 1 -> Credit, 0->Debit
    
    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    
    var newdate = year + "-" + month + "-" + day;
    

    function statusCounter(inputs) {
        let counter = 0;
        for (const input of inputs) {
          if (input.status === '0') counter += 1;
        }
        return counter;
      }

    let size = statusCounter(req.body);


    // let rep = '($1, $2, $3, $4, $5, $6, $7, $8, $9)';
    // size--;
    // if(size>=2){
       
    //     while(size--){
    //         rep+=',($1, $2, $3, $4, $5, $6, $7, $8, $9)';
    //     }
    // }
    // else{

    //     if(size==1){
    //         rep+=',($1, $2, $3, $4, $5, $6, $7, $8, $9)';
    //     }
    // }
    
    let obj = req.body;
    size = req.body.length
    
    let query = `INSERT INTO transactions (user_id, merchant_name, amount, closing_balance, tag_id, type, date, description, reference_number) VALUES `
    console.log(size)
    if(size == 2){
        for(let i=0;i<2;i++){
        
            if(i==1){
                query = query + `,`;
            }
            query = query + `(${obj[i].user_id}, '${obj[i].merchant_name}', ${obj[i].amount}, ${obj[i].closing_balance},${obj[i].tag_id},${obj[i].type},'${obj[i].date}','${obj[i].description}', '${obj[i].reference_number}')`
    
        }

    }else{

        for(let i=0;i<size;i++){
        

            if(i>=1 && i < size){
                query = query+`,`
            }
            query = query + `(${obj[i].user_id}, '${obj[i].merchant_name}', ${obj[i].amount}, ${obj[i].closing_balance},${obj[i].tag_id},${obj[i].type},'${obj[i].date}','${obj[i].description}', '${obj[i].reference_number}')`
    
        }
        
    }
    query = query + ';';
    console.log(query)
    pool.query(query,(error, results) => {
        if (error) {
            res.status(404).send('The transaction with the given Merchant and on the particular date was not found.')
            throw error
        }
        console.log(results)
        res.status(200).json(results.rows[0])
    })
}

// get all transactions of a user i.e uid is provided
const getTransactionById = (req, res) => {
    const id = req.params.id
    pool.query('SELECT t.date, t.merchant_name, t.amount, t.closing_balance, t.tag_id, t.type, t.reference_number FROM users u JOIN transactions t ON u.user_id = t.user_id WHERE u.uid=$1',
        [id], (error, results) => {
        if (error) {
            res.status(404).send('The transactions for the given user does not exist')
            throw error
        }
        res.status(200).json(results.rows)
    })
}

//get transaction sumup at month end of s user i.e uid is provided

const getmonthlyTransactionById = (req,res) =>{
    const id = req.params.id
    pool.query('SELECT t.date, t.amount FROM users u JOIN transactions t ON u.user_id = t.user_id WHERE u.uid=$1 WHERE t.date',
    [id], (error, results) => {
    if (error) {
        res.status(404).send('The Monthly transactions for the given user does not exist')
        throw error
    }
    res.status(200).json(results.rows)
})
}

// get all the public tags from Tags table where tag_type = 1 (Public), 0 (Private)
const getAllPublicTags = (req, res) => {
    try{
        pool.query('SELECT * FROM Tags WHERE tag_type=True', 
        (error, results) => {
            if (error) {
                res.status(404).send('Seems like there aren\'t any public tags yet.'+error)
                //throw error
                console.log(error);
                return;
            }
            res.status(200).json(results.rows)
        })
    }
    catch(e){
        console.log(e);
    }
}

// get tags of a user whose uid is provided
const getAllTagsUser = (req, res) => {
    const {uid} = req.params.uid
    pool.query('SELECT g.tag_name FROM users u JOIN transactions t ON u.user_id = t.user_id JOIN tags g ON t.tags = g.tag_id WHERE u.uid = $1 ',
        [uid], (error, results) => {
        if (error) {
            res.status(404).send('The customer with the given ID was not found.')
            throw error
        }
        res.status(200).json(results.rows)
    })
}


// create new tag
const createPrivateTag = (req, res) => {
    const {tag_name} = req.body
    const tag_type = False //False implies private
    pool.query('INSERT INTO tags (tag_name, tag_type) VALUES ($1, $2) \
        RETURNING tag_id;',
     [tag_name, tag_type], (error, results) => {
        if (error) {
            res.status(404).send('The tag with the given ID was not found.')
            throw error
        }
        res.status(200).json(results.rows[0])
     })

}


module.exports = {
    createCustomer,
    getCustomerById,
    createTransaction,
    getAllPublicTags,
    getAllTagsUser,
    createPrivateTag,
    getTransactionById,
    getmonthlyTransactionById
  }