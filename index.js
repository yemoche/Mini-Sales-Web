const express = require ('express');
const mongoose = require ('mongoose');
const authroutes = require ('./routes/authroutes')
const cookieParser = require ('cookie-parser')
require('dotenv').config({path: __dirname + '/.env'})
const app = express()

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  mongoose.connection.on("connected", () => {
    console.log("Database Connected")
  })

//middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

//view engine
app.set('view engine', 'ejs');

const port = 3000;

app.get('/', (req, res) => res.render('home'));
app.get('/campersuit', (req, res) => res.render('campersuit'));
app.use(authroutes);

app.listen(port, () =>{
console.log(`server listen on ${port}`)
})