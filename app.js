let Butt = require("./index");
let host = process.env.SERVER_HOST || "localhost";
let port = process.env.SERVER_PORT || "1256";
let client = new Butt.Client(host, port);
client.startRecording(function (err, _) {
  if (!err) {
    setTimeout(() => {
      client.stopRecording(function (err, _) {
        if (!err) {
          setTimeout(() => {
            client.updateSongName("test", function (err, _) {
              if (!err) {
                setTimeout(() => {
                  client.getStatus(function (err, status) {
                    if (!err) {
                      console.log(status.toString());
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
