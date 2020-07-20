'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _processTeX = require('../mathjax/processTeX');

var _processTeX2 = _interopRequireDefault(_processTeX);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * React component to render maths using mathjax
 */
var MathJaxNode = function (_Component) {
  _inherits(MathJaxNode, _Component);

  function MathJaxNode(props) {
    _classCallCheck(this, MathJaxNode);

    var _this = _possibleConstructorReturn(this, (MathJaxNode.__proto__ || Object.getPrototypeOf(MathJaxNode)).call(this, props));

    _this.timeout = props.timeout;
    _this.annul = null;
    _this.state = { ready: window.MathJax && window.MathJax.ready };
    return _this;
  }

  _createClass(MathJaxNode, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      if (this.state.ready) this.typeset();else {
        var check = this.props.check;

        this.annul = setInterval(function () {
          if (window.MathJax && window.MathJax.isReady) {
            _this2.setState({ ready: true });
            clearInterval(_this2.annul);
          } else {
            if (_this2.timeout < 0) {
              clearInterval(_this2.annul);
            }
            _this2.timeout -= check;
          }
        }, check);
      }
    }

    /**
     * Prevent update when the tex has not changed
     */

  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return nextProps.children !== this.props.children || nextProps.inline !== this.props.inline || nextState.ready !== this.state.ready;
    }

    /**
     * Update the jax, force update if the display mode changed
     */

  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      var forceUpdate = prevProps.inline !== this.props.inline;
      this.typeset(forceUpdate);
    }

    /**
     * Clear the math when unmounting the node
     */

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      clearInterval(this.annul);
      this.clear();
    }

    /**
     * Create a script
     * @param  {String} text
     * @return {DOMNode} script
     */

  }, {
    key: 'setScriptText',
    value: function setScriptText(text) {
      var inline = this.props.inline;


      if (!this.script) {
        this.script = document.createElement('script');
        this.script.type = 'math/tex; ' + (inline ? '' : 'mode=display');
        this.node.appendChild(this.script);
      }

      if ('text' in this.script) {
        // IE8, etc
        this.script.text = text;
      } else {
        this.script.textContent = text;
      }

      return this.script;
    }

    /**
     * Clear the jax
     */

  }, {
    key: 'clear',
    value: function clear() {
      var MathJax = window.MathJax;

      if (!this.script || !MathJax || !MathJax.isReady) {
        return;
      }

      var jax = MathJax.Hub.getJaxFor(this.script);
      if (jax) {
        jax.Remove();
      }
    }

    /**
     * Update math in the node.
     * @param {Boolean} forceUpdate
     */

  }, {
    key: 'typeset',
    value: function typeset(forceUpdate) {
      var _this3 = this;

      var MathJax = window.MathJax;
      var _props = this.props,
          children = _props.children,
          onRender = _props.onRender;


      var text = children;

      if (forceUpdate) {
        this.clear();
      }

      if (!forceUpdate && this.script) {
        MathJax.Hub.Queue(function () {
          var jax = MathJax.Hub.getJaxFor(_this3.script);

          if (jax) jax.Text(text, onRender);else {
            var script = _this3.setScriptText(text);
            (0, _processTeX2.default)(MathJax, script, onRender);
          }
        });
      } else {
        var script = this.setScriptText(text);
        MathJax.Hub.Queue(function () {
          return (0, _processTeX2.default)(MathJax, script, onRender);
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      if (this.state.ready) {
        return _react2.default.createElement('span', { ref: function ref(node) {
            _this4.node = node;
          } });
      }
      return _react2.default.createElement(
        'span',
        { style: { color: 'red' } },
        this.props.children
      );
    }
  }]);

  return MathJaxNode;
}(_react.Component);

MathJaxNode.defaultProps = {
  inline: false,
  onRender: function onRender() {},
  timeout: 10000,
  check: 50
};

exports.default = MathJaxNode;