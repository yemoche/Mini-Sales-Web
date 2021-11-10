const User = require ('../model/customers')

//handle errors object
const handleErrors = (err) =>{
  console.log(err.message, err.code)
  let errors = { email: "", password: "" };

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
      res.status(201).json(user);
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors});
  }
}

module.exports.login_post = (req, res) => {
    res.render('user login');
}