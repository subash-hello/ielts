const data = require('./scrapedTests.json'); console.log(Object.keys(data).map(k => k + ': ' + data[k].title).join('\n'));
