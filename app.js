const level = require('level');
const hyperdrive = require('hyperdrive');
const {app, process: remoteProcess} = require('electron').remote;
const {ipcRenderer: ipc} = require('electron');
const drop = require('drag-and-drop-files');
const fileReader = require('filereader-stream');
const fs = require('fs');
const {basename} = require('path');
const yo = require('yo-yo');
const bytewise = require('bytewise');
const liveStream = require('level-live-stream');
const createArchive = require('./lib/create-archive');
const replicate = require('./lib/replicate');
const minimist = require('minimist');
const defaults = require('levelup-defaults');

const argv = minimist(remoteProcess.argv.slice(2));

const root = argv.data || `${app.getPath('downloads')}/dat`;
try { fs.mkdirSync(root) } catch (_) {}

const db = window.db = level(`${root}/.db`, {
  keyEncoding: bytewise
});
// temporary fix for
// https://github.com/mafintosh/hypercore/pull/22
const drive = hyperdrive(defaults(db, { keyEncoding: 'utf8' }));

let localKey;
try { localKey = fs.readFileSync(`${root}/.key.txt`); } catch (_) {}

const local = createArchive(drive, localKey);
fs.writeFileSync(`${root}/.key.txt`, local.key);

const archives = new Map;
archives.set(local.key.toString('hex'), local);
let selected;
let listStream;
let files = [];
let el;

const addArchive = ev => {
  ev.preventDefault();
  const link = ev.target.querySelector('input').value;
  db.put(['archive', link], link);
};

const selectArchive = key => ev => {
  if (ev) ev.preventDefault();
  if (typeof key != 'string') key = key.toString('hex');
  if (selected && selected.key.toString('hex') === key) return;

  selected = archives.get(key);
  files = [];
  if (listStream) listStream.destroy();
  listStream = selected.list({ live: true })
  .on('data', file => {
    files.push(file);
    refresh();
  });
  refresh();
};

const render = (archives, selected, files, add, select) => yo`
  <div>
    <h2>Archives</h2>
    <ul>
      ${Array.from(archives.keys()).map(key => yo`
        <li>
          <a onclick=${select(key)} href=#>
            ${key}
          </a>
          ${key === local.key.toString('hex')
            ? '(your dat)'
            : ''}
        </li>
      `)}
    </ul>
    <form onsubmit=${add}>
      <input type="text" placeholder="Link">
      <input type="submit" value="Add archive">
    </form>
    <h1>${selected.key.toString('hex')}</h1>
    <ul>
      ${files.map(file => yo`
        <li>${file.name}</li>
      `)}
    </ul>
  </div>
`;

const refresh = () => {
  const fresh = render(archives, selected, files, addArchive, selectArchive);
  if (el) el = yo.update(el, fresh);
  else el = fresh;
};

liveStream(db, {
  gt: ['archive', null],
  lt: ['archive', undefined]
}).on('data', data => {
  if (data.type == 'del') {
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
    stream.pipe(local.createFileWriteStream(file.name)).on('finish', loop);
  })();
});

ipc.on('file', (ev, path) => {
  fs.createReadStream(path).pipe(local.createFileWriteStream(basename(path)));
});

ipc.on('link', (ev, url) => {
  console.log(`Requested to open ${url} (not yet implemented)`);
});

ipc.send('ready');

