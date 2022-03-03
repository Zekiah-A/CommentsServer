const fs = require('fs')
const http = require("http");

const host = 'localhost';
const port = 8000;

const defaultContent =
"<div class=\"comment\">\n" +
"   <em>Anonymous said:</em>\n" +
"   <p>This is the worst anthology I've ever read!!</p>\n" +
"</div>\n";

const requestListener = function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(200);

    fs.readFile("comments.html", 'utf8' , (err, newContent) => {
        if (err) {
          console.error(err)
          return
        }

        res.end(newContent);
    })
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);

    if (!fs.existsSync("comments.html"))
    {
        fs.writeFile("comments.html", defaultContent, err => {
            if (err) {
                console.error(err);
                return;
            }
        })
    }
});
