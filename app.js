var fs = require('fs'),
  http = require('http'),
  path = require('path'),
  handlebars = require('handlebars'),
  caser = require('change-case'),
  Inliner = require('inliner');

// Load templates
var index = handlebars.compile(fs.readFileSync('index.html.hbs', 'utf-8')),
  review = handlebars.compile(fs.readFileSync('review.html.hbs', 'utf-8'));

var dir = process.argv[2],
  project = process.argv[3],
  files = {};

fs.readdirSync(dir).forEach(function(filename, idx) {
  if (filename.indexOf('.java') == filename.length - 5) {
    files[idx] = filename;
  }
});

var server = http.createServer(function(req, res) {
  console.log(req.method + " " + req.url);
  switch (req.method) {
    case 'GET':  
      handleGet(req, res);
      break;
    case 'POST':
      handlePost(req, res);
      break;
  }
});

function handleGet(req, res) {
  if (req.url.indexOf('/review/') == 0) {
    var id = req.url.substring('/review/'.length);
    var filename = files[id];
    res.end(review({
      code: fs.readFileSync(path.join(dir, filename)),
      project: project,
      student: getStudentName(filename),
      commenting: true,
      id: id,
      comments: "\"{}\""
    }));
  } else {
    res.end(index({ files: files }));    
  }
}

server.listen(8080, function(err) {
  console.log("Open your browser to http://localhost:8080");
});

function handlePost(req, res) {
  var comments = "";
  req.on('data', function(chunk) {
    comments += chunk;
  });

  req.on('end', function() {
    var id = req.url.substring('/review/'.length);
    var filename = files[id];
    fs.writeFileSync(path.join(dir, filename + '.html'), review({
      code: fs.readFileSync(path.join(dir, filename)),
      project: project,
      student: getStudentName(filename),
      commenting: false,
      id: id,
      comments: JSON.stringify(comments)
    }));
    res.end();

    // new Inliner(path.join(dir, filename + '.html'), { collapseWhitespace: false }, 
    //   function(err, html) {
    //     fs.writeFileSync(path.join(dir, filename + '.html'), html);
    // });
  });
}

function getStudentName(filename) {
  return caser.titleCase(filename.split('_')[0]);
}