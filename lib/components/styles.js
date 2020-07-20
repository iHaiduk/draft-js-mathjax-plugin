'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var commonEdit = {
  border: '0.5px solid red',
  outline: 'none',
  fontFamily: '\'Inconsolata\', \'Menlo\', monospace',
  fontSize: '1em',
  boxShadow: '5px 5px 5px rgba(0,0,0,0.7)',
  background: 'yellow'
};

var commonPreview = {
  position: 'absolute',
  /* on centre:
   * cf https://www.w3.org/Style/Examples/007/center.en.html
   * */
  left: '50%',
  marginRright: '-50%',
  transform: 'translate(-50%, 0)',

  padding: '10px',
  zIndex: 10,
  background: 'ivory',
  border: '1px solid #ccc',
  borderRadius: '5px',
  boxShadow: '5px 5px 5px rgba(0,0,0,0.7)'
};

var commonRendered = {
  cursor: 'pointer'
};

exports.default = {
  inline: {
    edit: _extends({}, commonEdit, {
      display: 'inline-block',
      textAlign: 'center',
      padding: '5px'

    }),
    preview: _extends({}, commonPreview, {
      top: '200%' /* se réfère à la hauteur de ligne */
    }),
    rendered: _extends({}, commonRendered)
  },
  block: {
    edit: _extends({}, commonEdit, {
      display: 'block',
      margin: '10px auto 10px',
      padding: '14px'
    }),
    preview: _extends({}, commonPreview, {
      top: 'calc(100%+1em)'
    }),
    rendered: _extends({}, commonRendered)
  }
};