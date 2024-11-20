const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  user: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String
  },
  cartItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      name: String,
      quantity: Number,
      price: Number,
      image: String
      // You can include other product-related information here
    }
  ]
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
