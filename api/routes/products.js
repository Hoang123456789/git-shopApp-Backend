const express = require('express');
const router = express.Router();

const checkAuth = require('../middleware/check-auth');
const ProductsControllers = require('../controllers/products');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './uploads');
  },
  filename: function(req, file, callback){
    callback(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
  }
});
const fileFilter = (req, file, callback) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    callback(null, true);
  } else {
    callback(null, false);
  }
};
const upload = multer({storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter : fileFilter
});
//, checkAuth , upload.single('productImage')
router.get('/', ProductsControllers.products_get_all);

router.post('/', ProductsControllers.products_create_product);

router.get('/:productId', ProductsControllers.products_get_product);

router.patch('/:productId', checkAuth, ProductsControllers.products_update_product);

router.delete('/:productId', checkAuth, ProductsControllers.products_delete_product);

module.exports = router;
