
# Dat Desktop

Desktop app for [Dat](https://datproject.org/).

![screenshot](screenshot.png)

[![Build Status](https://travis-ci.org/datproject/dat-desktop.svg?branch=master)](https://travis-ci.org/datproject/dat-desktop)

## Installing
Visit the [Dat installation page](https://datproject.org/install) for
download instructions. Currently only MacOS is supported.

## Commands

```bash
$ npm install             # install dependencies
$ npm start               # start the application
$ npm run dist            # compile the app into an ASAR file to release
$ npm start --dat=<dir>   # change the path for new dat archives (default ~/Downloads)
```

## Directory structure

```txt
elements/      Standalone application-specific elements
lib/           Generalized components, should be moved out of project later
models/        Choo models
pages/         Views that are directly mounted on the router
public/        Various assets
scripts/       Various scripts used to build and manage the repository
app.js         Client application entry file
index.html     Initial HTML served
index.js       Electron application entry
```

## FAQ

### How can I speed up downloading Electron?
If you’re Europe / US you might want to use a different mirror for `electron`.
You can set the `ELECTRON_MIRROR` variable to point to a different provider:
```sh
# Europe / US
$ npm install

# Asia / Oceania
$ ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/" npm install
```

## License
MIT
