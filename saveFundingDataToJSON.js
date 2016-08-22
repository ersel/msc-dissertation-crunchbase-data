var db = require('./database');
var fs = require('fs');
var URL = require('url-parse');
var Request = require('delayed-request')(require('request'));
var override = require('json-override');

var request = new Request({
	debug: true, // Optional, output delay to console
	delayMin: 100,
	delayMax: 20000
});

function compileFundingItem(compiledData, index, funding, money_raised_gbp) {
	var item = {};
	item[`FR_${index}_funding_type`] = funding.properties.funding_type;
	item[`FR_${index}_series`] = funding.properties.series;
	item[`FR_${index}_series_qualifier`] = funding.properties.series_qualifier;
	item[`FR_${index}_announced_on`] = funding.properties.announced_on;
	item[`FR_${index}_money_raised_GBP`] = money_raised_gbp ? money_raised_gbp : funding.properties.money_raised;
	item[`FR_${index}_money_raised_currency_code`] = funding.properties.money_raised_currency_code;

	return override(compiledData, item, true);
}

function compileFundingDataForCompany(fundingArr, index, compiledData, callback, ctxt) {
	if (fundingArr.length > 0) {
		var funding = fundingArr.pop();
		if (funding.properties.money_raised && funding.properties.money_raised_currency_code != "GBP") {
			var money_raised = funding.properties.money_raised;
			var raised_currency = funding.properties.money_raised_currency_code;
			var date = funding.properties.announced_on;
			var conversionURL = `http://currencies.apps.grandtrunk.net/getrate/${date}/${raised_currency}/GBP`;
			request.run(conversionURL, function(error, response, body) {
				if (!error && response.statusCode == 200) {
					var fxRate = JSON.parse(body);
					var money_raised_gbp = money_raised * fxRate;
					money_raised_gbp = money_raised_gbp.toFixed(2);
					compiledData = compileFundingItem(compiledData, index, funding, money_raised_gbp);
					compileFundingDataForCompany(fundingArr, ++index, compiledData, callback, ctxt);
				} else {
					console.log(error, response.statusCode);
				}
			})
		} else {
			compiledData = compileFundingItem(compiledData, index, funding);
			compileFundingDataForCompany(fundingArr, ++index, compiledData, callback, ctxt);
		}
	} else {
		callback(compiledData, ctxt);
	}
}

function saveFileToDB(content, all_funding_rounds) {

	var fileContent = JSON.parse(content);
	var funding_rounds = [];
	if (fileContent.paging.total_items == 1) {
		funding_rounds.push(fileContent.item);
	} else {
		funding_rounds = fileContent.items;
	}

	var url = new URL(fileContent.paging.next_page_url);
	var company_name = url.pathname.split('/')[4];
	var compiledData = {
		"company_name": "",
		"FR_1_funding_type": "",
		"FR_1_series": "",
		"FR_1_series_qualifier": "",
		"FR_1_announced_on": "",
		"FR_1_money_raised_GBP": "",
		"FR_1_money_raised_currency_code": "",
		"FR_2_funding_type": "",
		"FR_2_series": "",
		"FR_2_series_qualifier": "",
		"FR_2_announced_on": "",
		"FR_2_money_raised_GBP": "",
		"FR_2_money_raised_currency_code": "",
		"FR_3_funding_type": "",
		"FR_3_series": "",
		"FR_3_series_qualifier": "",
		"FR_3_announced_on": "",
		"FR_3_money_raised_GBP": "",
		"FR_3_money_raised_currency_code": "",
		"FR_4_funding_type": "",
		"FR_4_series": "",
		"FR_4_series_qualifier": "",
		"FR_4_announced_on": "",
		"FR_4_money_raised_GBP": "",
		"FR_4_money_raised_currency_code": "",
		"FR_5_funding_type": "",
		"FR_5_series": "",
		"FR_5_series_qualifier": "",
		"FR_5_announced_on": "",
		"FR_5_money_raised_GBP": "",
		"FR_5_money_raised_currency_code": "",
		"FR_6_funding_type": "",
		"FR_6_series": "",
		"FR_6_series_qualifier": "",
		"FR_6_announced_on": "",
		"FR_6_money_raised_GBP": "",
		"FR_6_money_raised_currency_code": "",
		"FR_7_funding_type": "",
		"FR_7_series": "",
		"FR_7_series_qualifier": "",
		"FR_7_announced_on": "",
		"FR_7_money_raised_GBP": "",
		"FR_7_money_raised_currency_code": "",
		"FR_8_funding_type": "",
		"FR_8_series": "",
		"FR_8_series_qualifier": "",
		"FR_8_announced_on": "",
		"FR_8_money_raised_GBP": "",
		"FR_8_money_raised_currency_code": "",
		"FR_9_funding_type": "",
		"FR_9_series": "",
		"FR_9_series_qualifier": "",
		"FR_9_announced_on": "",
		"FR_9_money_raised_GBP": "",
		"FR_9_money_raised_currency_code": "",
		"FR_10_funding_type": "",
		"FR_10_series": "",
		"FR_10_series_qualifier": "",
		"FR_10_announced_on": "",
		"FR_10_money_raised_GBP": "",
		"FR_10_money_raised_currency_code": "",
		"FR_11_funding_type": "",
		"FR_11_series": "",
		"FR_11_series_qualifier": "",
		"FR_11_announced_on": "",
		"FR_11_money_raised_GBP": "",
		"FR_11_money_raised_currency_code": "",
		"FR_12_funding_type": "",
		"FR_12_series": "",
		"FR_12_series_qualifier": "",
		"FR_12_announced_on": "",
		"FR_12_money_raised_GBP": "",
		"FR_12_money_raised_currency_code": "",
		"FR_13_funding_type": "",
		"FR_13_series": "",
		"FR_13_series_qualifier": "",
		"FR_13_announced_on": "",
		"FR_13_money_raised_GBP": "",
		"FR_13_money_raised_currency_code": "",
		"FR_14_funding_type": "",
		"FR_14_series": "",
		"FR_14_series_qualifier": "",
		"FR_14_announced_on": "",
		"FR_14_money_raised_GBP": "",
		"FR_14_money_raised_currency_code": "",
		"FR_15_funding_type": "",
		"FR_15_series": "",
		"FR_15_series_qualifier": "",
		"FR_15_announced_on": "",
		"FR_15_money_raised_GBP": "",
		"FR_15_money_raised_currency_code": ""
	};
	compiledData.company_name = company_name;

	var ctxt = all_funding_rounds;
	compileFundingDataForCompany(funding_rounds, 1, compiledData, function(compiledDataFinal, context) {
		context.push(compiledDataFinal);
		console.log("Current: " + context.length);
		if (context.length == 1680)
			fs.writeFile(`data/funding_output/all_funding.json`, JSON.stringify(context, null, 2), function(err) {
				if (err) {
					return console.log(err);
				} else {
					console.log(`all_funding.json was saved!`);
				}
			});
	}, ctxt);

}

function readFiles(dirname, onFileContent) {
	var all_funding_rounds = [];

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
				onFileContent(content, all_funding_rounds);
			});
		});

	});
}

// Initialize connection
db.connect(function() {
	readFiles('data/funding', saveFileToDB);
})
