const fs = require("fs")
const http = require("http");
const https = require('https');

var host = "localhost";
var port = 8000;
var adminPasscode = "";

const maxNameCharacters = 16;
const maxEmailCharacters = 24;
const maxMessageCharacters = 4096;
const minMessageCharacters = 2;

const defaultContent =
"<div class=\"comment\">\n" +
"   <em title=\"EMAIL\">NAME said:</em>\n" +
"   <em class=\"comment-date\">DATE</em>\n" +
"   <p>CONTENT</p>\n" +
"</div>\n";

function urlify(string) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return string.replace(urlRegex, function(url) {
      return '<a href="' + url + '">' + url + '</a>';
    })
}

//Check for empty / whitespace strings
function isBlank(string) {
    return (!string || /^\s*$/.test(string));
}

const requestListener = function (req, res) { //request (incoming) response (outgoing)
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(200);

    if (req.method == "GET") {
        fs.readFile("comments.html", 'utf8' , (err, newContent) => {
            if (err) {
                console.error(err)
                return
            }

            res.end(newContent);
        });
    }
    if (req.method == "POST") {
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

                //Generated ANSI escape codes from @https://ansi.gabebanks.net/
                try {
                    var commentObject = JSON.parse(body);

                    if (isBlank(commentObject.name)) { //Check for blank name
                        commentObject.name = "Anonymous";
                    }
                    if (isBlank(commentObject.email) || !commentObject.email.includes("@")) { //Check for blank or invalid email 
                        commentObject.email = "anonymous@anonymous.com";
                    }
                    if (isBlank(commentObject.message) || commentObject.message.trim().length <= minMessageCharacters) { //Check for blank message
                        console.log("\033[90;49;3mEmpty or spam comment detected, rejecting.\033[0m");
                        return;
                    }

                    commentObject.name = commentObject.name.substring(0, maxNameCharacters);
                    commentObject.email = commentObject.email.substring(0, maxEmailCharacters);
                    commentObject.message = commentObject.message.substring(0, maxMessageCharacters);
                    commentObject.message = urlify(commentObject.message);

                    let date = new Date();
                    var bodyHTML = commentObject.message.replaceAll("\n", "<br>");
                    var newComments = defaultContent
                        .replace("EMAIL", commentObject.email)
                        .replace("NAME", commentObject.name)
                        .replace("DATE", `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`)
                        .replace("CONTENT", bodyHTML) + "\n" + data
                    ;

                    fs.writeFile("comments.html", newComments, err => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        console.log("\033[90;49;3mSucessfully added comment | " + req.socket.remoteAddress + " | " + commentObject.name + " | " + commentObject.email + " | " +  commentObject.message + "\033[0m");
                    });
                }
                catch (exception) {
                    console.error(`Critical failure when posting message:\n${exception}`)
                }
            });
        });
    }
};

function startServer() {
    if (!fs.existsSync("comments_server.conf")) {
        const defaultConfig = {host: host, port: port, adminPasscode: adminPasscode, httpsEnabled: false, certPath: "", keyPath: "" };

        fs.writeFile("comments_server.conf", JSON.stringify(defaultConfig, null, 2), err => {
            if (err) {
                console.error(err);
                return;
            }
        });
    }

    fs.readFile("comments_server.conf", 'utf8' , (err, config) => {
        if (err) {
            console.error(err)
            return
        }

        var configObject = JSON.parse(config);
        host = configObject.host;
        port = configObject.port;
        adminPasscode = configObject.adminPasscode;
        httpsEnabled = configObject.httpsEnabled;
        var server;

        if (configObject.httpsEnabled) {
            const options = {
                key: fs.readFileSync(configObject.keyPath),
                cert: fs.readFileSync(configObject.certPath)
            };

            server = https.createServer(options, requestListener);
        }
        else {
            server = http.createServer(requestListener);
        }

        server.listen(port, host, () => {
            console.log(`Server is running on http${configObject.httpsEnabled ? "s" : ""}://${host}:${port}`);
        
            if (!fs.existsSync("comments.html"))
            {
                fs.writeFile("comments.html", "", err => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
            }
        });    
    });
}

startServer();
