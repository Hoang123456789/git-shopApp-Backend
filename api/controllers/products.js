const Product = require('../models/product');
const mongoose = require('mongoose');

exports.products_get_all = (req, res, next) => {

  Product.find()
  .select('name price _id productImage')
  .exec()
  .then(docs => {
    const response = {
      count: docs.length,
      products: docs.map(doc => {
        return {
          name: doc.name,
          price: doc.price,
          _id: doc._id,
          productImage: doc.productImage,
          request: {
            type: 'GET',
            url: 'http://localhost:8000/products/'+ doc._id
          }
        }
      })
    };
    if(docs.length > 0){
      return res.status(200).json(response);
    } else {
      return res.status(200).json({
        message : '0 Product Found. Create a new Product'
      });
    }

  })
  .catch(err => {
    return res.status(500).json({
      error : err
    });
  });

}

exports.products_get_product = (req, res, next) => {

  const id = req.params.productId;
  Product.findById(id)
  .select('name price _id productImage')
  .exec()
  .then( doc => {

    if(doc) {
      return res.status(200).json({
        product: doc,
        request: {
          type: 'GET',
          description: 'Get all products',
          url: 'http://localhost:8000/products'
        }
      });
    } else {
      return res.status(404).json({
        message : 'No Product Found with provided ID'
      });
    }

  })
  .catch( err => {
    return res.status(500).json({
      error: err
    });
  });

}

exports.products_update_product = (req, res, next) => {

    const id = req.params.productId;
    const update = {};
    for(const arg of req.body){
      update[arg.propName] = arg.value;
    }

    Product.update({ _id: id }, { $set: update })
    .exec()
    .then( result => {
      return res.status(200).json({
        message: 'Product Updated',
        request: {
          type: 'GET',
          url: 'http://localhost:8000/products/'+ id
        }
      });
    })
    .catch( err => {
      return res.status(500).json({
        error : err
      });
    });

}

exports.products_delete_product = (req, res, next) => {

  const id = req.params.productId;
  Product.remove({_id: id})
  .exec()
  .then( result => {
    return res.status(200).json({
      message: 'Product Deleted',
      deleted_product_id: id
    });
  })
  .catch( err => {
    return res.status(500).json({
      error : err
    });
  });

}

exports.products_create_product = (req, res, next) => {

  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });

  product
  .save()
  .then( result => {
    return res.status(201).json({
      message : 'Created Product',
      productDetails : {
        name: result.name,
        price: result.price,
        _id: result._id,
        productImage: result.productImage,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/products/'+ result._id
        }
      }
    });
  })
  .catch( err => {
    return res.status(500).json({
      error : err
    });
  });

}
