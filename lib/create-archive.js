'use strict';

const replicate = require('./replicate');
const {app} = require('electron').remote;
const raf = require('random-access-file');

const filesPath = `${app.getPath('downloads')}/dat`;

const create = (drive, key) => {
  const archive = drive.createArchive(key, {
    live: true,
    file: name => raf(`${filesPath}/${archive.key.toString('hex')}/${name}`)
  });
  replicate(archive);
  return archive;
};

module.exports = create;
