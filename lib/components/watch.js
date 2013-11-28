var util = require('util');
var utils = require('../util/utils');
var EventEmitter = require('events').EventEmitter;
var logger = require('pomelo-logger').getLogger('pomelo-data', __filename);

module.exports = function(app, opts) {
	var component =  new Component(app, opts);
	return component;
};

var Component = function(app, opts) {
  this.app = app;
  var self = this;

};

util.inherits(Component, EventEmitter);

Component.prototype.start = function(cb) {
  var self = this;

};

Component.prototype.stop = function(force, cb) {
  utils.invokeCallback(cb);

};

