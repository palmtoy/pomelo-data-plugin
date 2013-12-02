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
  this.interval = opts.interval;
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
  }

  this.titlesParser = JSONStream.parse([this.parseParams.titles, true]);
  this.rowsParser = JSONStream.parse([this.parseParams.rows, true]);

  this.titlesParser.setMaxListeners(0);
  this.titlesParser.on('data', function(data) {
    // console.log('titlesParser.on:data is running ...');
    // console.log('received:', data);
    var tbl = self.cofigDataTbl[self.curFileIdx];
    if(tbl) {
      tbl[TITLES] = tbl[TITLES] || {};
      tbl[TITLES][self.titleIdx++] = data;
    }
  });

  this.rowsParser.setMaxListeners(0);
  this.rowsParser.on('data', function(data) {
    // console.log('rowsParser.on:data is running ...');
    // console.log('received:', data);
    var tbl = self.cofigDataTbl[self.curFileIdx];
    if(tbl) {
      tbl[ROWS] = tbl[ROWS] || {};
      tbl[ROWS][self.rowIdx++] = data;
    }
  });
};

util.inherits(Component, EventEmitter);

Component.prototype.start = function(cb) {
  var self = this;
  self.loadAll(cb);
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
    // console.warn('!!! filename = ', filename);
    self.curFileIdx = path.basename(filename, '.json');
    self.cofigDataTbl[self.curFileIdx] = {};
    var fsStream = fs.createReadStream(filename, {encoding: 'utf8'});

    self.titleIdx = 0;
    fsStream.pipe(self.titlesParser);

    self.rowIdx = 0;
    fsStream.pipe(self.rowsParser);
  }
}

Component.prototype.listener4watch = function(filename) {
  var self = this;
  return function(curr, prev) {
    if(curr.mtime.getTime() > prev.mtime.getTime()) {
      self.loadFileFunc(filename);
    }
  };
};

Component.prototype.loadAll = function(cb) {
  var self = this;
  self.cofigDataTbl = {};

  fs.readdirSync(self.dir).forEach(function(filename) {
    self.loadFileFunc(filename);
    fs.watchFile(filename, { persistent: true, interval: self.interval }, self.listener4watch(filename));
  });

  utils.invokeCallback(cb);

  console.warn('cofigDataTbl = ', util.inspect(self.cofigDataTbl, {showHidden: true, depth: null, color: true}))
}

