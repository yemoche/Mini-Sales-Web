const User = require ('../model/customers');
const jwt = require ('jsonwebtoken');

//handle errors object
const handleErrors = (err) =>{
  // console.log(err.message, err.code, err.reason)
  let errors = { email: "", password: "" };

// incorrect email
if (err.message === 'incorrect email') {
  errors.email = 'that email is not registered'
}

// incorrect password
if (err.message === 'incorrect password') {
  errors.password = 'that password is incorrect '
}

//duplicate errors
if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
}
//validation errors
if (err.message.includes('user validation failed')){
    Object.values(err.errors).forEach(({properties}) =>{
        errors[properties.path] = properties.message
    });
  }
  return errors;
}

const maxAge = 3 * 24 * 60 * 60 //this is for seconds, note cookie on the browser expects milliseconds
const createToken = (id) => {
   return jwt.sign({ id }, process.env.SECRET_KEY, {
     expiresIn: maxAge
   })
}

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.signup_post = async (req, res) => {
  const { email, password, name } = req.body;
  try {
      const user = await User.create({email, password, name})
      const token = createToken(user._id)
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }) //maxAge sets to milli second
      res.status(201).json({user:user._id});
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors});
  }
}

module.exports.login_post = async (req, res) => {
   const { email, password } = req.body;
   try {
     const user = await User.login ( email, password );
     const token = createToken(user._id)
     res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }) //maxAge sets to milli second
     res.status(201).json({user:user._id});
   } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors});
   }
}