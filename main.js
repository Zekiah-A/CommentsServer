const fs = require('fs')
const http = require("http");

const host = 'localhost';
const port = 8000;

const defaultContent =
"<div class=\"comment\">\n" +
"   <em>NAME said:</em>\n" +
"   <p>CONTENT</p>\n" +
"</div>\n";

const requestListener = function (req, res) { //request response
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(200);

    if (req.method == "GET")
    {
        fs.readFile("comments.html", 'utf8' , (err, newContent) => {
            if (err) {
                console.error(err)
                return
            }

            res.end(newContent);
        })
    }
    if (req.method == "POST")
    {
        let body = '';
        req.on('data', chunk => {
            //Convert Buffer to string
            body += chunk.toString();
        });
        req.on('end', () => {
            fs.readFile("comments.html", (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }

                var newComments = defaultContent.replace("NAME", "Anonymous").replace("CONTENT", body) + "\n" + data;
                fs.writeFile("comments.html", newComments, err => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                })
            })    
        });
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);

    if (!fs.existsSync("comments.html"))
    {
        fs.writeFile("comments.html", "", err => {
            if (err) {
                console.error(err);
                return;
            }
        })
    }
});
