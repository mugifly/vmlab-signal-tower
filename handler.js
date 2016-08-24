/**
 * Device Commands Handler for signaltower
 */

'use strict';

var PIN_RED = 2;
var PIN_YELLOW = 3;
var PIN_GREEN = 4;

var BLINK_INTERVAL_MSEC = 1000;

var exec = require('child_process').execSync;

var blinkMode = false;
var blinkFlag = false;
var signals = {
	red: false,
	green: false,
	yellow: false
};
	

/**
 * Constructor method
 * @param {Object} config         Configuration which read from config.json (Read only)
 * @param {Function} logger       Logger compatible with console object - Usage: logger.log(text)
 * @param {HandlerHelper} helper  Instance of HandlerHelper
 */
var CommandsHandler = function (config, logger, helper) {

	// Device configuration
	this.config = config;

	// Logger
	this.logger = logger;

	// Simple Key-Value Store - It can be read, write and sync with server
	this.kvs = helper.getPlugin('_kvs'); // The _(underscore) prefix means the core plugin.
	
	// Initialize
	exec('gpio -g mode ' + PIN_RED + ' out');
	exec('gpio -g mode ' + PIN_YELLOW + ' out');
	exec('gpio -g mode ' + PIN_GREEN + ' out');

	// Start the timer
	setInterval(this._applyPinStatuses, BLINK_INTERVAL_MSEC);
	
};


/**
* Set the signals
* @param  {Object} args         Arguments of the received command
* @param  {Function} cb_runner  Callback runner for response
* @return {Boolean} if returns true, handler indicates won't use the callback 
*/
CommandsHandler.prototype.setSignals = function (args, cb_runner) {
	
	blinkMode = args.blink;
	
	signals.red = args.red;
	signals.green = args.green;
	signals.yellow = args.yellow;
	
	if (!args.blink) this._applyPinStatuses();
	
	cb_runner.send(null, 'OKAY');
	
};


// ----


CommandsHandler.prototype._applyPinStatuses = function () {
	
	var self = this;

	var red = false, green = false, yellow = false;
	
	if (blinkMode) {
		blinkFlag = !blinkFlag;
		if (blinkFlag) {
			if (signals.red) red = true;
			if (signals.green) green = true;
			if (signals.yellow) yellow = true;
		}
	} else {
		red = signals.red;
		green = signals.green;
		yellow = signals.yellow;
	}

        
	if (red) {
		exec('gpio -g write ' + PIN_RED + ' 1');
	} else {
		exec('gpio -g write ' + PIN_RED + ' 0');
	}
	
        if (green) {
		exec('gpio -g write ' + PIN_GREEN + ' 1');
	} else {
		exec('gpio -g write ' + PIN_GREEN + ' 0');
	}
	
        if (yellow) {
		exec('gpio -g write ' + PIN_YELLOW + ' 1');
	} else {
		exec('gpio -g write '  + PIN_YELLOW + ' 0');
	}
	
};


// ----

module.exports = CommandsHandler;
