'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = load;
function load(src, cb) {
  var head = document.head || document.getElementsByTagName('head')[0];
  var script = document.createElement('script');

  script.type = 'text/javascript';
  script.async = true;
  script.src = src;

  if (cb) {
    script.onload = function () {
      script.onerror = null;
      script.onload = null;
      cb(null, script);
    };
    script.onerror = function () {
      script.onerror = null;
      script.onload = null;
      cb(new Error('Failed to load ' + src), script);
    };
  }

  head.appendChild(script);
}