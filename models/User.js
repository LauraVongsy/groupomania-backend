
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const URL= "http://localhost:5000/images/profil-default.jpg";

// Schema pour User
const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "Veuillez renseigner une adresse email"],
    unique: [true, "L'adresse email est déjà utilisée"],
  },
  password: { type: String,
    required: [true, "Veuillez renseigner un mot de passe"] },
  isAdmin: { type: Boolean, required: true, default: false},
  profilPicture: {type: String, default: URL},
  bio:{type: String, default:""},
  lastName: {type: String,required: true, default: ""},
  firstName: {type: String,required:true, default: ""}
});


userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
