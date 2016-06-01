const level = require('level');
const hyperdrive = require('hyperdrive');
const {app, process: remoteProcess} = require('electron').remote;
const {ipcRenderer: ipc} = require('electron');
const drop = require('drag-and-drop-files');
const fileReader = require('filereader-stream');
const fs = require('fs');
const {basename} = require('path');
const raf = require('random-access-file');
const yo = require('yo-yo');
const bytewise = require('bytewise');
const liveStream = require('level-live-stream');
const createArchive = require('./lib/create-archive');
const replicate = require('./lib/replicate');
const minimist = require('minimist');

const argv = minimist(remoteProcess.argv.slice(2));

const filesPath = argv.data || `${app.getPath('downloads')}/dat`;
try { fs.mkdirSync(filesPath) } catch (_) {}

const db = window.db = level(`${filesPath}/.db`, {
  keyEncoding: bytewise
});
const drive = hyperdrive(db);

let localKey;
try { localKey = fs.readFileSync(`${filesPath}/.key.txt`); } catch (_) {}

const local = createArchive(drive, localKey);
fs.writeFileSync(`${filesPath}/.key.txt`, local.key);

const archives = new Map;
let el;

const addArchive = ev => {
  ev.preventDefault();
  const link = ev.target.querySelector('input').value;
  db.put(['archive', link], link);
};

const render = (archives, add) => yo`
  <div>
    <h2>Archives</h2>
    <ul>
      <li>Your dat (${local.key.toString('hex')})</li>
      ${Array.from(archives.keys()).map(key => yo`
        <li>${key}</li>
      `)}
    </ul>
    <form onsubmit=${add}>
      <input type="text" placeholder="Link">
      <input type="submit" value="Add archive">
    </form>
  </div>
`;

const refresh = () => {
  el = yo.update(el, render(archives, addArchive));
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

el = render(archives, addArchive);
document.body.appendChild(el);





/*
archive.list({ live: true }).on('data', entry => {
  document.body.innerHTML += entry.name + '<br>';
});
*/

/*
drop(document.body, files => {
  let i = 0;

  (function loop () {
    if (i === files.length) return;

    const file = files[i++];
    const stream = fileReader(file);
    stream.pipe(archive.createFileWriteStream(file.name)).on('finish', loop);
  })();
});

ipc.on('file', (ev, path) => {
  fs.createReadStream(path).pipe(archive.createFileWriteStream(basename(path)));
});

ipc.on('link', (ev, url) => {
  console.log(`Requested to open ${url} (not yet implemented)`);
});

ipc.send('ready');
*/
