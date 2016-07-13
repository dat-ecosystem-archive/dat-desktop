'use strict';

const yo = require('yo-yo');
const button = require('dat-button');
const css = require('yo-css');
const encoding = require('dat-encoding');

const style = {

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
      e.target.value = '';
      props.download(link);
    }
  };
  return yo`
    <header style=${css(style)} class="dat-header">
      <div class="dat-header__title">All Dats</div>
      <div class="dat-header__actions">
        ${button({
          text: 'Create new Dat',
          klass: 'btn btn--green btn--header',
          style: {
            float: 'left',
            marginRight: '3rem',
            marginTop: '1rem'
          },
          click: props.create
        })}
        <div class="dat-import">
          <div class="dat-import--icon">
            <img src="./public/img/link.svg" />
          </div>
          <input type="text" placeholder="Import dat" onkeydown=${keydown} class="dat-import--input">
        </div>
      </div>
    </header>
  `;
};
