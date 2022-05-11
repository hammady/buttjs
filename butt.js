#!/usr/bin/env node

const { Command } = require("commander");
const program = new Command();

// load version from package.json
const pkg = require("./package.json");

program
  .version(pkg.version, "-v, --version")
  .description("Pure Javascript client for BUTT (Broadcast Using This Tool)")
  .option("-s, --start-streaming", "connect to streaming server")
  .option("-d, --stop-streaming", "disconnect from streaming server")
  .option("-r, --start-recording", "start recording")
  .option("-t, --stop-recording", "stop recording")
  .option("-n, --split-recording", "split recording")
  .option("-q, --quit", "quit butt")
  .option("-u, --update-song-name <string>", "update song name")
  .option("-S, --get-status", "request status")
  .option(
    "-M, --set-streaming-signal-threshold <number>",
    "set streaming signal threshold (seconds)"
  )
  .option(
    "-m, --set-streaming-silence-threshold <number>",
    "set streaming silence threshold (seconds)"
  )
  .option(
    "-O, --set-recording-signal-threshold <number>",
    "set recording signal threshold (seconds)"
  )
  .option(
    "-o, --set-recording-silence-threshold <number>",
    "set recording silence threshold (seconds)"
  )
  .option("-U, --udp", "connect via UDP instead of TCP")
  .option(
    "-a, --address <string>",
    "address of the butt instance to be controlled",
    "127.0.0.1"
  )
  .option(
    "-p, --port <number>",
    "port of the butt instance to be controlled",
    1256
  );

program.parse(process.argv);
const options = program.opts();

let ButtClient = require("./index");
let host = options.address;
let port = options.port;
let client = new ButtClient(host, port, options.udp);

let callback = function (err, _) {
  if (!err) {
    process.exit(0);
  } else {
    console.error(err);
    process.exit(1);
  }
};

let statusCallback = function (err, status) {
  if (!err) {
    if (status) {
      console.log("connected:", status.connected ? 1 : 0);
      console.log("connecting:", status.connecting ? 1 : 0);
      console.log("recording:", status.recording ? 1 : 0);
      console.log("signal present:", status.signalDetected ? 1 : 0);
      console.log("signal absent:", status.silenceDetected ? 1 : 0);
      console.log("stream seconds:", status.streamSeconds);
      console.log("stream kBytes:", status.streamKByte);
      console.log("record seconds:", status.recordSeconds);
      console.log("record kBytes:", status.recordKByte);
      console.log("volume left:", status.volumeLeft);
      console.log("volume right:", status.volumeRight);
      console.log("song:", status.song);
      console.log("record path:", status.recPath);
      process.exit(0);
    } else {
      console.error("No status received.");
      process.exit(1);
    }
  } else {
    console.error(err);
    process.exit(1);
  }
};

if (options.startStreaming !== undefined) {
  client.startStreaming(callback);
} else if (options.stopStreaming !== undefined) {
  client.stopStreaming(callback);
} else if (options.startRecording !== undefined) {
  client.startRecording(callback);
} else if (options.stopRecording !== undefined) {
  client.stopRecording(callback);
} else if (options.splitRecording !== undefined) {
  client.splitRecording(callback);
} else if (options.quit !== undefined) {
  client.quit(callback);
} else if (options.updateSongName !== undefined) {
  client.updateSongName(options.updateSongName, callback);
} else if (options.setStreamingSignalThreshold !== undefined) {
  client.setStreamingSignalThreshold(
    options.setStreamingSignalThreshold,
    callback
  );
} else if (options.setStreamingSilenceThreshold !== undefined) {
  client.setStreamingSilenceThreshold(
    options.setStreamingSilenceThreshold,
    callback
  );
} else if (options.setRecordingSignalThreshold !== undefined) {
  client.setRecordingSignalThreshold(
    options.setRecordingSignalThreshold,
    callback
  );
} else if (options.setRecordingSilenceThreshold !== undefined) {
  client.setRecordingSilenceThreshold(
    options.setRecordingSilenceThreshold,
    callback
  );
} else if (options.getStatus !== undefined) {
  client.getStatus(statusCallback);
} else {
  console.error("No command specified.");
  program.help();
}
