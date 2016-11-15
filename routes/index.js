var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Product = require('../models/product');

/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function(err,items) {
      var productRows = [];
      var rowSize = 3;
      for ( var i = 0; i < items.length; i += rowSize) {
        productRows.push(items.slice(i, i + rowSize));
      }  // Render shop index and flash message handling
      res.render('shop/index', { title: 'Shop', products: productRows, successMsg: successMsg, noMessages: !successMsg});
  });
});

// add to cart route
router.get('/addToCart/:id', function(req, res, next) {
    var productId = req.params.id;
    // Create the cart , pass old cart if exists, else pass empty object
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    // Use mongoose to find product
    Product.findById(productId, function(err, product) {
      if (err) {
        return res.redirect('/');
      }
      // pass the product and its product id to cart
      cart.add(product, product.id);
      req.session.cart = cart; // save cart to session
      console.log(req.session.cart);
      res.redirect('/');
    });
});

// Cart routes
router.get('/cart', function(req, res, next) {
  if (!req.session.cart) {
      return res.render('shop/cart', {products: null});
  }
  var cart = new Cart(req.session.cart);
  // Passing total price to cart view
  res.render('shop/cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

// Checkout route
router.get('/checkout', function(req, res, next) {
  if (!req.session.cart) {
      return res.redirect('/cart');
  }
  var cart = new Cart(req.session.cart);
  //store multiple errors into an array (connect-flash) and accessing the first
  var errMsg = req.flash('error')[0];
  // Passing total price to checkout view
  res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});

});

router.post('/checkout', function(req, res, next) {
  if (!req.session.cart) {
      return res.redirect('/cart');
  }
  var cart = new Cart(req.session.cart);

  var stripe = require("stripe")(
    "sk_test_BQokikJOvBiI2HlWgH4olfQ2"
  );

  stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: "aud",
    source: req.body.stripeToken, // obtained with Stripe.js
    description: "Test charge"
  }, function(err, charge) {
    // asynchronously called
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    req.flash('success', 'Deposit successful');
    req.session.cart = null
    res.redirect('/');
  });
});

module.exports = router;
