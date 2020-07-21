'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.myKeyBindingFn = undefined;
exports.findInlineTeXEntities = findInlineTeXEntities;
exports.changeDecorator = changeDecorator;

var _draftJs = require('draft-js');

var hasCommandModifier = _draftJs.KeyBindingUtil.hasCommandModifier;
var myKeyBindingFn = exports.myKeyBindingFn = function myKeyBindingFn(getEditorState) {
  return function (e) {
    // J'aurais préféré CTRL+$ que CTRL+M, mais cela semble
    // un peu compliqué car chrome gère mal e.key.
    // if (e.key === '$' && hasCommandModifier(e))
    if (e.keyCode === /* m */77 && hasCommandModifier(e)) {
      return 'insert-texblock';
    }
    // if (e.key === /* $ */ '$' /* && hasCommandModifier(e)*/) {
    //   const c = getEditorState().getCurrentContent()
    //   const s = getEditorState().getSelection()
    //   if (!s.isCollapsed()) return 'insert-inlinetex'
    //   const bk = s.getStartKey()
    //   const b = c.getBlockForKey(bk)
    //   const offset = s.getStartOffset() - 1
    //   if (b.getText()[offset] === '\\') {
    //     return `insert-char-${e.key}`
    //   }
    //   return 'insert-inlinetex'
    // }
    // if (e.key === '*') {
    //   return 'test'
    // }
    // gestion du cursor au cas où il est situé près d'une formule
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      var d = e.key === 'ArrowRight' ? 'r' : 'l';
      var s = getEditorState().getSelection();
      var c = getEditorState().getCurrentContent();
      if (!s.isCollapsed()) {
        return undefined;
      }
      var offset = s.getStartOffset();
      var blockKey = s.getStartKey();
      var cb = c.getBlockForKey(blockKey);
      if (cb.getLength() === offset && d === 'r') {
        var b = c.getBlockAfter(blockKey);
        if (b && b.getType() === 'atomic' && b.getData().get('mathjax')) {
          return 'update-texblock-' + d + '-' + b.getKey();
        }
      }
      if (offset === 0 && d === 'l') {
        var _b = c.getBlockBefore(blockKey);
        if (_b && _b.getType() === 'atomic' && _b.getData().get('mathjax')) {
          return 'update-texblock-' + d + '-' + _b.getKey();
        }
      }
      var ek = cb.getEntityAt(offset - (e.key === 'ArrowLeft' ? 1 : 0));
      if (ek && c.getEntity(ek).getType() === 'INLINETEX') {
        return 'update-inlinetex-' + d + '-' + ek;
      }
    }

    return (0, _draftJs.getDefaultKeyBinding)(e);
  };
};

function findInlineTeXEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(function (character) {
    var entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === 'INLINETEX';
  }, callback);
}

function changeDecorator(editorState, decorator) {
  return _draftJs.EditorState.create({
    allowUndo: true,
    currentContent: editorState.getCurrentContent(),
    decorator: decorator,
    selection: editorState.getSelection()
  });
}