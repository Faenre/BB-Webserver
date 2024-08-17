# BB-Webserver



## What is this?

BB-Webserver is a spoiler-free, portable, HTTP-themed, multi-purpose, RESTful JSON API webserver for [Bitburner](https://github.com/bitburner-official/bitburner-src) that allows bidirectional communication between the server and any number of clients.

- **Spoiler-Free**: This Readme, and the code, contain none of the endgame APIs, nor does this server offer any suggestions on how to actually solve any of the ingame problems. There are no pre-designed strategies. However, it is my hope that reading this guide may encourage newer players to think about ways to write scripts that work together.
- **Portable**: By default, this webserver uses 1.60GB RAM (per the <u>ingame resource</u>, not actual machine hardware ram). This means you can run it on any ingame server that allows scripts, including rented servers or even on `n00dles` or `foodnstuff`. Of course, depending on what Endpoints you write, this RAM requirement may go up.
  - If the user intends to write endpoints with high RAM costs, I -do- recommend considering worker processes, but any such implementation is an exercise for the player. The `102 PROCESSING` HTTP code is included for this exact scenario!

- **HTTP-themed**: The underlying game does not meaningfully encourage HTML documents, (although it certainly is possible to render React nodes and adjust the DOM). Further, there are no "GET" or "POST" requests, there are only Port read/write operations. Due to game-specific design implementations, BB-Webserver does not implement the full HTTP spec. However, it does borrow HTTP status codes and the general POST json payload process.
- **Multi-Purpose**: Many repositories that are shared for Bitburner are collections of user scripts that perform single tasks, or other single-purposed tools. This webserver is a single Javascript server that runs in a single process, that can be extended by a player to suit any of their client-server architectural needs, including data processing, worker orchestration, metrics gathering, and more.
- **RESTful API**: The API design is lightweight while providing a structure that serves its purpose and gets out of the way. Essentially, a minimal amount of data is sent along with each request for the purpose of ensuring communication continuity while requiring as minimal mental-overhead to learn as possible. Callbacks are used that can be any string or number (like a hostname or PID), with no other restriction. Beyond that, it follows [standard REST API design principles](https://restfulapi.net/).

This is the first component to my project of bringing modern webapp infrastructure into the Bitburner coding sandbox. I also intend to implement a datastore and a PubSub framework.

## How to use

1. Clone the repo and/or otherwise copy the files into your working dir. **If you are not playing from the Bitburner dev branch, you will need a TypeScript transpiler**

   ```shell
   wget https://raw.githubusercontent.com/Faenre/BB-Webserver/main/src/Webserver.ts Webserver.js
   wget ...
   ```

2. Write your own endpoints

   ```js 
   
   import { Status } from '../StatusCodes';
   
   /**
    * Returns information about a server.
    *
    * @param {NS} ns
    * @param {Object} data object containing at least a `hostname` string
    * */
   export default function(ns: NS, data: object): [Status, object] {
   	const hostname = String(data['hostname']);
     try {
       return [Status.OK, ns.getServer(hostname)];
     } catch {
       return [Status.BAD_INPUT, {info: 'Bad hostname provided!'}];
     }
   }
   
   ```

3. Add them to `index.ts`:

   ```js
   export { default as echo } from './echo';
   export { default as calc_hgw } from './dummy_hgw';
   export { default as get_server_data } from './get_server_data';
   ```

4. Start the server:

   ```shell
   run ./Webserver.js
   ```

5. Send messages from within other apps:

   ```js
   import { getFromWeb } from './HTTP/API';
   
   export async function main(ns: NS) {
     const _threads = getHgwThreads(ns);
   
     /* ... */
   }
   
   async function getHgwThreads(ns: NS): Promise<object> {
     const hostname = ns.getHostname();
     const request = {
       endpoint: 'calc_hgw',
       callback: hostname,
       data: { target: hostname, ram: ns.getServerMaxRam(hostname), cores: 1 },
     }
     const response = await getFromWeb(ns, request);
     return response.data;
   }
   ```

*It's that easy!*
