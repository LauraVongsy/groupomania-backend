
const express = require("express");


const multer = require("../middleware/multer-posts");
const auth = require("../middleware/authentification")


const {
    createPost,
    getAllPost,
    getOnePost,
    updatePost,
    deletePost,
    likePost
} = require('../controllers/postController')


const router = express.Router();

// Routing des posts
router.post("/", auth, multer, createPost);
router.get("/",auth, getAllPost);
router.get("/:id", auth, getOnePost);
router.put("/:id", auth, multer, updatePost);
router.delete("/:id", auth, multer, deletePost);
router.post("/:id/like", auth, likePost);

module.exports = router;
