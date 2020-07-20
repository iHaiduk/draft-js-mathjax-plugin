'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.isAtEndOfBlock = isAtEndOfBlock;
exports.isAtEndOfContent = isAtEndOfContent;
exports.isCurrentBlockEmpty = isCurrentBlockEmpty;
exports.getNewBlockSelection = getNewBlockSelection;
exports.removeBlock = removeBlock;
exports.removeEntity = removeEntity;
exports.finishEdit = finishEdit;
exports.saveTeX = saveTeX;

var _draftJs = require('draft-js');

var _immutable = require('immutable');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function isAtEndOfBlock(contentState, selection) {
  var currentBlockKey = selection.getAnchorKey();
  var currentBlock = contentState.getBlockForKey(currentBlockKey);
  return currentBlock.getText().length === selection.getStartOffset();
}

function isAtEndOfContent(contentState, selection) {
  if (!isAtEndOfBlock(contentState, selection)) {
    return false;
  }
  var currentBlockKey = selection.getAnchorKey();
  var lastBlockKey = contentState.getLastBlock().getKey();
  return currentBlockKey === lastBlockKey;
}

function isCurrentBlockEmpty(contentState, selection) {
  var currentBlockKey = selection.getAnchorKey();
  var currentBlock = contentState.getBlockForKey(currentBlockKey);
  return currentBlock.getText().length === 0;
}

function getNewBlockSelection(blockBefore, blockAfter, after) {
  if (!blockAfter && !blockBefore) {
    return undefined;
  }
  var nextBlock = void 0;
  var offset = void 0;

  if (after) {
    nextBlock = blockAfter || blockBefore;
    offset = blockAfter ? 0 : nextBlock.getLength();
  } else {
    nextBlock = blockBefore || blockAfter;
    offset = blockBefore ? nextBlock.getLength() : 0;
  }

  return _draftJs.SelectionState.createEmpty(nextBlock.getKey()).merge({
    anchorOffset: offset,
    focusOffset: offset,
    hasFocus: true
  });
}

function removeBlock(contentState, block) {
  var after = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  var blockMap = contentState.getBlockMap();
  var blockKey = block.getKey();
  var blockAfter = contentState.getBlockAfter(blockKey);
  var blockBefore = contentState.getBlockBefore(blockKey);

  if (!blockAfter && !blockBefore) {
    // peut mieux faire ...
    if (block.getType() === 'atomic' && block.getData().mathjax /* ['mathjax'] */) {
        return _draftJs.ContentState.createFromText('');
      }
    return contentState;
  }

  var newBlockMap = blockMap.delete(blockKey);
  return contentState.set('blockMap', newBlockMap).set('selectionAfter', getNewBlockSelection(blockBefore, blockAfter, after));
}

function removeEntity(contentState, blockKey, start, end) {
  var selToRemove = _draftJs.SelectionState.createEmpty(blockKey).merge({
    anchorOffset: start,
    focusOffset: end
  });

  return _draftJs.Modifier.removeRange(contentState, selToRemove, 'backward');
}

function finishEdit(store) {
  return function (newContentState, newSelection, needRemove) {
    store.setReadOnly(false);
    var newEditorState = _draftJs.EditorState.push(store.getEditorState(), newContentState, needRemove ? 'remove-range' : 'update-math');

    if (newSelection !== undefined) {
      store.setEditorState(_draftJs.EditorState.forceSelection(newEditorState, newSelection));
      setTimeout(function () {
        return store.getEditorRef().focus();
      }, 5);
    } else {
      store.setEditorState(newEditorState);
    }
  };
}

function _saveInlineTeX(_ref) {
  var after = _ref.after,
      contentState = _ref.contentState,
      teX = _ref.teX,
      displaystyle = _ref.displaystyle,
      entityKey = _ref.entityKey,
      blockKey = _ref.blockKey,
      startPos = _ref.startPos;

  var needRemove = teX.length === 0;
  var newContentState = void 0;
  var newSelection = void 0;

  if (needRemove) {
    newContentState = removeEntity(contentState, blockKey, startPos, startPos + 1);
    newSelection = newContentState.getSelectionAfter();
  } else {
    newContentState = contentState.mergeEntityData(entityKey, { teX: teX, displaystyle: displaystyle });

    if (after !== undefined) {
      var offset = after ? startPos + 2 : startPos;
      newSelection = _draftJs.SelectionState.createEmpty(blockKey).merge({
        anchorOffset: offset,
        focusOffset: offset,
        hasFocus: true
      });
    }
  }

  return [newContentState, newSelection, needRemove];
}

function _saveBlockTeX(_ref2) {
  var after = _ref2.after,
      contentState = _ref2.contentState,
      teX = _ref2.teX,
      block = _ref2.block;

  var needRemove = teX.length === 0;
  var blockKey = block.getKey();

  var newContentState = void 0;
  var newSelection = void 0;

  if (needRemove) {
    newContentState = removeBlock(contentState, block, after);
    newSelection = newContentState.getSelectionAfter();
  } else {
    newContentState = _draftJs.Modifier.mergeBlockData(contentState, _draftJs.SelectionState.createEmpty(blockKey), (0, _immutable.Map)({ teX: teX }));

    if (after !== undefined) {
      newSelection = getNewBlockSelection(contentState.getBlockBefore(blockKey), contentState.getBlockAfter(blockKey), after);
    }
  }

  return [newContentState, newSelection, needRemove];
}

function saveTeX(_ref3) {
  var block = _ref3.block,
      entityKey = _ref3.entityKey,
      displaystyle = _ref3.displaystyle,
      blockKey = _ref3.blockKey,
      startPos = _ref3.startPos,
      common = _objectWithoutProperties(_ref3, ['block', 'entityKey', 'displaystyle', 'blockKey', 'startPos']);

  return entityKey ? _saveInlineTeX(_extends({}, common, { entityKey: entityKey, displaystyle: displaystyle, blockKey: blockKey, startPos: startPos })) : _saveBlockTeX(_extends({}, common, { block: block }));
}