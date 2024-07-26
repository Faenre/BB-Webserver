# BB-Webserver

## ⚠️ Currently in development! ⚠️

So long as this section exists, consider this repository as **highly** in-dev and not intended for use. This section will be replaced with a versioning system later on.

## What is this?

BB-Webserver is a spoiler-free, portable, HTTP-themed, multi-purpose, structured API webserver for [Bitburner](https://github.com/bitburner-official/bitburner-src) that allows bidirectional communication between the server and any number of clients.

- **Spoiler-Free**: This Readme, and the code, contain none of the endgame APIs, nor does this server offer any suggestions on how to actually solve any of the ingame problems. There are no pre-designed strategies. However, it is my hope that reading this guide may encourage newer players to think about ways to write scripts that work together.
- **Portable**: By default, this webserver uses 1.60GB RAM (per the <u>ingame resource</u>, not actual machine hardware ram). This means you can run it on any ingame server that allows scripts, including rented servers or even on `n00dles` or `foodnstuff`. Of course, depending on what Endpoints you write, this RAM requirement may go up.
- **HTTP-themed**: The underlying game does not meaningfully encourage HTML documents, (although it is possible to render React nodes inside terminal windows). Further, due to game-specific design implementations, BB-Webserver does not implement the full HTTP spec. However, it does borrow components such as message bodies, endpoints, and status codes that follow the HTTP principles.
- **Multi-Purpose**: Many repositories that are shared for Bitburner are collections of user scripts that perform single tasks, or other single-purposed tools. This webserver is a single Javascript server that runs in a single process but it can be extended by the player to suit any of their client-server architectural needs, including data processing, worker orchestration, metrics gathering, and more.
- **Structured API**: The API design is lightweight, but provides a standardized structure that serves its purpose and gets out of the way. Essentially, a minimal amount of request metadata is sent along with each request for the purpose of ensuring communication continuity while requiring as minimal mental-overhead to learn as possible.

This is the first component to my project of bringing modern webapp infrastructure into the Bitburner coding sandbox. I also intend to implement datastores, like MongoDB or Redis.

## How to use

1. Copy [[src/webserver.js]] into your game, either manually or with wget:

   ```shell
   wget https://raw.githubusercontent.com/Faenre/BB-Webserver/main/src/webserver.js webserver.js
   ```

2. Run it ingame:

   ```shell
   run ./webserver.js
   ```

3. Send messages to it within other apps:

   ```js
   export async function main(ns) {
     const myData = {
         "this": "is",
         "my": "data!",
       }
     sendData(ns, myData);
     
     const echoData = await readData(ns);
     ns.tprint(JSON.stringify(echoData));
   }
   
   function sendData(ns, data) {
     const endpoint = "echo";
     const from = ns.getHostname();
     ns.writePort(1001, JSON.stringify({endpoint, from, data}));
   }
   
   async function readData(ns) {
     while (JSON.parse(ns.peek(1002)).to !== ns.getHostname())
       ns.sleep(1000);
     return JSON.parse(ns.readPort(1002));
   }
   ```

4. Write your own endpoints!

   ```js 
   
   const ENDPOINTS = {
     'echo': Endpoints.echo,
     'dummyHGW': Endpoints.dummyHGW,
   }
   
   class Endpoints {
   	// Testing endpoint, for ensuring clients can communicate back and forth
   	static echo(data) {
   		return [STATUS.OK, data];
   	}
   
   	// @TODO implement this
   	static dummyHGW(data) {
   		const ram = data.ram;
   		const cores = data.cores;
   
   		const h = 1;
   		const g = 1;
   		const w = 1;
   		return [STATUS.OK, { h, g, w }];
   	}
   }
   ```

   

