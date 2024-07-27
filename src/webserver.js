import * as ENDPOINTS from 'endpoints/index';

/*
  Listens on port 1001 for web requests and performs them. 
  Responds on port 1002.

  Port data should be a JSON-resolvable string matching the below spec:
  {
    "endpoint": string,
    "from": string (hostname),
    "callback": string (optional),
    "noreply": boolean (optional, default false),
    "data": {
      "whatever": "content",
      "is": "relevant",
    }
  }

  Response will match the following:
  {
    "to": string (hostname),
    "callback": string (if supplied in the request),
    "status": number (matching STATUS codes),
    "data": {},
  }
*/

const LISTEN_PORT = 1001;
const RESPONSE_PORT = 1002;

const STATUS = {
  // Informational:
  'PROCESSING': 102,          // the message was received and is being processed, but this may take time

  // Success indicators:
  'OK': 200,                  // default response for a successful call with 
  'CREATED': 201,             // a new resource was created
  'NO_CONTENT': 204,          // alternative to OK indicating there is no data to return

  // Client errors:
  'BAD_INPUT': 400,           // the request was malformed and cannot be interpreted
  'PAYMENT_REQUIRED': 402,    // player does not have enough money for the operation
  'NOT_FOUND': 404,           // the endpoint does not exist 
  'CONFLICT': 409,            // conflict encountered, e.g. 'a server with that name already exists'
  'PRECONDITION_FAILED': 412, // something is missing, e.g. the player does not have the Formulas API

  // Server errors:
  'SERVER_ERROR': 500,        // an issue happened in the webserver (this script)
  'NOT_IMPLEMENTED': 501,     // the endpoint is recognized but stubbed (unfinished)
  'SERVICE_UNAVAILABLE': 503  // an issue happened on an external service, e.g. via ns.run or ns.exec
};

/** @param {NS} ns */
export async function main(ns) {
  ns.tail();

  const server = new Server(ns);
  await server.listen();
}

class Server {
  constructor(ns) {
    this.ns = ns;
    this.listenPort = this.ns.getPortHandle(LISTEN_PORT);
    this.responsePort = this.ns.getPortHandle(RESPONSE_PORT);
  }

  // Note: Even though this is an "async" method, Bitburner is only single-process JS. 
  // So, we have to handle everything in a single thread, while pretending it's async.
  async listen() {
    this.ns.print(`INFO Now listening on port ${LISTEN_PORT}.`);
    this.ns.print(`INFO Responses will be sent on port ${RESPONSE_PORT}.`);

    while (true) {
      // If the queue is empty, wait for a request
      if (this.listenPort.empty())
        await this.listenPort.nextWrite();

      // Parse the request
      const content = this.listenPort.read();
      const request = new ApiRequest(content);
      if (request.error) {
        this.ns.print(`WARNING ${request.error}`);
        this.ns.print('INFO skipping invalid request');
        continue;
      }

      // Process the request
      this.ns.print(`INFO Now handling request from ${request.origin}.`);
      const response = this.handle(request);

      // Send a reply (unless the client indicated not to, or there is no return address)
      if (request.noreply) continue;
      if (!request.origin) continue;
      this.responsePort.write(JSON.stringify(response));
      this.ns.print(`SUCCESS response sent to ${response.to}`);
    }
  }

  handle(request) {
    const [status, data] = this.doHandle(request.endpoint, request.data);

    return new ApiResponse(
      request.origin,
      status,
      data,
      request.callback,
    );
  }

  doHandle(endpoint, data) {
    try {
      const controller = ENDPOINTS[endpoint];
      if (!controller)
        return [STATUS.NOT_FOUND, {}];

      const responseData = controller(data);
      if (!responseData)
        return [STATUS.BAD_INPUT, {}];

      return [STATUS.OK, responseData];
    } catch (err) {
      this.ns.print('ERROR server can not handle request:\n' + err.stack);
      return [STATUS.SERVER_ERROR, {}];
    }
  }
}

class ApiRequest {
  constructor(content) {
    try {
      this.json = JSON.parse(content);
      this.error = false;
    } catch (err) {
      this.json = {};
      this.error = ```\
      Cannot parse message content. Perhaps the JSON is malformed?

      Message content:
      ${content}
      
      Stack:
      ${err.stack}```;
    } finally {
      this.endpoint = this.json['endpoint'];
      this.origin = this.json['from'];
      this.data = this.json['data'];
      this.noreply = this.json['noreply'];
    }
  }
}

class ApiResponse {
  constructor(to, status, data, callback = null) {
    this.to = to;
    this.status = status;
    this.data = data;
    this.callback = callback;
  }

  hasDestination = () => (this.to != undefined);

  toJson() {
    return {
      'to': this.to,
      'status': this.status,
      'data': this.data,
      'callback': this.callback,
    }
  }
}
