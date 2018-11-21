var MongoClient = require('mongodb').MongoClient;
var _db;
module.exports = {
  connectToDb: function( callback ) {
    MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }, function( err, client ) {
      _db = client.db('db_dev');
      return callback( err );
    } );
  },
  getDb: function() {
    return _db;
  }
};