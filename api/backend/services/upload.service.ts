import multer from 'multer';

const userFolder = './built/backend/images/uploaded_by_user/';

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, userFolder);
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});

export const upload = multer({ storage: storage });
