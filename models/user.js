const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, require: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(
    // use toString to ensure we're comparing strings regardless of object type we're dealing with
    cp => cp.productId.toString() === product._id.toString(),
  );
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex !== -1) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  this.cart = {
    items: updatedCartItems,
  };
  return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(
    item => item.productId.toString() !== productId,
  );
  this.cart = {
    items: updatedCartItems,
  };
  return this.save();
};

userSchema.methods.clearCart = function(product) {
  this.cart = { items: [] };
  return this.save();
};

userSchema.query.byEmail = function(email) {
  return this.where({ email: new RegExp(email, 'i') });
};

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// const COLLECTION_NAME = 'users';
// class User {
//   constructor(name, email, cart, id) {
//     this.name = name;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       dbOp = db
//         .collection(COLLECTION_NAME)
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db.collection(COLLECTION_NAME).insertOne(this);
//     }
//     return dbOp
//       .then(result => {
//         return result;
//       })
//       .catch(err => console.log(err));
//   }

//   addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex(
//       // use toString to ensure we're comparing strings regardless of object type we're dealing with
//       cp => cp.productId.toString() === product._id.toString(),
//     );
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];

//     if (cartProductIndex !== -1) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new mongodb.ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }

//     const updatedCart = {
//       items: updatedCartItems,
//     };

//     const db = getDb();
//     return db
//       .collection(COLLECTION_NAME)
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: updatedCart } },
//       );
//   }

//   getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map(i => i.productId);
//     return db
//       .collection('products')
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then(products => {
//         return products.map(p => {
//           return {
//             ...p,
//             quantity: this.cart.items.find(
//               ci => ci.productId.toString() === p._id.toString(),
//             ).quantity,
//           };
//         });
//       });
//   }

//   deleteItemFromCart(productId) {
//     const updatedCartItems = this.cart.items.filter(
//       item => item.productId.toString() !== productId,
//     );
//     const db = getDb();
//     return db
//       .collection(COLLECTION_NAME)
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: { items: updatedCartItems } } },
//       );
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then(products => {
//         const order = {
//           items: products,
//           user: { _id: new mongodb.ObjectId(this._id), name: this.name },
//         };
//         return db.collection('orders').insertOne(order);
//       })
//       .then(result => {
//         this.cart = { items: [] };
//         return db
//           .collection(COLLECTION_NAME)
//           .updateOne(
//             { _id: new mongodb.ObjectId(this._id) },
//             { $set: { cart: { items: [] } } },
//           );
//       });
//   }

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection('orders')
//       .find({ 'user._id': new mongodb.ObjectId(this._id) })
//       .toArray();
//   }

//   static findById(id) {
//     const db = getDb();
//     return db
//       .collection(COLLECTION_NAME)
//       .find({ _id: new mongodb.ObjectId(id) })
//       .next()
//       .then(user => {
//         return user;
//       })
//       .catch(err => console.log(err));
//   }

//   static findByEmail(email) {
//     const db = getDb();
//     return db
//       .collection(COLLECTION_NAME)
//       .find({ email: email })
//       .next()
//       .then(user => {
//         return user;
//       })
//       .catch(err => console.log(err));
//   }
// }

// module.exports = User;
