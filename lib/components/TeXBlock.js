'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _MathJaxNode = require('./MathJaxNode');

var _MathJaxNode2 = _interopRequireDefault(_MathJaxNode);

var _TeXInput = require('./TeXInput');

var _TeXInput2 = _interopRequireDefault(_TeXInput);

var _utils = require('../modifiers/utils');

var _styles = require('./styles');

var _styles2 = _interopRequireDefault(_styles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var styles = _styles2.default.block;

var TeXBlock = function (_Component) {
  _inherits(TeXBlock, _Component);

  function TeXBlock(props) {
    _classCallCheck(this, TeXBlock);

    var _this = _possibleConstructorReturn(this, (TeXBlock.__proto__ || Object.getPrototypeOf(TeXBlock)).call(this, props));

    _this.state = _this.getInitialState();

    _this._update = function (key) {
      if (_this.state.editMode) {
        return;
      }
      var store = _this.props.blockProps.getStore();

      _this.setState({ editMode: true }, function () {
        store.setReadOnly(true);
        if (key) {
          store.teXToUpdate = {};
        }
      });
    };

    _this.onChange = function (_ref) {
      var teX = _ref.teX;

      _this.setState({ teX: teX });
    };

    _this.save = function (after) {
      _this.setState({ editMode: false }, function () {
        var store = _this.props.blockProps.getStore();
        var teX = _this.state.teX;
        var _this$props = _this.props,
            contentState = _this$props.contentState,
            block = _this$props.block;

        store.completion.updateMostUsedTeXCmds(teX, block.getData().teX);
        (0, _utils.finishEdit)(store).apply(undefined, _toConsumableArray((0, _utils.saveTeX)({
          after: after,
          contentState: contentState,
          teX: teX,
          block: block
        })));
      });
    };

    _this.getCaretPos = function () {
      var dir = _this.props.blockProps.getStore().teXToUpdate.dir;

      if (!dir || dir === 'l') {
        return _this.state.teX.length;
      }
      return 0;
    };
    return _this;
  }

  _createClass(TeXBlock, [{
    key: 'getInitialState',
    value: function getInitialState() {
      var block = this.props.block;

      var teX = block.getData().get('teX');
      return { editMode: teX.length === 0, teX: teX };
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      var store = this.props.blockProps.getStore();
      if (this.state.editMode) {
        store.setReadOnly(true);
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var key = nextProps.blockProps.getStore().teXToUpdate.key;

      if (key === nextProps.block.getKey()) {
        this._update(key);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _state = this.state,
          editMode = _state.editMode,
          teX = _state.teX,
          displaystyle = _state.displaystyle;


      var store = this.props.blockProps.getStore();
      var completion = store.completion;

      var input = null;
      if (editMode) {
        // className={'TeXBlock-edit'}
        input = _react2.default.createElement(_TeXInput2.default, {
          onChange: this.onChange,
          teX: teX,
          displaystyle: displaystyle,
          finishEdit: this.save,
          completion: completion,
          caretPosFn: this.getCaretPos,
          style: styles.edit
        });
      }

      var rendered = _react2.default.createElement(
        _MathJaxNode2.default,
        null,
        teX
      );

      var style = styles[editMode ? 'preview' : 'rendered'];
      return _react2.default.createElement(
        'div',
        {
          style: { position: editMode ? 'relative' : undefined
          }
        },
        input,
        _react2.default.createElement(
          'div',
          {
            onMouseDown: function onMouseDown() {
              return _this2._update();
            },
            style: style
          },
          rendered
        )
      );
    }
  }]);

  return TeXBlock;
}(_react.Component);

exports.default = TeXBlock;