const fs = require('fs')
const http = require("http");

const host = 'localhost';
const port = 8000;

const maxNameCharacters = 16;
const maxEmailCharacters = 24;
const maxMessageCharacters = 4096;

const defaultContent =
"<div class=\"comment\">\n" +
"   <em>NAME said:</em>\n" +
"   <p>CONTENT</p>\n" +
"</div>\n";

function isBlank(string) { //empty / whitespace strings
    return (!string || /^\s*$/.test(string));
}

const requestListener = function (req, res) { //request (incoming) response (outgoing)
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

                //Generated ANSI escape codes from @https://ansi.gabebanks.net/ 
                var commentObject = JSON.parse(body);
                if (isBlank(commentObject.name)) { //Check for blank name
                    commentObject.name = "Anonymous";
                }
                if (isBlank(commentObject.email) || !commentObject.email.includes("@")) { //Check for blank or invalid email 
                    commentObject.email = "anonymous@anonymous.com";
                }
                if (isBlank(commentObject.message)) { //Check for blank message
                    console.log("\033[90;49;3mEmpty comment detected, rejecting.\033[0m");
                    return;
                }

                //Trim name, email and message to prevent spam.
                commentObject.name = commentObject.name.substring(0, maxNameCharacters);
                commentObject.email = commentObject.email.substring(0, maxEmailCharacters);
                commentObject.message = commentObject.message.substring(0, maxMessageCharacters);

                var bodyHTML = commentObject.message.replaceAll("\n", "<br>");
                var newComments = "<!--" + commentObject.email + "-->\n" + defaultContent.replace("NAME", commentObject.name).replace("CONTENT", bodyHTML) + "\n" + data;

                fs.writeFile("comments.html", newComments, err => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    console.log("\033[90;49;3mSucessfully added comment | " + req.socket.remoteAddress + " | " + commentObject.name + " | " + commentObject.email + " | " +  commentObject.message + "\033[0m");
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
