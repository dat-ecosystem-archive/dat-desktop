const level = require('level');
const hyperdrive = require('hyperdrive');
const app = require('electron').remote.app;
const {ipcRenderer: ipc} = require('electron');
const drop = require('drag-and-drop-files');
const fileReader = require('filereader-stream');
const fs = require('fs');
const {basename} = require('path');
const raf = require('random-access-file');
const replicate = require('./lib/replicate');
const yo = require('yo-yo');
const bytewise = require('bytewise');
const liveStream = require('level-live-stream');

const appPath = `${app.getPath('appData')}/${app.getName()}`;
const filesPath = `${app.getPath('downloads')}/dat`;
try { fs.mkdirSync(filesPath) } catch (_) {}

const db = level(`${appPath}/db`, { keyEncoding: bytewise });
const drive = hyperdrive(db);





const archives = new Set;
archives.add('w00t');
let el;

const render = archives => yo`
  <div>
    <h2>Archives</h2>
    <ul>
      ${Array.from(archives).map(key => yo`
        <li>${key}</li>
      `)}
    </ul>
  </div>
`;

const refresh = () => {
  el = yo.update(el, render(archives));
};

liveStream(db, {
  gt: ['archive', null],
  lt: ['archive', undefined]
}).on('data', data => {
  console.log('data', data);
  if (data.type == 'del') archives.delete(data.value);
  else archives.add(data.value);
  refresh();
});

el = render(archives);
document.body.appendChild(el);




/*
let key;
const keyPath = `${appPath}/key.txt`;
try { key = fs.readFileSync(keyPath); } catch (_) {}

const archive = drive.createArchive(key, {
  live: true,
  file: name => raf(`${filesPath}/${name}`)
});
fs.writeFileSync(keyPath, archive.key);

replicate(archive);

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
