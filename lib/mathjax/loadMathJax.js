'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _load = require('./load');

var _load2 = _interopRequireDefault(_load);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// mathjax cdn shutdown the 30/04/2017!!! https://cdn.mathjax.org/mathjax/latest/MathJax.js
var DEFAULT_SCRIPT = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js'; // const loadScript = require('load-script')


var DEFAULT_OPTIONS = {
  jax: ['input/TeX', 'output/CommonHTML'],
  TeX: {
    extensions: ['autoload-all.js']
  },
  messageStyles: 'none',
  showProcessingMessages: false,
  showMathMenu: false,
  showMathMenuMSIE: false,
  preview: 'none',
  delayStartupTypeset: true
};

var loadMathJax = function loadMathJax(_ref) {
  var Macros = _ref.macros,
      script = _ref.script,
      mathjaxConfig = _ref.mathjaxConfig;

  var config = {};
  config.script = script || DEFAULT_SCRIPT;
  config.options = mathjaxConfig || DEFAULT_OPTIONS;
  if (config.options.TeX === undefined) {
    config.options.TeX = {};
  }
  var TeX = Object.assign(config.options.TeX, { Macros: Macros });
  config.options = Object.assign(config.options, { TeX: TeX });

  if (window.MathJax) {
    window.MathJax.Hub.Config(config.options);
    window.MathJax.Hub.processSectionDelay = 0;
    return;
  }
  (0, _load2.default)(config.script, function (err) {
    if (!err) {
      window.MathJax.Hub.Config(config.options);
      // avoid flickering of the preview
      window.MathJax.Hub.processSectionDelay = 0;
    }
  });
};

exports.default = loadMathJax;