'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _draftJs = require('draft-js');

var _teXCommands = require('./teXCommands');

var _teXCommands2 = _interopRequireDefault(_teXCommands);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var teXCmdRegex = /\\([a-zA-Z]+)$/;

var getLastTeXCommand = function getLastTeXCommand(teX) {
  var res = teXCmdRegex.exec(teX);
  return res ? res[1].toLowerCase() : '';
};

var _computeCompletionList = function _computeCompletionList(cmdPrefix, commands) {
  var mostUsedCommands = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (cmdPrefix === '') {
    return [];
  }
  var list = commands[cmdPrefix[0].toLowerCase()].filter(function (cmd) {
    return cmd.toLowerCase().startsWith(cmdPrefix.toLowerCase());
  });

  if (!mostUsedCommands) {
    return list;
  }

  list.sort(function (c1, c2) {
    var w1 = Object.prototype.hasOwnProperty.call(mostUsedCommands, c1) && mostUsedCommands[c1] || 0;
    var w2 = Object.prototype.hasOwnProperty.call(mostUsedCommands, c2) && mostUsedCommands[c2] || 0;

    if (w1 === w2) {
      return 0;
    }
    if (w1 < w2) {
      return 1;
    }
    return -1;
  });
  return list;
};

function getMostUsedTeXCmds(teX) {
  var cmdRe = /\\([a-zA-Z]+)/;
  var copy = teX;
  var res = {};
  var search = void 0;
  var cmd = void 0;
  while (true) {
    search = cmdRe.exec(copy);
    if (search === null) break;
    cmd = search[1];
    copy = copy.slice(search.index + cmd.length + 1);
    if (Object.prototype.hasOwnProperty.call(res, cmd)) {
      res[cmd] += 1;
    } else {
      res[cmd] = 1;
    }
  }

  return res;
}

function getAllTeX(contentState) {
  var entityMapObj = (0, _draftJs.convertToRaw)(contentState).entityMap;
  var entityKeys = Object.keys(entityMapObj);
  var entityMap = entityKeys.map(function (k) {
    return entityMapObj[k];
  });
  // Todo: lorsque drafjs sera en version 0.11.0,
  // remplacer ce qui précède par
  // const entityMap = contentState.getBlockMap()
  var blockMap = contentState.getBlockMap();

  var allTeX = entityMap.filter(function (e) {
    return e.type === 'INLINETEX';
  })
  // Todo: lorsque drafjs sera en version 0.11.0,
  // .filter(e => e.get('type') === 'INLINETEX');;
  .reduce(function (red, e) {
    return red + e.data.teX;
  }, '');
  // Todo: lorsque drafjs sera en version 0.11.0,
  // .reduce((red, e) => red + e.get('data').teX, '')
  allTeX = blockMap.filter(function (b) {
    return b.getData().mathjax;
  }).reduce(function (red, b) {
    return red + b.getData().teX;
  }, allTeX);

  return allTeX;
}

function getInitialMostUsedTeXCmds(editorState) {
  return getMostUsedTeXCmds(getAllTeX(editorState.getCurrentContent()));
}

function _updateMostUsedTeXCmds(newTeX, mostUsedCommands, lastTex) {
  if (!mostUsedCommands) {
    return undefined;
  }
  var newest = getMostUsedTeXCmds(newTeX);
  var old = getMostUsedTeXCmds(lastTex);
  var muc = _extends({}, mostUsedCommands);
  var nk = Object.keys(newest);
  var ok = Object.keys(old);

  // newest including newest inter old
  var nmuc = nk.reduce(function (red, cmd) {
    var repeat = newest[cmd];
    var nred = _extends({}, red);
    if (Object.prototype.hasOwnProperty.call(old, cmd)) {
      repeat -= old[cmd];
    }
    if (Object.prototype.hasOwnProperty.call(nred, cmd)) {
      nred[cmd] += repeat;
    } else {
      nred[cmd] = repeat;
    }
    return nred;
  }, muc);

  // old not inside newest
  nmuc = ok.filter(function (k) {
    return nk.indexOf(k) === -1;
  }).reduce(function (red, cmd) {
    var nred = _extends({}, red);
    if (Object.prototype.hasOwnProperty.call(nred, cmd)) {
      nred[cmd] -= old[cmd];
    }
    return nred;
  }, nmuc);

  // console.log(nmuc)
  return nmuc;
}

function mergeMacros(teXCmds, macros) {
  return Object.keys(macros).reduce(function (red, m) {
    var firstChar = m[0].toLowerCase();
    var tmp = [].concat(_toConsumableArray(red[firstChar]));
    tmp.unshift(m);
    tmp.sort();
    return _extends({}, red, _defineProperty({}, firstChar, tmp));
  }, _extends({}, teXCmds));
}

exports.default = function (status, macros) {
  return function (editorState) {
    return {
      status: status,
      teXCommandsAndMacros: status !== 'none' ? mergeMacros(_teXCommands2.default, macros) : undefined,
      mostUsedTeXCommands: status !== 'none' ? getInitialMostUsedTeXCmds(editorState) : undefined,
      getLastTeXCommand: getLastTeXCommand,
      updateMostUsedTeXCmds: function updateMostUsedTeXCmds(teX) {
        var lastTex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

        this.mostUsedTeXCommands = _updateMostUsedTeXCmds(teX, this.mostUsedTeXCommands, lastTex);
      },
      computeCompletionList: function computeCompletionList(prefix) {
        return _computeCompletionList(prefix, this.teXCommandsAndMacros, this.mostUsedTeXCommands);
      }
    };
  };
};