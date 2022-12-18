
const multer = require("multer");


const MIME_TYPE = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Methode pour stocker une image
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images/images-posts')
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPE[file.mimetype];
    callback(null, `${name}_${Date.now()}.${extension}`);
  }
});

// Validator des inputs dans multer
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

module.exports = upload.single('postPicture')

