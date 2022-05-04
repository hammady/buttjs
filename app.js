let ButtClient = require("./index");
let host = process.env.SERVER_HOST || "localhost";
let port = process.env.SERVER_PORT || "1256";
let client = new ButtClient(host, port);
client.startRecording(function () {
  setTimeout(() => {
    client.stopRecording(function () {
      setTimeout(() => {
        client.updateSongName("test", function () {
          setTimeout(() => {
            client.getStatus(function (status) {
              console.log(status);
              console.log("done");
            });
          }, 1000);
        });
      }, 1000);
    });
  }, 1000);
});
