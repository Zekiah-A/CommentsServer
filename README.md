# Subliminal Comments Server
Simple JS webserver, used for hosting comments on the Subliminal poetry anthology. 

## Running:

### First run:
To start the webserver, have node.js installed, and run `node main.js`.

### Running with HTTP:
Running with HTTP is fairly simple, however keep in mind that this is probably only useful for testing, since most modern browsers will block you connecting to non-HTTPS sites.
- After the first run, in the webserver config, set up the port to whatever is available on your system, and the host to your local ip (192.168.1.x).
    ```
    {
        "host": "192.168.1.253", <--- local ip
        "port": 443, <--- port of choice
        ...
    ```
    (the <--- arrows should not be part of the config, if not obvious).

- Get a domain name, the easiest way to get a free domain is through noip.com. Make sure you have port forwarded the port set in the webserver config in your wifi routers, and have the ip for the port forward set to your local network IP (192.168.1.x). Set your DNS domain to route to your public IP (can be found on ipchicken.com), and make sure that it is routing to the correct port. By default, most DNS providers use port _80_.
- Launch the webserver with `node main.js`.
- Bon voilá! You should nw have a working HTTP subliminal comments webserver.

### Running with HTTPS:
From experience, HTTPS is a bit confusing to set up, so to make it easier to do so, here is the easiest way to spin up HTTPS support with this webserver.
- Get a domain name, the easiest way to get a free domain is through noip.com. Make sure you have port forwarded ports 443 and 80 in your wifi routers, and have the ip for the port forward set to your local network IP (192.168.1.x). Set your DNS domain to route to your public IP (can be found on ipchicken.com).
- Use a certification tool, such as certbot, to generate the necessary HTTPS certificates. The easiest way is to run `sudo certbot certonly` > `Spin up a temporary webserver `
- Go into the webserver config, and set:
    ```
    {
        "host": "192.168.1.253", <--- local ip
        "port": 443, <--- https / ssl port (could work with 80)
        "adminPasscode": "", <---
        "httpsEnabled": true, <--- set https to enabled
        "certPath": "/path/to/certificate/generated/by/certbot", <--- set this
        "keyPath": "/path/to/key/generated/by/certbot" <--- set this
    }
    ```
    (the <--- arrows should not be part of the config, if not obvious).

- Launch the webserver with root permissions (`sudo node main.js` on linux & macos).
- Bon voilá! You should nw have a working HTTPS subliminal comments webserver.

### Running with a script:
A small shell script has been provided so that you can have the server constantly run, even in the event of an unexpected close. This script does not have any functionality past this, and the server will still need to be set up manually.