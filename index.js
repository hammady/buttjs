const net = require("net");
const Buffer = require("buffer").Buffer;

let Status = function () {
  var buff = new Buffer.alloc(0);

  this.toString = function () {
    return "BUTT status: " + buff.toString();
  };

  this.appendData = function (data) {
    let source = new Buffer.from(data);
    buff = Buffer.concat([buff, source]);
  };
};

module.exports = {
  Status: Status,
  Client: function ButtClient(host, port, udp) {
    if (udp) {
      throw new Error("UDP is not supported yet");
    }
    // TODO remove this or identify log levels
    console.log("ButtClient: " + host + ":" + port);

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

    var error, status;

    let sendCommand = function (command, parameter, callback) {
      var client = new net.Socket(); // must create new socket for each command
      error = null;
      status = null;
      client.on("error", function (err) {
        error = err;
      });
      client.on("data", function (data) {
        console.log("Received data of length " + data.length);
        if (status == null) status = new Status();
        status.appendData(data);
      });
      client.on("close", function () {
        console.log("Connection closed");
        callback(error, status);
      });
      client.setTimeout(3000);
      client.on("timeout", () => {
        client.destroy();
        error = new Error("Timeout");
      });
      client.connect(port, host, function () {
        console.log(
          "Sending command: " + command + " with parameter: " + parameter
        );
        let padding = 8;
        var parameterLength;
        if (typeof parameter === "number") parameterLength = 4;
        else if (typeof parameter === "string")
          parameterLength = parameter.length; // TODO encoding?
        else if (typeof parameter === "undefined" || parameter === null)
          parameterLength = 0;
        else
          throw new Error(
            "If set, parameter must be a number or string. Got " +
              typeof parameter
          );
        var buff = Buffer.alloc(4 + 4 + padding + parameterLength, 0);
        buff.writeUInt32LE(command, 0);
        buff.writeUInt32LE(parameterLength, 4);
        if (parameterLength > 0) {
          if (typeof parameter === "number")
            buff.writeUInt32LE(parameter, 8 + padding);
          else if (typeof parameter === "string") {
            buff.write(parameter, 8 + padding);
          }
        }
        client.write(buff);
        console.log("Sent buffer with length: " + buff.length);
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

    this.setStreamSignalThreshold = function (threshold, callback) {
      sendCommand(
        COMMANDS.CMD_SET_STREAM_SIGNAL_THRESHOLD,
        threshold,
        callback
      );
    };

    this.setStreamSilenceThreshold = function (threshold, callback) {
      sendCommand(
        COMMANDS.CMD_SET_STREAM_SILENCE_THRESHOLD,
        threshold,
        callback
      );
    };

    this.setRecordingSignalThreshold = function (threshold, callback) {
      sendCommand(
        COMMANDS.CMD_SET_RECORD_SIGNAL_THRESHOLD,
        threshold,
        callback
      );
    };

    this.setRecordingSilenceThreshold = function (threshold, callback) {
      sendCommand(
        COMMANDS.CMD_SET_RECORD_SILENCE_THRESHOLD,
        threshold,
        callback
      );
    };

    this.getStatus = function (callback) {
      sendCommand(COMMANDS.CMD_GET_STATUS, null, callback);
    };
  },
};
