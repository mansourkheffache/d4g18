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
    	console.log(result);
    	if (result) {
				// already submitted
				if (result.completed) res.sendStatus(403);
				else res.send({ id: result._id, responses: result.responses, ref: result.ref });
    	} else {
    		res.status(400);
    		res.send(result);
    	}
	});
});

// create record
router.post('/', function(req, res, next) {
	// insert empty response to database and return id and new ref
	entry = { ref: Math.random().toString(16).substring(2, 8) };
	var db = mongoUtil.getDb();
	db.collection('records').insertOne(entry , function(err, result) {
		if (err) throw err;
  		res.send({ id: result.ops[0]._id, ref: result.ops[0].ref });
	});
});

// update record
router.put('/', function(req, res, next) {
	// save response to database and return id
		// find response by reference
	var db = mongoUtil.getDb();

	var params = JSON.parse(req.body.data);

	db.collection('records').findOneAndUpdate({ ref: params.ref }, { $set: { responses: params.responses }}, function(err, result) {
    	if (err) throw err;
    	if (result.value) {
	    	res.send({ id: result.value._id, ref: result.value.ref });
    	} else {
    		res.status(400);
    		res.send(result.value);
    	}
	});
});

// create final record
router.post('/submit', function(req, res, next) {
	// insert empty response to database and return id and new ref
	entry = JSON.parse(req.body.data);
	// console.log(entry);
	var db = mongoUtil.getDb();

	db.collection('final').insertOne(entry , function(err, result) {
		// console.log(result);
		if (err) throw err;
		db.collection('records').findOneAndUpdate({ ref: entry.ref }, { $set: { completed: true }}, function(err, result) {
	    	if (err) throw err;
	    	if (result.value) {
			  		res.sendStatus(200);
	    	} else {
	    		res.status(400);
	    		res.send(result.value);
	    	}
		});
	});
});

// export csv
// TODO make it export from final answers
router.get('/export', function(req, res, next) {

	// find response by reference
	var db = mongoUtil.getDb();
	db.collection('final').find({}).toArray(function(err, result) {
    	if (err) throw err;
    	

    	var output;
    	if (result.length == 0) {
    		output = "";
    	} else {
    		output = json2csv(result, { flatten: true });
    	}


    	const fileName = (new Date().getTime()).toString() + '.csv';

    	fs.writeFile(__dirname + '/../dump/' + fileName, output, function(err, data){
		    if (err) throw err;

		    res.setHeader('Content-Type', 'text/csv');
			res.setHeader('Content-Disposition', 'attachment; filename=export-'+fileName);

    		res.sendFile(path.join(__dirname + '/../dump/'+ fileName));

		});
	});
});


// TODO

// submit responses

module.exports = router;
