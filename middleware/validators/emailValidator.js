//module validator

const validator = require("validator");

module.exports = async (req, res, next) => {
  try {

  const{email} = req.body;

  if(validator.isEmail(email)) {
    next();
  } else {
    await res
      .status(400)
      .json({message : `l'email ${email} n'est pas valide`})
  }
} catch(err) {
    await res.status(400).json({message: `l'email ${email} n'est pas valide`})
  }
}
