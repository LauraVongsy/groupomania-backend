const Post = require("../models/Post");
const User = require("../models/User");

//fs est un gestionnaire de fichiers Node
const fs = require("fs");

// Création de post
exports.createPost = async (req, res) => {
    try {
        const postObject = req.file ? {...req.body,
            postPicture: `${req.protocol}://${req.get('host')}/images/images-posts/${req.file.filename}`,
            date: Date.now()} : {...req.body, date: Date.now()};
        delete postObject._id;
        await Post.create({
            ...postObject,
        })
        await res.status(201).json({message: "Post créé !"})
    } catch(err) {
        await res.status(400).json({message : err.message})
    }
}

// Recupération des posts
exports.getAllPost = async (req, res) => {
    try {
        const post = await Post.find({}).sort({date: -1}).exec()
        await res.status(200).json(post);
    } catch(err) {
        await res.status(500).json({message : err.message})
    }
}

// Récupération d'un post par son ID
exports.getOnePost = async (req, res) => {
    try {
        const post = await Post.findById({_id: req.params.id}).exec();
        await res.status(200).json(post)
    } catch(err) {
        await res.status(400).json({message : err.message})
    }
}

// Modifier un post
exports.updatePost = async (req, res) => {
    try {
        const userLogged = await User.findById({_id: req.auth.userId});
        const post = await Post.findById({_id: req.params.id})

// destructuring de req.body
        const {message} = req.body;
        const {userId} = req.auth
        const {isAdmin} = userLogged

        if(userId !== post.userId && isAdmin !== true) {
            const filename = req.file.filename
            fs.unlink(`images/images-posts/${filename}`, (err) => {})
            return res.status(401).json({message: "requête non autorisée"})
        }

        //Enlève l'ancienne image si elle existe
        if(req.file) {
            const {postPicture} = post
            const filename = postPicture.split('/images/images-posts/')[1];
            fs.unlink(`images/images-posts/${filename}`, (err) => {})
        }

        // ajout de la nouvelle image ou du nouveau message
        const postObject = req.file
            ? {
                ...req.body,
                postPicture: `${req.protocol}://${req.get("host")}/images/images-posts/${
                    req.file.filename
                }`,
            }
            : {
                message: message,
            };

// Update du post
        await Post.findByIdAndUpdate({_id: req.params.id}, {
            ...postObject,
            _id: req.params.id,
            date: Date.now()
        })
        await res.status(200).json({message: "Post modifié !"})

    } catch(err) {
        await res.status(400).json({message : err.message})
    }
}

// Suppression de post
exports.deletePost = async (req, res) => {
    try {
        const userLogged = await User.findById({_id: req.auth.userId});
        const post = await Post.findById({_id: req.params.id}).exec();

        const {userId, postPicture} = post;
        const {isAdmin} = userLogged

        if (!post) {
            return res.status(404).json({message: "Post non trouvé"})
        }
        if(userId !== req.auth.userId && isAdmin !== true) {
            return res.status(401).json({message: "Requête non autorisée"})
        }
        const filename = postPicture.split('/images/images-posts/')[1];

        fs.unlink(`images/images-posts/${filename}`, (err) => {});

        await Post.findByIdAndDelete({_id: req.params.id });
        await res.status(200).json({message: "Post supprimé !"})

    } catch(err) {
        await res.status(500).json({message : err.message})
    }
}

exports.likePost = async (req, res) => {
    try {
        // Destructuring
        const {like, userId} = req.body;
        const post = await Post.findById({_id: req.params.id})

        const { likes, dislikes, usersLiked, usersDisliked } = post
        switch (like) {
            // Si like === 1
            case 1:
                if (!post.usersLiked.includes(userId) && !post.usersDisliked.includes(userId)) {
                    await Post.findByIdAndUpdate({_id: req.params.id}, {$inc: {likes: +1}, $push: {usersLiked: userId}})
                    await res.status(200).json({message: "Je like ce post" , likes, usersLiked })
                }
                break;
            // Si like === 0
            case 0:
                if (post.usersLiked.includes(userId)) {
                    await Post.findByIdAndUpdate({_id: req.params.id}, {$inc: {likes: -1}, $pull: {usersLiked: userId}})
                    await res.status(200).json({message: "Je retire mon like", likes, usersLiked})
                }
                if (post.usersDisliked.includes(userId)) {
                    await Post.findByIdAndUpdate({_id: req.params.id}, {
                        $inc: {dislikes: -1},
                        $pull: {usersDisliked: userId}
                    })
                    await res.status(200).json({message: "Je retire mon dislike", dislikes, usersDisliked})
                }
                break;
            // Si like === -1
            case -1:
                if (!post.usersDisliked.includes(userId) && !post.usersLiked.includes(userId)) {
                    await Post.findByIdAndUpdate({_id: req.params.id}, {
                        $inc: {dislikes: +1},
                        $push: {usersDisliked: userId}
                    })
                    await res.status(200).json({message: "Je dislike ce post", dislikes, usersDisliked})
                }
                break;
        }
    } catch (err) {
        await res.status(400).json({message : err.message})
    }
}