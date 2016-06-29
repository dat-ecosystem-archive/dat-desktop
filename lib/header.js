'use strict';

const yo = require('yo-yo');
const button = require('dat-button');
const css = require('yo-css');

const style = {
  backgroundColor: 'green',
  color: 'white'
};

module.exports = (props) => yo`
  <header style=${css(style)}>
    <h1>All Dats</h1>
    ${button({
      text: 'Create new Dat',
      click: props.create
    })}
    ${button({
      text: 'Import Dat'
    })}
  </header>
`;

