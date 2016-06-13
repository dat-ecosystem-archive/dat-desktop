'use strict';

const level = require('level');
const hyperdrive = require('hyperdrive');
const {app, process: remoteProcess} = require('electron').remote;
const {ipcRenderer: ipc} = require('electron');
const drop = require('drag-drop');
const fileReader = require('filereader-stream');
const fs = require('fs');
const {basename} = require('path');
const yo = require('yo-yo');
const bytewise = require('bytewise');
const liveStream = require('level-live-stream');
const createArchive = require('./lib/create-archive');
const render = require('./lib/render');
const minimist = require('minimist');

const argv = minimist(remoteProcess.argv.slice(2));
const root = argv.data || `${app.getPath('downloads')}/dat`;
try { fs.mkdirSync(root); } catch (_) {}

const db = level(`${root}/.db`, { keyEncoding: bytewise });
const drive = hyperdrive(db);

let localKey;
try { localKey = fs.readFileSync(`${root}/.key.txt`); } catch (_) {}
const local = createArchive(drive, localKey);
fs.writeFileSync(`${root}/.key.txt`, local.key);

const archives = new Map();
archives.set(local.key.toString('hex'), local);
let selected;
let el;

const addArchive = ev => {
  ev.preventDefault();
  const input = ev.target.querySelector('input');
  const link = input.value;
  input.value = '';
  db.put(['archive', link], link);
};

const selectArchive = key => ev => {
  if (ev) ev.preventDefault();
  if (typeof key !== 'string') key = key.toString('hex');
  if (selected && selected.key.toString('hex') === key) return;

  selected = archives.get(key);
  refresh();
};

const refresh = () => {
  const fresh = render(archives, selected, local, addArchive, selectArchive);
  if (el) el = yo.update(el, fresh);
  else el = fresh;
};

liveStream(db, {
  gt: ['archive', null],
  lt: ['archive', undefined]
}).on('data', data => {
  if (data.type === 'del') {
    archives.delete(data.value);
  } else {
    const archive = createArchive(drive, data.value);
    archives.set(archive.key.toString('hex'), archive);
  }
  refresh();
});

selectArchive(local.key)();
document.body.appendChild(el);

drop(document.body, files => {
  let i = 0;

  (function loop () {
    if (i === files.length) return;

    const file = files[i++];
    const stream = fileReader(file);
    stream.pipe(local.createFileWriteStream(file.fullPath)).on('finish', loop);
  })();
});

ipc.on('file', (ev, path) => {
  fs.createReadStream(path).pipe(local.createFileWriteStream(basename(path)));
});

ipc.on('link', (ev, url) => {
  const link = url.slice(6);
  db.put(['archive', link], link);
});

ipc.send('ready');
