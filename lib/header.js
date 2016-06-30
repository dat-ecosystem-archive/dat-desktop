'use strict';

const yo = require('yo-yo');
const button = require('dat-button');
const css = require('yo-css');
const encoding = require('dat-encoding');

const style = {
  backgroundColor: 'green',
  color: 'white'
};

module.exports = (props) => {
  const keydown = (e) => {
    if (e.keyCode === 13) {
      const link = e.target.value;
      try {
        encoding.decode(link);
      } catch (err) {
        throw new Error('Invalid link');
      }
      console.log('passed');
      e.target.value = '';
      props.download(link);
    }
  }
  return yo`
    <header style=${css(style)}>
      <h1>All Dats</h1>
      ${button({
        text: 'Create new Dat',
        click: props.create
      })}
      <input type="text" placeholder="Import dat" onkeydown=${keydown}>
    </header>
  `;
}
