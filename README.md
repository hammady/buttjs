# buttjs
Pure Javascript client for [BUTT](https://danielnoethen.de/butt/) (Broadcast Using This Tool).
It offers both a command line interface and a Javascript API. The command line interface
is suitable for a drop-in replacement for the official BUTT client. The Javascript API
is suitable for use in your own NodeJS applications.

## Installation

If you intend to use the command line interface, you can install the package globally with:

```bash
npm install -g buttjs
```

If you intend to use the Javascript API, you can install the package locally in your
NodeJS package root directory with:

```bash
npm install --save buttjs
```

## Usage

### Command line interface

Type `buttjs` to see the command line options and usage.

```bash
$ buttjs --help

Usage: buttjs [options]

Pure Javascript client for BUTT (Broadcast Using This Tool)

Options:
  -v, --version                                   output the version number
  -s, --start-streaming                           connect to streaming server
  -d, --stop-streaming                            disconnect from streaming server
  -r, --start-recording                           start recording
  -t, --stop-recording                            stop recording
  -n, --split-recording                           split recording
  -q, --quit                                      quit butt
  -u, --update-song-name <string>                 update song name
  -S, --get-status                                request status
  -M, --set-streaming-signal-threshold <number>   set streaming signal threshold (seconds)
  -m, --set-streaming-silence-threshold <number>  set streaming silence threshold (seconds)
  -O, --set-recording-signal-threshold <number>   set recording signal threshold (seconds)
  -o, --set-recording-silence-threshold <number>  set recording silence threshold (seconds)
  -U, --udp                                       connect via UDP instead of TCP
  -a, --address <string>                          address of the butt instance to be controlled (default: "127.0.0.1")
  -p, --port <number>                             port of the butt instance to be controlled (default: 1256)
  -h, --help                                      display help for command
```

### Javascript API

In your NodeJS application, you can use the `buttjs` module to access the butt instance.

```javascript
let ButtClient = require("buttjs");
let host = "127.0.0.1"; // replace with actual IP
let port = 1256; // replace with actual port
let client = new ButtClient(host, port);
```

The following methods are available:

```javascript
client.startStreaming(callback);
client.stopStreaming(callback);
client.startRecording(callback);
client.stopRecording(callback);
client.splitRecording(callback);
client.quit(callback);
client.updateSongName(song, callback);
client.setStreamingSignalThreshold(threshold, callback);
client.setStreamingSilenceThreshold(threshold, callback);
client.setRecordingSignalThreshold(threshold, callback);
client.setRecordingSilenceThreshold(threshold, callback);
client.getStatus(statusCallback);
```

Callback functions are called with the following arguments: `error` and `status`.

Example callback:

```javascript
let callback = function (err, _) {
  if (!err) {
    // success
  } else {
    console.error(err);
  }
};
```

Example status callback:
    
```javascript
let statusCallback = function (err, status) {
  if (!err) {
    if (status) {
      console.log(status);
    } else {
      console.error("No status received.");
    }
  } else {
    console.error(err);
  }
};
```

On success, the above callback will print the status object as follows:

```
{
  connected: false,
  connecting: false,
  recording: false,
  signalDetected: true,
  silenceDetected: false,
  volumeLeft: -26,
  volumeRight: -26,
  streamSeconds: 0,
  streamKByte: 0,
  recordSeconds: 0,
  recordKByte: 0,
  song: '',
  recPath: ''
}
```

### Debugging

`buttjs` supports [debug module](https://www.npmjs.com/package/debug) for logging.
If the `DEBUG` environment variable is set to `*`, or if it includes the name of the
package (`buttjs`), debug logging will be enabled.

## Author

Hossam Hammady: <github@hammady.net>

## License

MIT License

Copyright (c) 2022 Hossam Hammady
