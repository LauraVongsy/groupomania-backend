const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs")

const User = require("../models/User");

//inscription
exports.signUp = async (req, res) => {
    try {
        const {email, password, lastName, firstName} = req.body;
        const hash = await bcrypt.hash(password, 10)
        const user = await User.create({
            email,
            password: hash,
            firstName,
            lastName
        })

        await user.save()
            .then(() => res.status(201).json({
                userId: user._id,
                isAdmin: user.isAdmin,
                token: jwt.sign({userId: user._id,isAdmin: user.isAdmin }, process.env.JWT_TOKEN, {
                    expiresIn: "24h"}),
                message:"Utilisateur crée"
            }))



        }catch (err) {
        await res.status(500).json({message: err.message})
    }
}

// connexion
exports.logIn = async (req, res) => {
    try {
        const {email, password} = req.body;


        await User.findOne({email: email})
            .then((user) => {
                if (!user) {
                    return res.status(404).json({message: "Utilisateur non trouvé"});
                }
                bcrypt
                    .compare(password, user.password)
                    .then((valid) => {
                        if (!valid) {
                            return res.status(400).json({message: "Mot de passe invalide"});
                        }
                        res
                            .status(200)
                            .json({
                                userId: user._id,
                                isAdmin: user.isAdmin,
                                token: jwt.sign({userId: user._id,isAdmin: user.isAdmin }, process.env.JWT_TOKEN, {
                                    expiresIn: "24h",
                                }),
                            });
                    })
            })
    } catch (err) {
        await res.status(500).json({message : err.message})
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const user = await User.find({}).exec()
        await res.status(200).json(user)
    } catch(err) {
        await res.status(500).json({message: err.message})
    }
}

exports.getOneUser = async (req, res) => {
    try {
        const user = await User.findById({_id: req.params.id}).exec()
        await res.status(200).json(user)
    } catch(err) {
        await res.status(404).json({message: err.message})
    }
}

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById({_id: req.params.id})
        const userLogged = await User.findById({_id: req.auth.userId})

        const {firstName, lastName, bio} = req.body
        const {userId} = req.auth
        const {isAdmin} = userLogged

        if(userId !== user._id.toString() && isAdmin !== true) {
            const filename = req.file.filename
            fs.unlink(`images/images-profils/${filename}`, (err) => {})
            return res.status(401).json({message: "requête non autorisée"})
        }

        if(req.file) {
            const picture = user.profilPicture
            const filename = picture.split('/images/images-profils/')[1]
            fs.unlink(`images/images-profils/${filename}`, (err) => {})
        }

        const userObject = req.file ?
            {
                ...req.body,
                profilPicture: `${req.protocol}://${req.get("host")}/images/images-profils/${
                    req.file.filename
                }`
            } :
            {
                firstName,
                lastName,
                bio
            }

        await User.findByIdAndUpdate({_id: req.params.id}, {
            ...userObject,
        })
        await res.status(200).json({message: "Utilisateur mis à jour"})

    } catch (err) {
        await res.status(400).json({message: err.message})
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById({_id: req.params.id})
        const userLogged = await User.findById({_id: req.auth.userId})

        const {profilPicture} = user
        const {userId} = req.auth
        const {isAdmin} = userLogged

        if(!user) return res.status(404).json({message: "Utilisateur non trouvé"})
        if(userId !== user._id.toString() && isAdmin !== true) return res.status(401).json({message: "requête non autorisée"})

        const filename = profilPicture.split('/images/images-profils')[1]
        fs.unlink(`images/images-profils/${filename}`, (err) => {});

        await User.findByIdAndDelete({_id: req.params.id})
        await res.status(200).json({message: "Utilisateur supprimé"})

    } catch(err) {
        await res.status(500).json({message: err.message})
    }
}