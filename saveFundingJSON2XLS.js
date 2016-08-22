var json2xls = require('json2xls');
var fs = require('fs');

fs.readFile('data/funding_output/all_funding.json', 'utf-8', function(err, content) {
    if (err) {
        console.log(err);
        return;
    }
    var json = JSON.parse(content);
    var xls = json2xls(json);
    fs.writeFileSync('data.xlsx', xls, 'binary');
});
