(function () {
	'use strict';

	var Logger=function(){function n(){}return n.init=function(o){n._plugin=o;},n.log=function(o){n._plugin.broadcastMessage("log",o);},n.error=function(o){n._plugin.broadcastMessage("error",o);},n}();

	var __extends=this&&this.__extends||function(){var t=function(r,e){return t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,r){t.__proto__=r;}||function(t,r){for(var e in r)Object.prototype.hasOwnProperty.call(r,e)&&(t[e]=r[e]);},t(r,e)};return function(r,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function o(){this.constructor=r;}t(r,e),r.prototype=null===e?Object.create(e):(o.prototype=e.prototype,new o);}}();var Plugin=function(t){function r(){var r=null!==t&&t.apply(this,arguments)||this;return r._iframeInfo=null,r}return __extends(r,t),r.prototype.onLoad=function(t,r){Logger.init(this);try{if(!r.isLocal)throw new Error("This is works only for local");this._iframeInfo=r.iframe;}catch(t){Logger.error("".concat(t.message,"\n").concat(t.stack));}},r.prototype.onMessage=function(t,r){for(var e=[],o=2;o<arguments.length;o++)e[o-2]=arguments[o];if(null!==this._iframeInfo&&"clean"===r){var n=e[0],i=e[1];if(!Number.isInteger(n)||!Number.isInteger(i))return;for(var s=this._iframeInfo.x-n;s<this._iframeInfo.x+n;s++)for(var f=this._iframeInfo.y-i;f<this._iframeInfo.y+i;f++)this.deleteTile(s,f,!1),this.deleteTile(s,f,!0),this.setCollider(s,f,!1);}},r}(BasePlugin);globalThis.PluginImpl=Plugin;

}());
