const express = require ('express');
const mongoose = require ('mongoose');
const authroutes = require ('./routes/authroutes')
const cookieParser = require ('cookie-parser');
const paypal = require('paypal-rest-sdk');

const { requireAuth, checkUser } = require('./middleware/authMiddleware');
require('dotenv').config({path: __dirname + '/.env'})
const app = express()

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  mongoose.connection.on("connected", () => {
    console.log("Database Connected")
  })

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PaypalClientId_,
    'client_secret': process.env.Paypal_SecretKey
  });

  app.post('/pay', (req, res) => {
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:3000/success",
          "cancel_url": "http://localhost:3000/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "Peach Campsuit",
                  "sku": "001",
                  "price": "25.00",
                  "currency": "USD",
                  "quantity": 2
              }]
          },
          "amount": {
              "currency": "USD",
              "total": "50.00"
          },
          "description": "Campsuit for the cold"
      }]
  };

  app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "50.00"
          }
      }]
    };
  
paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.send('Success');
      }
  });
  });

app.get('/cancel', (req, res) => res.send('Cancelled'));
  
paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });
  
  });

//middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

//view engine
app.set('view engine', 'ejs');

const port = 3000;
app.get('*', checkUser)
app.get('/', (req, res) => res.render('home'));
app.get('/campersuit', requireAuth, (req, res) => res.render('campersuit'));
app.use(authroutes);

app.listen(port, () =>{
console.log(`server listen on ${port}`)
})