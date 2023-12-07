<br>
<p><strong>flick-flip</strong></p>

A class that uses the power of `Node.js` and the `fluent-ffmpeg` and `ffmpeg-static` video tools to batch process video files into `*.mp4` and `*.webm` formats.

<br>

&#10148; **Install**

```console
$ yarn
```

<br>

&#10148; **Usage**

**1.** Put `*.mp4` files in the `input/` directory.<br>
**2.** `$ yarn start`<br>
**3.** Take the compressed `*.mp4` and `*.webm` files from the `output/` directory.

<br>

&#10148; **Settings**

```javascript
this.mp4 = {
  setCodec: 'libx265',
  setBitrate: '1000k',
  setSegments: 16,
  setOptions: '-crf 28',
}

this.webm = {
  setCodec: 'libvpx-vp9',
  setBitrate: '800k',
  setSegments: 16,
  setOptions: '-crf 29',
}
```
<br>

&#10148; **License**

flick-flip is released under MIT license.
