'use strict';

const level = require('level');
const hyperdrive = require('hyperdrive');
const {app, process: remoteProcess, dialog} = require('electron').remote;
const {ipcRenderer: ipc} = require('electron');
const fs = require('fs');
const yo = require('yo-yo');
const bytewise = require('bytewise');
const liveStream = require('level-live-stream');
const render = require('./lib/render');
const minimist = require('minimist');
const exec = require('child_process').exec;
const raf = require('random-access-file');
const swarm = require('hyperdrive-archive-swarm');
const encoding = require('dat-encoding');
const hyperImport = require('hyperdrive-import-files');
const rmrf = require('rimraf');
const assert = require('assert');

const argv = minimist(remoteProcess.argv.slice(2));
const root = argv.data || `${app.getPath('downloads')}/dat`;
try { fs.mkdirSync(root); } catch (_) {}

const db = level(`${root}/.db`, { keyEncoding: bytewise });
const drive = hyperdrive(db);

const archives = new Map();
let el;

const createArchive = (key) => {
  const archive = drive.createArchive(key, {
    live: true,
    file: name => raf(`${archive.path}/${name}`)
  })
  archive.path = `${root}/${encoding.encode(archive.key)}`
  return archive
}

function refresh (err) {
  if (err) throw err;
  const fresh = render({
    dats: archives,
    open: dat => {
      // TODO cross platform
      exec(`open ${root}/${encoding.encode(dat.key)}`, err => {
        if (err) throw err
      })
    },
    share: () => console.error('TODO'),
    delete: dat => {
      db.del(['archive', encoding.encode(dat.key)], err => {
        if (err) throw err;
      });
    },
    create: () => {
      const files = dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory', 'multiSelections']
      });
      if (!files.length) return;
      const archive = createArchive();
      hyperImport(archive, files, err => {
        if (err) throw err;
        archive.finalize(err => {
          if (err) throw err;

          const link = encoding.encode(archive.key);
          db.put(['archive', link], link);
        });
      });
    }
  });
  if (el) el = yo.update(el, fresh);
  else el = fresh;
};

liveStream(db, {
  gt: ['archive', null],
  lt: ['archive', undefined]
}).on('data', data => {
  if (data.type === 'del') {
    // TODO delete archive from hyperdrive
    const key = data.key[1];
    const dat = archives.get(key);
    archives.delete(key);
    refresh();
    assert(dat.path.indexOf(root) > -1);
    rmrf(dat.path, err => {
      if (err) throw err;
    });
  } else {
    const key = encoding.decode(data.value);
    const archive = createArchive(key)
    archive.open(refresh);
    archive.swarm = swarm(archive);
    archive.swarm.on('connection', peer => {
      refresh();
      peer.on('close', () => refresh());
    });

    archives.set(encoding.encode(archive.key), archive);
  }
  refresh();
});

refresh();
document.body.appendChild(el);

ipc.on('link', (ev, url) => {
  const link = encoding.decode(url);
  db.put(['archive', link], link);
});

ipc.send('ready');
