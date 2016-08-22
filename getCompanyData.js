var crunchbase = require('../crunchbase2');
var config = require('config');
var fs = require('fs');
var categories = require('./config/categories');

// Init the object with your API key
if (config.has('CrunchBaseAPIKey')) {
	var CrunchBaseAPIKey = config.get('CrunchBaseAPIKey');
} else {
	return console.log("API key not found");
}

crunchbase.init(CrunchBaseAPIKey);

function writeFile(results, fileName){
	fs.writeFile(`data/company/${fileName}`, JSON.stringify(results, null, 2), function(err) {
		if (err) {
			return console.log(err);
		} else {
			console.log(`${fileName} was saved!`);
		}
	});
};

function getAllData(endpoint, query, page) {
	endpoint(query, function(error, results) {
		if (!error) {
			writeFile(results, `${query.category_uuids}_${page}.json`);
			if(results.data.paging.current_page < results.data.paging.number_of_pages){
				query.page = ++page;
				getAllData(endpoint, query, page);
			}
		} else {
			console.log(error);
		}
	})
};

var endpoint = crunchbase.organizations;
var query = {
	locations: "United Kingdom",
	category_uuids: categories[119],
	page: "1"
};
var page = 1;
getAllData(endpoint, query, page);
