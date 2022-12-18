
const mongoose = require("mongoose");

// Schema pour post
const postSchema = mongoose.Schema({
    userId: {type: String, required: true},
    message: {
        type: String,
        minlength: [2, "Le contenu du post est trop court"],
        maxlength: [3000, "Le post ne doit pas excéder 3000 caractères"],
        required: [true, "Veuillez renseigner un contenu"]
    },
    postPicture: {
        type: String,
        default: ""
    },
    date: {
        type: Date,
        required: true
    },
    likes: {type: Number, default: 0},
    dislikes: {type: Number, default: 0},
    usersLiked: {type: Array, default: []},
    usersDisliked: {type: Array, default: []},
});

module.exports = mongoose.model("Post", postSchema);
