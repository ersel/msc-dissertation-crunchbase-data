var crunchbase = require('../crunchbase2');
var config = require('config');
var fs = require('fs');
var db = require('./database');

// Init the object with your API key
if (config.has('CrunchBaseAPIKey')) {
	var CrunchBaseAPIKey = config.get('CrunchBaseAPIKey');
} else {
	return console.log("API key not found");
}

crunchbase.init(CrunchBaseAPIKey);

function writeFile(results, fileName, callback) {
	fs.writeFile(`data/funding/${fileName}`, JSON.stringify(results, null, 2), function(err) {
		if (err) {
			return console.log(err);
		} else {
			console.log(`${fileName} was saved!`);
			callback();
		}
	});
};

db.connect(function() {
	var companiesCursor = db.getCompanies();

	var getData = function(companiesCursor) {
		companiesCursor.next(function(err, company) {
			var fundingQueryPermalink = company.permalink + '/funding_rounds';
			crunchbase.organization(fundingQueryPermalink, function(error, results) {
				if(results.data){
					if (!error) {
						if(results.data.paging.total_items > 0){
							results.data["company_uuid"] = company.uuid;
							writeFile(results.data, `${company.permalink}.json`, function(index) {
								companiesCursor.hasNext(function(err, next) {
									if(!err && next)
										getData(companiesCursor);
								})
							});
						} else {
							companiesCursor.hasNext(function(err, next) {
								if(!err && next)
									getData(companiesCursor);
							})
						}
					} else {
						console.log(error);
					}
				} else {
					console.log("!!!!!company.permalink FAILED TO SAVE!!!!!");
					companiesCursor.hasNext(function(err, next) {
						if(!err && next)
							getData(companiesCursor);
					})
				}
			});
		});
	};

	getData(companiesCursor);
})
