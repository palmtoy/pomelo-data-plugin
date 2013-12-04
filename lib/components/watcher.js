var fs = require('fs');
var csv = require('csv');
var path = require('path');
var util = require('util');
var utils = require('../util/utils');
var EventEmitter = require('events').EventEmitter;
var instance = null;
var logger = require('pomelo-logger').getLogger('pomelo-data', __filename);


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
  this.app = app;
  this.dir = opts.dir;
  this.interval = opts.interval;
  this.parseParams = opts.parseParams;
  this.tmpCofigDataTbl = {};
  this.cofigDataTbl = {};
  this.csvParsers = {};

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
  this.loadAll(cb);
};

Component.prototype.stop = function(cb) {
  this.tmpCofigDataTbl = null;
  this.cofigDataTbl = null;
  this.csvParsers = null;
  utils.invokeCallback(cb);
};

/**
 * map the array data to object
 *
 * @param {Array}
 * @return {Object} result
 * @api private
 */
var mapData = function(data) {
  var fields = {};
  data[0].forEach(function(k, v) {
    fields[k] = v;
  });
  data.splice(0, 1);

  var result = {};
  data.forEach(function(item) {
    var obj = {};
    for (var k in fields) {
      obj[k] = item[fields[k]];
    }
    result[obj.id] = obj;
  });

  return result;
};

Component.prototype.loadFileFunc = function(filename) {
  var self = this;
  var curFileIdx = path.basename(filename, '.json');
  self.tmpCofigDataTbl[curFileIdx] = [];

  self.csvParsers[curFileIdx] = csv();
  var tmpParser = self.csvParsers[curFileIdx];

  tmpParser.from.path(filename, {comment: '#'});

  tmpParser.on('record', function(row, index){
    console.log('#' + index + ' ' + JSON.stringify(row));
    var tmpL = self.tmpCofigDataTbl[curFileIdx];
    if(tmpL) {
      tmpL.push(row);
    }
  });

  tmpParser.on('end', function(){
    console.log('csvParsers ~ on.end is running ...');
    self.cofigDataTbl[curFileIdx] = mapData(self.tmpCofigDataTbl[curFileIdx]);
  });

  tmpParser.on('error', function(err){
    console.error(err.message);
  });
};

Component.prototype.listener4watch = function(filename) {
  var self = this;
  return function(curr, prev) {
    if(curr.mtime.getTime() > prev.mtime.getTime()) {
      self.loadFileFunc(filename);

      setTimeout(function() {
    console.warn('\n', Date(), ': Listener4watch ~ cofigDataTbl = ', util.inspect(self.cofigDataTbl, {showHidden: true, depth: null}))
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
    console.warn('\n', Date(), ': LoadAll ~ cofigDataTbl = ', util.inspect(self.cofigDataTbl, {showHidden: true, depth: null}))
  }, 2000);
};

