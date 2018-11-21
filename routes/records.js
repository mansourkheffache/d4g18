var express = require('express');
var router = express.Router();

const json2csv = require('json2csv').parse;
const flatten = require('flat');
const fs = require('fs');
const path = require('path');



var mongoUtil = require('../dbutils');

// get record
router.get('/', function(req, res, next) {

	// find response by reference
	var db = mongoUtil.getDb();
	db.collection('records').findOne({ ref: req.query.ref }, function(err, result) {
    	if (err) throw err;
    	res.send({ id: result._id, answers: result.answers, ref: result.ref });
	});
});

// create record
router.post('/', function(req, res, next) {
	// insert empty response to database and return id and new ref
	entry = { ref: Math.random().toString(16).substring(2, 8) };
	var db = mongoUtil.getDb();
	db.collection('records').insertOne(entry , function(err, result) {
  		res.send({ id: result.ops[0]._id, ref: result.ops[0].ref });
	});
});

// update record
router.put('/', function(req, res, next) {
	// save response to database and return id
		// find response by reference
	var db = mongoUtil.getDb();
	db.collection('records').findOneAndUpdate({ ref: req.body.ref }, { $set: { answers: req.body.answers }}, function(err, result) {
    	if (err) throw err;
    	res.send({ id: result.value._id, ref: result.value.ref });
	});
});


// export csv
router.get('/export', function(req, res, next) {

	// find response by reference
	var db = mongoUtil.getDb();
	db.collection('records').find({}).toArray(function(err, result) {
    	if (err) throw err;
    	const fileName = (new Date().getTime()).toString() + '.csv';
    	fs.writeFile(fileName, json2csv(result, { flatten: true }), function(err, data){
		    if (err) throw err;

		    res.setHeader('Content-Type', 'text/csv');
			res.setHeader('Content-Disposition', 'attachment; filename=export-'+fileName);

    		res.sendFile(path.join(__dirname + '/../' + fileName));

		});
	});
});


module.exports = router;
