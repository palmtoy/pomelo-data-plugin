var fs = require('fs');
var JSONStream = require('JSONStream');
var path = require('path');
var util = require('util');
var utils = require('../util/utils');
var EventEmitter = require('events').EventEmitter;
var instance = null;
var logger = require('pomelo-logger').getLogger('pomelo-data', __filename);

var TITLES = 'titles'
  , ROWS = 'rows';

module.exports = function(app, opts) {
  // singleton
  if(instance) {
    return instance;
  }

	instance = new Component(app, opts);
  app.set('dataService', instance);
  // var area = app.get('dataService').get('area');
	return instance;
};

var Component = function(app, opts) {
  var self = this;
  this.app = app;
  this.dir = opts.dir;
  this.refreshTime = opts.refreshTime;
  this.parseParams = opts.parseParams;
  this.cofigDataTbl = {};
  this.curFileIdx = '';
  this.titleIdx = 0;
  this.rowIdx = 0;

  if(!this.parseParams.titles || !this.parseParams.rows) {
    logger.error('parseParams is invalid!');
    return;
  }

  if(!fs.existsSync(this.dir)) {
    logger.error('Dir %s not exist!', this.dir);
    return;
  } else {
    self.loadAll();
  }

  this.titlesParser = JSONStream.parse([this.parseParams.titles, true]);
  this.rowsParser = JSONStream.parse([this.parseParams.rows, true]);

  this.titlesParser.on('data', function(data) {
    console.log('titlesParser.on:data is running ...');
    console.log('received:', data);
    var tbl = self.cofigDataTbl[self.curFileIdx];
    if(tbl) {
      tbl[TITLES] = tbl[TITLES] || {};
      tbl[TITLES][self.titleIdx++] = data;
    }
  });

  this.rowsParser.on('data', function(data) {
    console.log('rowsParser.on:data is running ...');
    console.log('received:', data);
    var tbl = self.cofigDataTbl[self.curFileIdx];
    if(tbl) {
      tbl[ROWS] = tbl[ROWS] || {};
      tbl[ROWS][self.rowIdx++] = data;
    }
  });
};

util.inherits(Component, EventEmitter);

Component.prototype.listener4watch = function(event, filename) {
  var self = this;
  logger.info('event is: ' + event);
  if (filename) {
    logger.info('dataService: filename provided: ' + filename);
     self.loadFileFunc(filename);
  } else {
    logger.warn('dataService: filename not provided!');
    self.loadAll(true);
  }
};

Component.prototype.start = function(cb) {
  var self = this;
  fs.watch(this.dir, this.listener4watch);
  // setInterval(callback, delay, [arg], [...]);
  utils.invokeCallback(cb);
};

Component.prototype.stop = function(cb) {
  var self = this;
  utils.invokeCallback(cb);
};

Component.prototype.loadFileFunc = function(filename) {
  var self = this;
  if (!/\.json$/.test(filename)) {
    return;
  }
  var absolutePath = path.join(self.dir, filename);
  if(!fs.existsSync(absolutePath)) {
    logger.error('Config file %s not exist at %s!', filename, absolutePath);
  } else {
    self.curFileIdx = path.basename(filename, '.json');
    self.cofigDataTbl[self.curFileIdx] = {};
    var fsStream = fs.createReadStream(filename, {encoding: 'utf8'});

    self.titleIdx = 0;
    fsStream.pipe(self.titlesParser);

    self.rowIdx = 0;
    fsStream.pipe(self.rowsParser);
  }
}

Component.prototype.loadAll = function(isAsync) {
  var self = this;
  self.cofigDataTbl = {};

  if(isAsync) {
    fs.readdir(self.dir, function(err, files) {
      if(!err) {
        files.forEach(self.loadFileFunc);
      }
    });
  } else {
    fs.readdirSync(self.dir).forEach(self.loadFileFunc);
  }
};

