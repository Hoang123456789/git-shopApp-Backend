const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');

exports.orders_get_all = (req, res, next) => {
  Order.find()
  .select('product quantity _id')
  .populate('product', 'name')
  .exec()
  .then( docs => {

    const response = {
      count: docs.length,
      orders: docs.map(doc => {
        return {
          _id: doc._id,
          product: doc.product,
          quantity: doc.quantity,
          request: {
            type: 'GET',
            url: 'http://localhost:8000/orders/'+ doc._id
          }
        }
      })
    };

    if(docs.length > 0){
      return res.status(200).json(response);
    } else {
      return res.status(200).json({
        message : '0 Order Found. Create a new Order'
      });
    }

  })
  .catch( err => {
    return res.status(500).json({
      error: err
    });
  });
}

exports.orders_create_order = (req, res, next) => {
  // check if product exists
  Product.findById(req.body.product)
  .then(product => {

    if(!product) {
      return res.status(404).json({
        message : 'No Product Found with provided ID'
      });
    }

    const order = new Order({
      _id: mongoose.Types.ObjectId(),
      quantity: req.body.quantity,
      product: req.body.product
    });

    return order.save();
  })
  .then(result => {
    return res.status(201).json({
      message: 'Order Created',
      createdOrder: {
        _id: result._id,
        product: result.product,
        quantity: result.quantity
      },
      request: {
        type: 'GET',
        url: 'http://localhost:8000/orders'+ result._id
      }
    });
  })
  .catch(err => {
    return res.status(500).json({
      error: err
    });
  });

}

exports.orders_get_order = (req, res, next) => {

  Order.findById(req.params.orderId)
  .select('product quantity _id')
  .populate('product')
  .exec()
  .then( order => {

    if(order) {
      return res.status(200).json({
        order: order,
        request: {
          type: 'GET',
          description: 'Get all orders',
          url: 'http://localhost:8000/orders'
        }
      });
    } else {
      return res.status(404).json({
        message : 'No Order Found with provided ID'
      });
    }

  })
  .catch( err => {
    return res.status(500).json({
      error: err
    })
  });

}

exports.orders_delete_order = (req, res, next) => {
  Order.remove({_id: req.params.orderId})
  .exec()
  .then(result => {
    return res.status(200).json({
      message: 'Order Deleted',
      deleted_order_id: req.params.orderId
    });
  })
  .catch(err => {
    return res.status(500).json({
      error: err
    });
  });
}
