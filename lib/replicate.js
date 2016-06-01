'use strict';

const webRTCSwarm = require('webrtc-swarm');
const signalhub = require('signalhub');
const discoverySwarm = require('discovery-swarm');
const swarmDefaults = require('datland-swarm-defaults');

const connect = (archive) => {
  const swarmKey = `dat-desktop-${archive.key.toString('hex')}`;

  const ws = webRTCSwarm(signalhub(swarmKey, 'https://signalhub.mafintosh.com'));
  ws.on('peer', peer => {
    peer.pipe(archive.replicate()).pipe(peer);
  });

  const ds = discoverySwarm(swarmDefaults({
    stream: () => archive.replicate()
  }));
  ds.once('listening', () => ds.join(swarmKey));
  //ds.listen(3282, () => ds.listen(0));
  ds.listen(0);
};

module.exports = connect;
