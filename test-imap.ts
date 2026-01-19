
import Imap from "imap";

const config = {
  user: "info@zoolspeed.com",
  password: "ZoolSpeed@2009",
  host: "imap.hostinger.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

const imap = new Imap(config);

imap.once("ready", () => {
  console.log("IMAP Connection Ready!");
  imap.openBox("INBOX", true, (err, box) => {
    if (err) {
      console.error("OpenBox Error:", err);
      imap.end();
      return;
    }
    console.log("Total messages:", box.messages.total);
    imap.end();
  });
});

imap.once("error", (err: any) => {
  console.error("IMAP Error:", err);
});

imap.once("end", () => {
  console.log("IMAP Connection Ended");
});

imap.connect();
