var db = require('./database');
var fs = require('fs');

function saveFileToDB(filename, content) {
	var fileContent = JSON.parse(content);
	fileContent.data.items.forEach(function(company) {
		company.properties["uuid"] = company.uuid;
		company.properties["request_type"] = company.type;
		if(company.properties["about.me_url"])
			delete company.properties["about.me_url"]
		db.insertCompany(company.properties);
	});
}

function readFiles(dirname, onFileContent) {
	fs.readdir(dirname, function(err, filenames) {
		if (err) {
			console.log(err);
			return;
		}
		filenames.forEach(function(filename) {
			fs.readFile(`${dirname}/${filename}`, 'utf-8', function(err, content) {
				if (err) {
					console.log(err);
					return;
				}
				onFileContent(filename, content);
			});
		});
	});
}

// Initialize connection
db.connect(function() {
	readFiles('data/company', saveFileToDB);
})
