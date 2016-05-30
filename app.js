const level = require('level');
const hyperdrive = require('hyperdrive');
const webRTCSwarm = require('webrtc-swarm');
const discoverySwarm = require('discovery-swarm');
const swarmDefaults = require('datland-swarm-defaults');
const signalhub = require('signalhub');
const app = require('electron').remote.app;
const {ipcRenderer: ipc} = require('electron');
const drop = require('drag-and-drop-files');
const fileReader = require('filereader-stream');
const fs = require('fs');
const {basename} = require('path');

const appPath = `${app.getPath('appData')}/${app.getName()}`;

const db = level(`${appPath}/db`);
const drive = hyperdrive(db);

let key;
const keyPath = `${appPath}/key.txt`;
try { key = fs.readFileSync(keyPath); } catch (_) {}

const archive = drive.createArchive(key, { live: true });
fs.writeFileSync(keyPath, archive.key);

const swarmKey = `dat-desktop-${archive.key.toString('hex')}`;

const ws = webRTCSwarm(signalhub(swarmKey, 'https://signalhub.mafintosh.com'));
ws.on('peer', peer => {
  peer.pipe(archive.replicate()).pipe(peer);
});

const ds = discoverySwarm(swarmDefaults({
  stream: () => drive.createPeerStream()
}));
ds.once('listening', () => ds.join(swarmKey));
ds.listen(3282);

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
