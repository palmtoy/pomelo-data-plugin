var fs = require('fs');
var JSONStream = require('JSONStream');
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

var listener4watch = function(event, filename) {
  logger.info('event is: ' + event);
  if (filename) {
    logger.info('dataService: filename provided: ' + filename);

  } else {
    logger.warn('dataService: filename not provided!');

  }
};

var reloadFileCb = function(event, filename) {
  logger.info('event is: ' + event);
  if (filename) {
    logger.info('dataService: filename provided: ' + filename);

  } else {
    logger.warn('dataService: filename not provided!');

  }
};

var Component = function(app, opts) {
  var self = this;
  this.app = app;
  this.dir = opts.dir;
  this.refreshTime = opts.refreshTime;
  this.parseParams = opts.parseParams;

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

  fs.watch(opts.dir, listener4watch);
};

util.inherits(Component, EventEmitter);

Component.prototype.start = function(cb) {
  var self = this;

};

Component.prototype.stop = function(force, cb) {
  utils.invokeCallback(cb);

};

Component.prototype.loadAll = function() {
  fs.readdirSync(this.dir).forEach(function (filename) {
    if (!/\.json$/.test(filename)) {
      return;
    }
    var absolutePath = path.join(dir, filename);
    if(!fs.existsSync(absolutePath)) {
      logger.error('Config file %s not exist at %s!', filename, absolutePath);
    } else {

    }
  });
};
