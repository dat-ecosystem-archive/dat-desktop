const level = require('level');
const hyperdrive = require('hyperdrive');
const {app, process: remoteProcess} = require('electron').remote;
const {ipcRenderer: ipc} = require('electron');
const drop = require('drag-and-drop-files');
const fileReader = require('filereader-stream');
const fs = require('fs');
const {basename} = require('path');
const raf = require('random-access-file');
const replicate = require('./lib/replicate');
const minimist = require('minimist');

const argv = minimist(remoteProcess.argv.slice(2));

const filesPath = argv.data || `${app.getPath('downloads')}/dat`;
try { fs.mkdirSync(filesPath) } catch (_) {}

const db = level(`${filesPath}/.db`);
const drive = hyperdrive(db);

let key;
try { key = fs.readFileSync(`${filesPath}/.key.txt`); } catch (_) {}

const archive = drive.createArchive(key, {
  live: true,
  file: name => raf(`${filesPath}/${name}`)
});
fs.writeFileSync(`${filesPath}/.key.txt`, archive.key);

replicate(archive);

archive.list({ live: true }).on('data', entry => {
  document.body.innerHTML += entry.name + '<br>';
});

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
