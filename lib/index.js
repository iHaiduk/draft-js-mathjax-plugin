'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _draftJs = require('draft-js');

var _utils = require('./utils');

var _loadMathJax = require('./mathjax/loadMathJax');

var _loadMathJax2 = _interopRequireDefault(_loadMathJax);

var _completion = require('./mathjax/completion');

var _completion2 = _interopRequireDefault(_completion);

var _insertTeX2 = require('./modifiers/insertTeX');

var _insertTeX3 = _interopRequireDefault(_insertTeX2);

var _InlineTeX = require('./components/InlineTeX');

var _InlineTeX2 = _interopRequireDefault(_InlineTeX);

var _TeXBlock = require('./components/TeXBlock');

var _TeXBlock2 = _interopRequireDefault(_TeXBlock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultConfig = {
  macros: {},
  completion: 'auto'
};

var createMathjaxPlugin = function createMathjaxPlugin() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _Object$assign = Object.assign(defaultConfig, config),
      macros = _Object$assign.macros,
      completion = _Object$assign.completion,
      script = _Object$assign.script,
      mathjaxConfig = _Object$assign.mathjaxConfig;

  (0, _loadMathJax2.default)({ macros: macros, script: script, mathjaxConfig: mathjaxConfig });

  var store = {
    getEditorState: undefined,
    setEditorState: undefined,
    getReadOnly: undefined,
    setReadOnly: undefined,
    getEditorRef: undefined,
    completion: (0, _completion2.default)(completion, macros),
    teXToUpdate: {}
  };

  var _insertTeX = function _insertTeX() {
    var block = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var editorState = store.getEditorState();
    store.setEditorState((0, _insertTeX3.default)(editorState, block));
  };

  var insertChar = function insertChar(char) {
    var editorState = store.getEditorState();
    var sel = editorState.getSelection();
    var offset = sel.getStartOffset() - 1;
    var newContentState = _draftJs.Modifier.replaceText(editorState.getCurrentContent(), sel.merge({
      anchorOffset: offset,
      focusOffset: offset + 1
    }), char);
    store.setEditorState(_draftJs.EditorState.push(editorState, newContentState, 'insert-characters'));
  };

  var keyBindingFn = function keyBindingFn(e, _ref) {
    var getEditorState = _ref.getEditorState;
    return (0, _utils.myKeyBindingFn)(getEditorState)(e);
  };

  var blockRendererFn = function blockRendererFn(block) {
    if (block.getType() === 'atomic' && block.getData().get('mathjax')) {
      return {
        component: _TeXBlock2.default,
        editable: false,
        props: { getStore: function getStore() {
            return store;
          } }
      };
    }
    return null;
  };

  // l'utilisation des flèches gauche ou droite
  // amène le curseur sur une formule
  var updateTeX = function updateTeX(key, dir) {
    // le composant associé à la formule
    // se sert de cet indicateur
    // pour se reconnaître
    // cf.componentWillReceiveProps
    store.teXToUpdate = { key: key, dir: dir };
    var editorState = store.getEditorState();
    store.setEditorState(_draftJs.EditorState.forceSelection(editorState, editorState.getSelection()));
  };

  var handleKeyCommand = function handleKeyCommand(command /* ,{ getEditorState, setEditorState } */) {
    if (command === 'insert-texblock') {
      _insertTeX(true);
      return 'handled';
    }
    if (command === 'insert-inlinetex') {
      _insertTeX();
      return 'handled';
    }
    // command de la forme 'enter-inline-math-<dir>-<entityKey>',
    // lancée lorsque l'utilisateur déplace le curseur
    // sur une formule à l'aide des flèches gauche/droite(dir:l ou r)
    if (command.slice(0, 16) === 'update-inlinetex') {
      var dir = command.slice(17, 18);
      var entityKey = command.slice(19);
      updateTeX(entityKey, dir);
      return 'handled';
    }
    if (command.slice(0, 15) === 'update-texblock') {
      var _dir = command.slice(16, 17);
      var blockKey = command.slice(18);

      updateTeX(blockKey, _dir);
      return 'handled';
    }
    if (command.slice(0, 11) === 'insert-char') {
      var char = command.slice(12);
      insertChar(char);
      return 'handled';
    }
    return 'not-handled';
  };

  return {
    initialize: function initialize(_ref2) {
      var getEditorState = _ref2.getEditorState,
          setEditorState = _ref2.setEditorState,
          getReadOnly = _ref2.getReadOnly,
          setReadOnly = _ref2.setReadOnly,
          getEditorRef = _ref2.getEditorRef;

      store.getEditorState = getEditorState;
      store.setEditorState = setEditorState;
      store.getReadOnly = getReadOnly;
      store.setReadOnly = setReadOnly;
      store.getEditorRef = getEditorRef;
      store.completion = typeof store.completion === 'function' ? store.completion(getEditorState()) : store.completion;
      // store.completion.mostUsedTeXCommands =
      //   getInitialMostUsedTeXCmds(getEditorState())
    },
    decorators: [{
      strategy: _utils.findInlineTeXEntities,
      component: _InlineTeX2.default,
      props: {
        getStore: function getStore() {
          return store;
        }
      }
    }],
    keyBindingFn: keyBindingFn,
    handleKeyCommand: handleKeyCommand,
    blockRendererFn: blockRendererFn
  };
};

exports.default = createMathjaxPlugin;