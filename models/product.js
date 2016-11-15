var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  imagePath: {type: String, required: true},
  title: {type: String, required: true},
  description: {type: String, required: true},
  size: {type: String},
  price: {type: Number, required: true}

});

module.exports = mongoose.model('product', schema);
