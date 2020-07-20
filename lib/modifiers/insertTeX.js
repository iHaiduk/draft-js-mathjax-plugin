'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = insertTeX;

var _draftJs = require('draft-js');

var _immutable = require('immutable');

var _customInsertAtomicBlock = require('./customInsertAtomicBlock');

var _customInsertAtomicBlock2 = _interopRequireDefault(_customInsertAtomicBlock);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function insertInlineTeX(editorState) {
  var contentState = editorState.getCurrentContent();
  var selection = editorState.getSelection();

  var teX = '';

  // si la selection est étendue, utiliser le texte sélectionné
  // pour initialiser la formule
  if (!selection.isCollapsed()) {
    var blockKey = selection.getStartKey();
    if (blockKey === selection.getEndKey()) {
      teX = contentState.getBlockForKey(blockKey).getText().slice(selection.getStartOffset(), selection.getEndOffset());
    }
    contentState = _draftJs.Modifier.removeRange(contentState, selection, 'backward');
    selection = contentState.getSelectionAfter();
  }

  contentState = contentState.createEntity('INLINETEX', 'IMMUTABLE', {
    teX: teX,
    displaystyle: false
  });
  var entityKey = contentState.getLastCreatedEntityKey();

  // insérer un espace si le curseur se trouve au début ou à la fin
  // d'un bloc
  var atBeginOfBlock = selection.getStartOffset() === 0;
  var atEndOfBlock = (0, _utils.isAtEndOfBlock)(contentState, selection);

  if (atBeginOfBlock) {
    contentState = _draftJs.Modifier.insertText(contentState, selection, ' ');
    selection = contentState.getSelectionAfter();
  }

  contentState = _draftJs.Modifier.insertText(contentState, selection, '\t\t', undefined, entityKey);
  selection = contentState.getSelectionAfter();

  if (atEndOfBlock) {
    contentState = _draftJs.Modifier.insertText(contentState, selection, ' ');
  }

  return _draftJs.EditorState.push(editorState, contentState, 'apply-entity');
}

function insertTeXBlock(editorState) {
  return (0, _customInsertAtomicBlock2.default)(editorState, (0, _immutable.Map)({ mathjax: true, teX: '' }));
}

function insertTeX(editorState) {
  var block = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if (block) {
    return insertTeXBlock(editorState);
  }
  return insertInlineTeX(editorState);
}