const net = require("net");
const Buffer = require("buffer").Buffer;
const debug = require("debug")("buttjs");

let Response = function () {
  var buff = new Buffer.alloc(0);
  var me = this;

  var verifyBufferLength = function (offset, expectedLength) {
    if (offset + expectedLength > buff.length) {
      throw new Error(
        "Not enough data to read " +
          expectedLength +
          " bytes at offset " +
          offset
      );
    }
  };

  var readNumberIfExists = function (readFunction, offset, expectedLength) {
    verifyBufferLength(offset, expectedLength);
    return readFunction.call(buff, offset);
  };

  var readStringIfExists = function (offset, expectedLength) {
    verifyBufferLength(offset, expectedLength);
    return buff.toString("utf8", offset, offset + expectedLength);
  };

  var processResponse = function () {
    var status = {};
    const flags = readNumberIfExists(buff.readUInt32LE, 0, 4);
    status.connected = (flags & 0x01) !== 0;
    status.connecting = (flags & 0x02) !== 0;
    status.recording = (flags & 0x04) !== 0;
    status.signalDetected = (flags & 0x08) !== 0;
    status.silenceDetected = (flags & 0x10) !== 0;

    const isExtended = (flags & 0x80000000) !== 0;
    if (isExtended) {
      const version = readNumberIfExists(buff.readUInt16LE, 4, 2);
      if (version == 2) {
        status.volumeLeft = readNumberIfExists(buff.readInt16LE, 6, 2) / 10.0;
        status.volumeRight = readNumberIfExists(buff.readInt16LE, 8, 2) / 10.0;
        status.streamSeconds = readNumberIfExists(buff.readUInt32LE, 10, 4);
        status.streamKByte = readNumberIfExists(buff.readUInt32LE, 14, 4);
        status.recordSeconds = readNumberIfExists(buff.readUInt32LE, 18, 4);
        status.recordKByte = readNumberIfExists(buff.readUInt32LE, 22, 4);
        const songLen = readNumberIfExists(buff.readUInt16LE, 26, 2);
        debug("songLen:", songLen);
        const recPathLen = readNumberIfExists(buff.readUInt16LE, 28, 2);
        debug("recPathLen:", recPathLen);

        status.song = readStringIfExists(30, songLen - 1);
        status.recPath = readStringIfExists(30 + songLen, recPathLen - 1);
      } else {
        throw new Error("Unknown version: " + version);
      }
    }
    me.status = status;
  };

  this.appendData = function (data) {
    let source = new Buffer.from(data);
    buff = Buffer.concat([buff, source]);
    try {
      processResponse();
    } catch (e) {
      debug("Warning: " + e);
    }
  };
};

module.exports = function ButtClient(host, port, udp) {
  if (udp) {
    throw new Error("UDP is not supported yet");
  }
  debug("ButtClient: " + host + ":" + port);

  let COMMANDS = {
    CMD_CONNECT: 1,
    CMD_DISCONNECT: 2,
    CMD_START_RECORDING: 3,
    CMD_STOP_RECORDING: 4,
    CMD_GET_STATUS: 5,
    CMD_SPLIT_RECORDING: 6,
    CMD_QUIT: 7,
    CMD_UPDATE_SONGNAME: 8,
    CMD_SET_STREAM_SIGNAL_THRESHOLD: 9,
    CMD_SET_STREAM_SILENCE_THRESHOLD: 10,
    CMD_SET_RECORD_SIGNAL_THRESHOLD: 11,
    CMD_SET_RECORD_SILENCE_THRESHOLD: 12,
  };

  var error, response;

  let sendCommand = function (command, parameter, callback) {
    var client = new net.Socket(); // must create new socket for each command
    error = null;
    response = new Response();
    client.on("error", function (err) {
      debug("Received error event on socket: " + err);
      error = err;
    });
    client.on("data", function (data) {
      debug("Received data of length " + data.length);
      response.appendData(data);
    });
    client.on("close", function () {
      debug("Connection closed");
      callback(error, response.status);
    });
    client.setTimeout(3000);
    client.on("timeout", () => {
      debug("Connection timed out");
      client.destroy();
      error = new Error("Timeout");
    });
    client.connect(port, host, function () {
      debug("Sending command: " + command + " with parameter: " + parameter);
      let padding = 8;
      var parameterLength, parameterBuffer;
      if (typeof parameter === "number") parameterLength = 4;
      else if (typeof parameter === "string") {
        parameterBuffer = Buffer.from(parameter, "utf8");
        parameterLength = parameterBuffer.length + 1;
        debug("String parameter length: " + parameterLength);
      } else if (typeof parameter === "undefined" || parameter === null)
        parameterLength = 0;
      else
        throw new Error(
          "If set, parameter must be a number or string. Got " +
            typeof parameter
        );
      var buff = Buffer.alloc(4 + 4 + padding + parameterLength, 0);
      debug("Allocated buffer of length " + buff.length);
      buff.writeUInt32LE(command, 0);
      buff.writeUInt32LE(parameterLength, 4);
      if (parameterLength > 0) {
        if (typeof parameter === "number")
          buff.writeUInt32LE(parameter, 8 + padding);
        else if (typeof parameter === "string") {
          parameterBuffer.copy(buff, 8 + padding);
          buff.writeUInt8(0, 8 + padding + parameterLength - 1);
        }
      }
      client.write(buff);
      debug("Sent buffer with length: " + buff.length);
    });
  };

  this.startStreaming = function (callback) {
    sendCommand(COMMANDS.CMD_CONNECT, null, callback);
  };

  this.stopStreaming = function (callback) {
    sendCommand(COMMANDS.CMD_DISCONNECT, null, callback);
  };

  this.startRecording = function (callback) {
    sendCommand(COMMANDS.CMD_START_RECORDING, null, callback);
  };

  this.stopRecording = function (callback) {
    sendCommand(COMMANDS.CMD_STOP_RECORDING, null, callback);
  };

  this.splitRecording = function (callback) {
    sendCommand(COMMANDS.CMD_SPLIT_RECORDING, null, callback);
  };

  this.quit = function (callback) {
    sendCommand(COMMANDS.CMD_QUIT, null, callback);
  };

  this.updateSongName = function (name, callback) {
    sendCommand(COMMANDS.CMD_UPDATE_SONGNAME, name, callback);
  };

  this.setStreamingSignalThreshold = function (threshold, callback) {
    sendCommand(
      COMMANDS.CMD_SET_STREAM_SIGNAL_THRESHOLD,
      parseInt(threshold),
      callback
    );
  };

  this.setStreamingSilenceThreshold = function (threshold, callback) {
    sendCommand(
      COMMANDS.CMD_SET_STREAM_SILENCE_THRESHOLD,
      parseInt(threshold),
      callback
    );
  };

  this.setRecordingSignalThreshold = function (threshold, callback) {
    sendCommand(
      COMMANDS.CMD_SET_RECORD_SIGNAL_THRESHOLD,
      parseInt(threshold),
      callback
    );
  };

  this.setRecordingSilenceThreshold = function (threshold, callback) {
    sendCommand(
      COMMANDS.CMD_SET_RECORD_SILENCE_THRESHOLD,
      parseInt(threshold),
      callback
    );
  };

  this.getStatus = function (callback) {
    sendCommand(COMMANDS.CMD_GET_STATUS, null, callback);
  };
};
