'use strict'

const {execSync} = require('child_process')
const npmRunPath = require('npm-run-path')
const {platform} = require('os')

const usage = () => {
  console.error('Usage: scripts/build [-h]')
}

const exec = cmd => execSync(cmd, { env: npmRunPath.env(), encoding: 'utf8' })

const rebuild = () => {
  const electronVersion = exec('electron --version').trim().slice(1)
  const electronAbi = exec('electron --abi').trim()
  console.error('[scripts/build] rebuilding native deps')
  console.error('[scripts/build] detected electron=%s abi=%s', electronVersion, electronAbi)
  exec(`npm rebuild \
    --runtime=electron \
    --target="${electronVersion}" \
    --disturl=https://atom.io/download/atom-shell \
    --abi="${electronAbi}"`)
}

const buildBackground = () => {
  console.error('[scripts/build] building background')
  console.error(exec('tiffutil \\' +
    '-cathidpicheck \\' +
    'build/background.png build/background@2x.png \\' +
    '-out build/background.tiff'))
}

const bundle = () => {
  console.error('[scripts/build] bundling javascript')
  console.error(exec('node scripts/browserify.js'))
}

const postinstall = () => {
  if (platform() === 'darwin') buildBackground()
  rebuild()
  bundle()
}

// parse CLI flags
switch (process.argv[2]) {
  case 'rebuild': rebuild(); break
  case 'css': break
  case 'background': buildBackground(); break
  case 'bundle': bundle(); break
  case 'postinstall': postinstall(); break
  default: usage(); break
}
