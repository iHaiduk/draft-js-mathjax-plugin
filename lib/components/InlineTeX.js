'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var styles = _styles2.default.inline;

var InlineTeX = function (_Component) {
  _inherits(InlineTeX, _Component);

  function InlineTeX(props) {
    _classCallCheck(this, InlineTeX);

    var _this = _possibleConstructorReturn(this, (InlineTeX.__proto__ || Object.getPrototypeOf(InlineTeX)).call(this, props));

    _this.state = _this.getInitialState();

    _this._update = function (key) {
      if (_this.state.editMode) return;
      var store = _this.props.getStore();
      _this.setState({ editMode: true }, function () {
        store.setReadOnly(true);
        if (key) {
          store.teXToUpdate = {};
        }
      });
    };

    _this.onChange = function (newState) {
      var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

      // Ne serait-ce pas mieux (plus simple) que l'entité
      // porte l'état du composant (sauf editMode) ?
      // Nécessite une grosse reprise du code...

      // const {editMode, ...data} = newState
      // const {
      //   getEditorState: get,
      //   setEditorState: set,
      //   entityKey: ek
      // } = this.props
      // const es = get()
      // const cs = es.getCurrentContent()
      // set(EditorState.set(es, {
      //   currentContent: cs.mergeEntityData(
      //     ek, data
      //   )
      // }))

      _this.setState(newState, cb);
    };

    _this.getCaretPos = function () {
      var dir = _this.props.getStore().teXToUpdate.dir;

      if (!dir || dir === 'l') {
        return _this.state.teX.length;
      }
      return 0;
    };

    _this.save = function (after) {
      _this.setState({ editMode: false }, function () {
        var store = _this.props.getStore();
        var _this$state = _this.state,
            teX = _this$state.teX,
            displaystyle = _this$state.displaystyle;
        var _this$props = _this.props,
            entityKey = _this$props.entityKey,
            offsetKey = _this$props.offsetKey,
            children = _this$props.children;

        var contentState = _this.getCurrentEditorContent();
        store.completion.updateMostUsedTeXCmds(teX, contentState.getEntity(entityKey).getData().teX);
        (0, _utils.finishEdit)(store).apply(undefined, _toConsumableArray((0, _utils.saveTeX)(_extends({
          after: after,
          contentState: contentState,
          teX: teX,
          displaystyle: displaystyle,
          entityKey: entityKey,
          blockKey: offsetKey.split('-')[0]
        }, _react2.default.Children.map(children, function (c) {
          return {
            startPos: c.props.start
          };
        })[0])
        // ...React.Children.map(children, (c) => {
        //   debugger
        //   return {
        //     startPos: c.props.start,
        //   }
        // })[0],
        )));
      });
    };
    return _this;
  }

  _createClass(InlineTeX, [{
    key: 'getInitialState',
    value: function getInitialState() {
      var entityKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props.entityKey;

      var contentState = this.getCurrentEditorContent();
      var entity = contentState.getEntity(entityKey);

      var _entity$getData = entity.getData(),
          teX = _entity$getData.teX,
          displaystyle = _entity$getData.displaystyle;
      // return entity.getData()


      return { editMode: teX.length === 0, teX: teX, displaystyle: displaystyle };
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      var store = this.props.getStore();
      if (this.state.editMode) {
        store.setReadOnly(true);
      }
    }

    // componentWillUnmount() {
    //   console.log("unmount", this.props.entityKey);
    // }

  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var entityKey = nextProps.entityKey;

      var store = nextProps.getStore();
      var key = store.teXToUpdate.key;

      if (key === entityKey) {
        this._update(key);
      }
      if (this.props.entityKey === entityKey) {
        return;
      }
      // un composant est «recyclé» !!!
      // arrive lorsqu'on insère une entité avant une entité de même
      // type dans un même block
      var newInternalState = this.getInitialState(entityKey);
      this.setState(newInternalState, function () {
        return newInternalState.editMode && store.setReadOnly(true);
      });
    }
  }, {
    key: 'getCurrentEditorContent',
    value: function getCurrentEditorContent() {
      return this.props.getStore().getEditorState().getCurrentContent();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _state = this.state,
          editMode = _state.editMode,
          teX = _state.teX,
          displaystyle = _state.displaystyle;


      var completion = this.props.getStore().completion;

      var input = null;
      if (editMode) {
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

      var texContent = (displaystyle ? '\\displaystyle{' : '') + teX + (displaystyle ? '}' : '');

      var rendered = _react2.default.createElement(
        _MathJaxNode2.default,
        { inline: true, key: this.props.entityKey },
        texContent
      );

      var style = styles[editMode ? 'preview' : 'rendered'];
      return _react2.default.createElement(
        'span',
        {
          style: { position: editMode ? 'relative' : undefined
          }
        },
        input,
        _react2.default.createElement(
          'span',
          {
            onMouseDown: function onMouseDown() {
              return _this2._update();
            },
            style: style,
            contentEditable: false
          },
          rendered
        )
      );
    }
  }]);

  return InlineTeX;
}(_react.Component);

exports.default = InlineTeX;