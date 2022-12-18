//module de validation de password

const passwordValidator = require("password-validator");

module.exports = async (req, res, next) => {
  try {
    const {password} = req.body;
    // Creation d'un schéma de password
    const passwordSchema = new passwordValidator();

    passwordSchema
      .is().min(8)                                      // Minimum length 8
      .is().max(12)                                    // Maximum length 12
      .has().uppercase()                                     // Must have uppercase letter
      .has().lowercase()                                     // Must have lowercase letter
      .has().digits(2)                                 // Must have at least 2 digits
      .has().not().spaces()                                  // Should not have spaces
      .is().not().oneOf(['Passw0rd', 'Password123'])     // Blacklist these values
    if (passwordSchema.validate(password)) {
      next();
    } else {
      await res.status(400).json({message: `Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial `})
    }
  } catch (err) {
    await res.status(400).json({message: "Le mot de passe est invalide"})
  }
}
