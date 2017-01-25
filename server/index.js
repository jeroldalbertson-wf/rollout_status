var express = require('express');
var requestLib = require('request');
var vm = require('vm');

var app = express();

app.use(function(req, res, next) {
  // Add CORS response headers for each request.
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (request, response) {
  response.send('Rollout status server is running!');
});

app.get('/get_deps', function(request, response) {
  var deployUrl = request.query.deploy;
  if (!deployUrl) {
    response.status(400).json({'error': 'must supply ?deploy in query string'});
    return;
  }

  var requestUrl;
  if (deployUrl == 'https://wk-dev.wdesk.org' 
      || deployUrl == 'https://sandbox.wdesk.com'
      || deployUrl == 'https://app.wdesk.com') {
    // Special-case deployments hosted on bigsky.
    requestUrl = deployUrl + '/a/null/js/environment_settings.js';
  } else {
    // All gen2 deployments follow this pattern.
    requestUrl = deployUrl + '/js/environment_settings.js';
  }

  console.log('requesting url: ' + requestUrl);
  requestLib(requestUrl, function (error, resp, body) {
    if (!error && resp.statusCode == 200) {
      // Safer alternative to eval() :)
      var script = new vm.Script(body);
      var envSettingsJs = {};
      script.runInNewContext(envSettingsJs);

      response.json(envSettingsJs.workiva.wdesk.dependencies);
    } else {
      response.status(500).json({'error': error});
    }
  });
});

app.listen(3000, function () {
  console.log('Server listening on port 3000!')
});
