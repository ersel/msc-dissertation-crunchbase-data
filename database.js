var co = require('co');
var assert = require('assert');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://127.0.0.1:27017/crunchbase';
var db;

exports.connect = function(callback) {
	MongoClient.connect(mongoUrl, function(err, database) {
		if (err) throw err;
		db = database;
		callback();
	})
};

exports.getCompanies = function() {
	var col = db.collection('companies');
	return col.find();
};

exports.insertCompany = function(json) {
	co(function*() {
		// Get the companies collection
		var col = db.collection('companies');

		// Insert a single document if it doesn't exist
		var r = yield col.update({
			"uuid": json.uuid
		}, json, {
			upsert: true
		});
		if (!r.result.upserted) {
			console.log(`duplicate ${json.uuid}`);
		}
	}).catch(function(err) {
		console.log(err.stack);
	});
};
