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
  this.tmpCofigDataTbl = {};
  this.cofigDataTbl = {};
  this.titleIdx = 0;
  this.rowIdx = 0;
  this.titlesParsers = {};
  this.rowsParsers = {};

  if(!this.parseParams.titles || !this.parseParams.rows) {
    logger.error('parseParams is invalid!');
    return;
  }

  if(!fs.existsSync(this.dir)) {
    logger.error('Dir %s not exist!', this.dir);
    return;
  }
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
  var curFileIdx = path.basename(filename, '.json');
  self.tmpCofigDataTbl[curFileIdx] = {};
  var fsStream = fs.createReadStream(filename, {encoding: 'utf8'});

  self.titleIdx = 0;
  self.titlesParsers[curFileIdx] = JSONStream.parse([self.parseParams.titles, true]);
  self.titlesParsers[curFileIdx].on('data', function(data) {
    console.log('titlesParser ~ data:', data);
    var tbl = self.tmpCofigDataTbl[curFileIdx];
    if(tbl) {
      tbl[TITLES] = tbl[TITLES] || {};
      tbl[TITLES][self.titleIdx++] = data;
    }
  });
  self.titlesParsers[curFileIdx].on('root', function(root, count) {
    console.log('titlesParsers ~ on.root is running ...');
    if (!count) {
      console.error('%s is empty file.', filename);
    } else {
      self.cofigDataTbl[curFileIdx] = self.cofigDataTbl[curFileIdx] || {};
      self.cofigDataTbl[curFileIdx][TITLES] = self.tmpCofigDataTbl[curFileIdx][TITLES];
    }
  });
  fsStream.pipe(self.titlesParsers[curFileIdx]);

  self.rowIdx = 0;
  self.rowsParsers[curFileIdx] = JSONStream.parse([self.parseParams.rows, true]);
  self.rowsParsers[curFileIdx].on('data', function(data) {
    console.log('rowsParser ~ data:', data);
    var tbl = self.tmpCofigDataTbl[curFileIdx];
    if(tbl) {
      tbl[ROWS] = tbl[ROWS] || {};
      tbl[ROWS][self.rowIdx++] = data;
    }
  });
  self.rowsParsers[curFileIdx].on('root', function(root, count) {
    console.log('rowsParsers ~ on.root is running ...');
    if (!count) {
      console.error('%s is empty file.', filename);
    } else {
      self.cofigDataTbl[curFileIdx] = self.cofigDataTbl[curFileIdx] || {};
      self.cofigDataTbl[curFileIdx][ROWS] = self.tmpCofigDataTbl[curFileIdx][ROWS];
    }
  });
  fsStream.pipe(self.rowsParsers[curFileIdx]);
};

Component.prototype.listener4watch = function(filename) {
  var self = this;
  return function(curr, prev) {
    if(curr.mtime.getTime() > prev.mtime.getTime()) {
      self.loadFileFunc(filename);

      setTimeout(function() {
    console.warn('\n', Date(), ': Listener4watch ~ cofigDataTbl = ', util.inspect(self.cofigDataTbl, {showHidden: true, depth: null, color: true}))
  }, 2000);
    }
  };
};

Component.prototype.loadAll = function(cb) {
  var self = this;
  self.tmpCofigDataTbl = {};
  self.cofigDataTbl = {};

  fs.readdirSync(self.dir).forEach(function(filename) {
    if (!/\.json$/.test(filename)) {
      return;
    }
    var absolutePath = path.join(self.dir, filename);
    if(!fs.existsSync(absolutePath)) {
      logger.error('Config file %s not exist at %s!', filename, absolutePath);
    } else {
      console.warn('!!! filename = %s, absolutePath = %s', filename, absolutePath);
      self.loadFileFunc(absolutePath);
      fs.watchFile(absolutePath, { persistent: true, interval: self.interval }, self.listener4watch(absolutePath));
    }
  });

  utils.invokeCallback(cb);

  setTimeout(function() {
    console.warn('\ncofigDataTbl = ', util.inspect(self.cofigDataTbl, {showHidden: true, depth: null, color: true}))
  }, 2000);
};

