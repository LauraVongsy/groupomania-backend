// gestion des images des photos de profil utilisateur

const multer = require("multer");


const MIME_TYPE = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images/images-profils/')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPE[file.mimetype];
        callback(null, `${name}_${Date.now()}.${extension}`);
    }
});


async function fileFilter (req, file, cb) {
    try {

        const fieldsRegex = /^[a-zA-Z0-9 _.,;éèêàùâïëöü'!()&\n\r]+$/;


        const {title, content } = req.body

        if(fieldsRegex.test(title) &&
            fieldsRegex.test(content)) {
            return cb(null, true)
        } else {
            return cb(new Error("Certains champs contiennent des caractères invalides"))
        }
    } catch(err) {
        return cb(new Error(err))
    }
}


const upload = multer({storage: storage,
    fileFilter : (req, file, cb) => {fileFilter(req, file,cb)}
})

module.exports = upload.single('profilPicture')

