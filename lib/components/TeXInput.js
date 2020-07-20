'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _isAlpha = function _isAlpha(key) {
  return key.length === 1 && /[a-z]/.test(key.toLowerCase());
};

function indent(_ref) {
  var text = _ref.text,
      start = _ref.start,
      end = _ref.end;
  var unindent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var nl0 = text.slice(0, start).split('\n').length - 1;
  var nl1 = nl0 + (text.slice(start, end).split('\n').length - 1);
  var nStart = start;
  var nEnd = end;
  var nText = text.split('\n').map(function (l, i) {
    if (i < nl0 || i > nl1) {
      return l;
    }
    if (!unindent) {
      if (i === nl0) {
        nStart += 2;
      }
      nEnd += 2;
      return '  ' + l;
    }
    if (l.startsWith('  ')) {
      if (i === nl0) {
        nStart -= 2;
      }
      nEnd -= 2;
      return l.slice(2);
    }
    if (l.startsWith(' ')) {
      if (i === nl0) {
        nStart -= 1;
      }
      nEnd -= 1;
      return l.slice(1);
    }
    return l;
  }).join('\n');
  return { text: nText, start: nStart, end: nEnd };
}

var closeDelim = {
  '{': '}',
  '(': ')',
  '[': ']',
  '|': '|'
};

var TeXInput = function (_React$Component) {
  _inherits(TeXInput, _React$Component);

  function TeXInput(props) {
    _classCallCheck(this, TeXInput);

    var _this = _possibleConstructorReturn(this, (TeXInput.__proto__ || Object.getPrototypeOf(TeXInput)).call(this, props));

    var onChange = props.onChange,
        caretPosFn = props.caretPosFn;


    var pos = caretPosFn();
    _this.state = {
      start: pos,
      end: pos
    };

    _this.completionList = [];
    _this.index = 0;

    _this._onChange = function () {
      return onChange({
        teX: _this.teXinput.value
      });
    };

    _this._onSelect = function () {
      var _this$teXinput = _this.teXinput,
          start = _this$teXinput.selectionStart,
          end = _this$teXinput.selectionEnd;

      _this.setState({ start: start, end: end });
    };

    _this._moveCaret = function (offset) {
      var relatif = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var value = _this.props.teX;
      var _this$state = _this.state,
          start = _this$state.start,
          end = _this$state.end;


      if (start !== end) return;

      var newOffset = relatif ? start + offset : offset;
      if (newOffset < 0) {
        newOffset = 0;
      } else if (newOffset > value.length) {
        newOffset = value.length;
      }

      _this.setState({ start: newOffset, end: newOffset });
    };

    _this._insertText = function (text) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var value = _this.props.teX;
      var _this$state2 = _this.state,
          start = _this$state2.start,
          end = _this$state2.end;

      value = value.slice(0, start) + text + value.slice(end);
      start += text.length + offset;
      if (start < 0) {
        start = 0;
      } else if (start > value.length) {
        start = value.length;
      }
      end = start;
      onChange({ teX: value });
      _this.setState({ start: start, end: end });
    };

    _this.onBlur = function () {
      return _this.props.finishEdit();
    };

    _this.handleKey = _this.handleKey.bind(_this);
    return _this;
  }

  _createClass(TeXInput, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      var _state = this.state,
          start = _state.start,
          end = _state.end;

      setTimeout(function () {
        _this2.teXinput.focus();
        _this2.teXinput.setSelectionRange(start, end);
      }, 0);
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (this.props.teX !== nextProps.teX) {
        return true;
      }
      var start = nextState.start,
          end = nextState.end;
      var _teXinput = this.teXinput,
          selectionStart = _teXinput.selectionStart,
          selectionEnd = _teXinput.selectionEnd;

      if (start === selectionStart && end === selectionEnd) {
        return false;
      }
      return true;
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      var s = prevState.start,
          e = prevState.end;
      var _state2 = this.state,
          ns = _state2.start,
          ne = _state2.end;

      if (s !== ns || e !== ne) {
        this.teXinput.setSelectionRange(ns, ne);
      }
    }
  }, {
    key: 'handleKey',
    value: function handleKey(evt) {
      var _this3 = this;

      var _props = this.props,
          teX = _props.teX,
          finishEdit = _props.finishEdit,
          onChange = _props.onChange,
          displaystyle = _props.displaystyle,
          completion = _props.completion;
      var _state3 = this.state,
          start = _state3.start,
          end = _state3.end;

      var inlineMode = displaystyle !== undefined;
      var collapsed = start === end;
      var cplDisable = completion.status === 'none';
      var key = evt.key;

      if (!cplDisable && key !== 'Tab' && key !== 'Shift') {
        this.completionList = [];
        this.index = 0;
      }

      switch (key) {
        case '$':
          {
            if (inlineMode) {
              evt.preventDefault();
              onChange({ displaystyle: !displaystyle });
            }
            break;
          }
        case 'Escape':
          {
            evt.preventDefault();
            finishEdit(1);
            break;
          }
        case 'ArrowLeft':
          {
            var atBegin = collapsed && end === 0;
            if (atBegin) {
              evt.preventDefault();
              finishEdit(0);
            }
            break;
          }
        case 'ArrowRight':
          {
            var atEnd = collapsed && start === teX.length;
            if (atEnd) {
              evt.preventDefault();
              finishEdit(1);
            }
            break;
          }
        default:
          if (Object.prototype.hasOwnProperty.call(closeDelim, key)) {
            // insertion d'un délimiteur
            evt.preventDefault();
            this._insertText(key + closeDelim[key], -1);
          } else if (!cplDisable && (_isAlpha(key) && completion.status === 'auto' || key === 'Tab' && this.completionList.length > 1 || completion.status === 'manual' && evt.ctrlKey && key === ' ')) {
            // completion
            this._handleCompletion(evt);
          } else if (key === 'Tab') {
            // gestion de l'indentation
            var lines = teX.split('\n');
            if (inlineMode || lines.length <= 1) {
              // pas d'indentation dans ce cas
              evt.preventDefault();
              finishEdit(evt.shiftKey ? 0 : 1);
            } else {
              var _indent = indent({ text: teX, start: start, end: end }, evt.shiftKey),
                  text = _indent.text,
                  ns = _indent.start,
                  ne = _indent.end;

              evt.preventDefault();
              onChange({ teX: text });
              setTimeout(function () {
                return _this3.setState({
                  start: ns,
                  end: ne
                });
              }, 0);
            }
          }
      }
    }
  }, {
    key: '_handleCompletion',
    value: function _handleCompletion(evt) {
      var _this4 = this;

      var _props2 = this.props,
          completion = _props2.completion,
          teX = _props2.teX,
          onChange = _props2.onChange;
      var _state4 = this.state,
          start = _state4.start,
          end = _state4.end;

      var key = evt.key;
      var prefix = completion.getLastTeXCommand(teX.slice(0, start));
      var pl = prefix.length;
      var startCmd = start - pl;
      var isAlpha = _isAlpha(key);
      var ns = start;
      var offset = void 0;

      if (!pl) {
        return;
      }

      if (isAlpha || evt.ctrlKey && key === ' ') {
        this.completionList = completion.computeCompletionList(prefix + (isAlpha ? key : ''));
      }

      var L = this.completionList.length;
      if (L === 0) {
        return;
      } else if (L === 1) {
        // une seule possibilité: insertion!
        this.index = 0;
      } else if (key === 'Tab') {
        // Tab ou S-Tab: on circule...
        offset = evt.shiftKey ? -1 : 1;
        this.index += offset;
        this.index = this.index === -1 ? L - 1 : this.index % L;
      } else {
        // isAlpha est true et plusieurs completions possibles
        this.index = 0;
        ns = isAlpha ? ns + 1 : ns; // pour avancer après la lettre insérée le cas échéant
      }

      var cmd = this.completionList[this.index];
      var endCmd = startCmd + cmd.length;
      var teXUpdated = teX.slice(0, startCmd) + cmd + teX.slice(end);
      ns = L === 1 ? endCmd : ns;

      evt.preventDefault();
      onChange({ teX: teXUpdated });
      setTimeout(function () {
        return _this4.setState({
          start: ns,
          end: endCmd
        });
      }, 0);
    }

    // handleKey(evt) {
    //   const key = evt.key

    //   const { teX, finishEdit, onChange, displaystyle, completion } = this.props
    //   const { start, end } = this.state
    //   const inlineMode = displaystyle !== undefined

    //   const collapsed = start === end
    //   const atEnd = collapsed && teX.length === end
    //   const atBegin = collapsed && end === 0

    //   const ArrowLeft = key === 'ArrowLeft'
    //   const ArrowRight = key === 'ArrowRight'
    //   const Escape = key === 'Escape'
    //   const Tab = key === 'Tab'
    //   const Space = key === ' '
    //   const $ = key === '$'
    //   const Shift = evt.shiftKey
    //   const Ctrl = evt.ctrlKey
    // const isDelim = Object.prototype.hasOwnProperty
    //   .call(closeDelim, key)

    //   const toggleDisplaystyle = $ && inlineMode

    //   const findCompletion = Tab && this.completionList.length > 1
    //   const launchCompletion = Ctrl && Space
    //   const isAlpha = key.length === 1 &&
    //     /[a-z]/.test(key.toLowerCase())

    //   // sortie du mode édition
    //   if ((
    //     ArrowLeft && atBegin
    //   ) || (
    //     ArrowRight && atEnd
    //   ) || (
    //     Tab && this.completionList.length === 0
    //   ) || (
    //     Escape
    //   )) {
    //     evt.preventDefault()
    //     finishEdit(ArrowLeft ? 0 : 1)
    //   }

    //   if (toggleDisplaystyle) {
    //     evt.preventDefault()
    //     onChange({ displaystyle: !displaystyle })
    //   }

    //   // insertion d'un délimiteur
    //   if (isDelim) {
    //     evt.preventDefault()
    //     this._insertText(key + closeDelim[key], -1)
    //   }

    //   // completion
    //   if (!findCompletion) {
    //     this.index = 0
    //     this.completionList = []
    //   }
    //   if (
    //     completion.status !== 'none' &&
    //     (
    //       (isAlpha && completion.status === 'auto') ||
    //       launchCompletion ||
    //       findCompletion
    //     )
    //   ) {
    //     const prefix = getLastTeXCommand(teX.slice(0, start))
    //     const pl = prefix.length
    //     const startCmd = start - pl
    //     let ns = start
    //     let offset

    //     if (!pl) { return }

    //     if (isAlpha || launchCompletion) {
    //       this.completionList = computeCompletionList(
    //         prefix + (launchCompletion ? '' : key),
    //         this.teXCommands,
    //         this.mostUsedCommands,
    //       )
    //     }

    //     const L = this.completionList.length
    //     if (L === 0) {
    //       return
    //     } else if (L === 1) {
    //       // une seule possibilité: insertion!
    //       this.index = 0
    //     } else if (findCompletion) {
    //       // Tab ou S-Tab: on circule...
    //       offset = Shift ? -1 : 1
    //       this.index += offset
    //       this.index = (this.index === -1) ? L - 1 : this.index % L
    //     } else {
    //       // isAlpha est true et plusieurs completions possibles
    //       this.index = 0
    //       ns = isAlpha ? ns + 1 : ns // pour avancer après la lettre insérée le cas échéant
    //     }

    //     const cmd = this.completionList[this.index]
    //     const endCmd = startCmd + cmd.length
    //     const teXUpdated = teX.slice(0, startCmd) +
    //       cmd + teX.slice(end)
    //     ns = L === 1 ? endCmd : ns

    //     evt.preventDefault()
    //     onChange({ teX: teXUpdated })
    //     setTimeout(() => this.setState({
    //       start: ns,
    //       end: endCmd,
    //     }), 0)
    //   }
    // }

  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      var _props3 = this.props,
          teX = _props3.teX,
          className = _props3.className,
          style = _props3.style;

      var teXArray = teX.split('\n');
      var rows = teXArray.length;
      var cols = teXArray.map(function (tl) {
        return tl.length;
      }).reduce(function (acc, size) {
        return size > acc ? size : acc;
      }, 1);
      return _react2.default.createElement('textarea', {
        rows: rows,
        cols: cols,
        className: className,
        value: teX,
        onChange: this._onChange,
        onSelect: this._onSelect,
        onBlur: this.onBlur,
        onKeyDown: this.handleKey,
        ref: function ref(teXinput) {
          _this5.teXinput = teXinput;
        },
        style: style
      });
    }
  }]);

  return TeXInput;
}(_react2.default.Component);

exports.default = TeXInput;