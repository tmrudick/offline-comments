var fs = require('fs'),
  http = require('http'),
  path = require('path'),
  handlebars = require('handlebars');

// Load templates
var index = handlebars.compile(fs.readFileSync('index.html.hbs', 'utf-8'));

var dir = process.argv[2],
  project = process.argv[3],
  files = {};

fs.readdirSync(dir).forEach(function(filename, idx) {
  if (filename.indexOf('.java') > 0) {
    files[idx] = filename;
  }
});

var server = http.createServer(function(req, res) {
  console.log(req.method + " " + req.url);
  if (req.url.indexOf('/review/') == 0) {
    var id = req.url.substring('/review/'.length);
    var contents = fs.readFileSync(path.join(dir, files[id]));
    res.end(contents);
  } else {
    res.end(index({files:files}));    
  }
})

server.listen(8080, function(err) {
  console.log("Open your browser to http://localhost:8080");
});