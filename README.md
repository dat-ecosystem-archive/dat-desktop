<h1 align="center">Dat Desktop</h1>

<div align="center">
  <strong>Peer to peer data sharing app built for humans.</strong>
</div>

<br />

<div align="center">
  <!-- Build Status -->
  <a href="https://travis-ci.org/datproject/dat-desktop">
    <img src="https://img.shields.io/travis/datproject/dat-desktop/master.svg?style=flat-square"
      alt="Build Status" />
  </a>
  <!-- Standard -->
  <a href="https://standardjs.com">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"
      alt="Standard" />
  </a>
</div>

![screenshot](assets/screenshot.png)

## Table of Content
- [Download](#download)
- [Commands](#commands)
- [FAQ](#faq)
- [License](#license)

## Download

To run the app locally check out our [download
guide](https://datproject.org/install) or install directly from the command
line using [Homebrew Cask](https://caskroom.github.io). Currently only MacOS is
supported.

```sh
$ brew update && brew cask install dat
```

## Commands

```bash
$ npm install             # install dependencies
$ npm start               # start the application
$ npm run dist            # compile the app into an ASAR file to release
$ npm start --data=<dir>  # change the path for new dat archives (default ~/Downloads/dat)
$ npm start --db=<dir>    # change the path for users settings (default ~/.dat-desktop)
```

## FAQ

### How can I speed up downloading Electron?
If you’re not in Europe or the US, you might want to use a different mirror for `electron`.
You can set the `ELECTRON_MIRROR` variable to point to a different provider:
```sh
# Europe / US
$ npm install

# Asia / Oceania
$ ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/" npm install
```

## License
MIT

## Font Attribution & License
SourceSansPro-Regular.ttf: Copyright 2010, 2012 Adobe Systems Incorporated (http://www.adobe.com/), with Reserved Font Name 'Source'. All Rights Reserved. Source is a trademark of Adobe Systems Incorporated in the United States and/or other countries. [SIL Open Font License, 1.1](http://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL)

SourceCodePro-Regular.ttf: Copyright 2010, 2012 Adobe Systems Incorporated. All Rights Reserved. [SIL Open Font License, 1.1](http://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL)
