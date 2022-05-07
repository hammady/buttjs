let ButtClient = require("./index");
let host = process.env.SERVER_HOST || "localhost";
let port = process.env.SERVER_PORT || "1256";
let client = new ButtClient(host, port);
client.startRecording(function (err, _) {
  if (!err) {
    setTimeout(() => {
      client.stopRecording(function (err, _) {
        if (!err) {
          setTimeout(() => {
            client.updateSongName(
              "This is a test song name that is somehow not so short but too long to test response buffering. ".repeat(
                5
              ),
              function (err, _) {
                if (!err) {
                  setTimeout(() => {
                    client.getStatus(function (err, status) {
                      if (!err) {
                        if (status) {
                          console.log("Connected: " + status.connected);
                          console.log("Connecting: " + status.connecting);
                          console.log("Recording: " + status.recording);
                          console.log(
                            "Signal detected: " + status.signalDetected
                          );
                          console.log(
                            "Silence detected: " + status.silenceDetected
                          );
                          console.log("Volume left: " + status.volumeLeft);
                          console.log("Volume right: " + status.volumeRight);
                          console.log(
                            "Stream seconds: " + status.streamSeconds
                          );
                          console.log("Stream kByte: " + status.streamKByte);
                          console.log(
                            "Record seconds: " + status.recordSeconds
                          );
                          console.log("Record kByte: " + status.recordKByte);
                          console.log(
                            'Song: "' + status.song + '" of length: ',
                            status.song.length
                          );
                          console.log(
                            'Recording path: "' +
                              status.recPath +
                              '" of length: ',
                            status.recPath.length
                          );
                        } else {
                          console.log("No status received.");
                        }
                      } else {
                        console.log(err);
                        process.exit(1);
                      }
                    });
                  }, 100);
                } else {
                  console.log(err);
                  process.exit(1);
                }
              }
            );
          }, 100);
        } else {
          console.log(err);
          process.exit(1);
        }
      });
    }, 100);
  } else {
    console.log(err);
    process.exit(1);
  }
});
