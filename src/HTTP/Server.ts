import { NS } from '@/NetscriptDefinitions';
import * as ENDPOINTS from './endpoints/index';
import { Status, StatusCodes } from './StatusCodes';
import { PortRequest, PortResponse, DEFAULT_LISTEN_PORT, DEFAULT_RESPONSE_PORT } from './API';

export class Server {
	ns: NS;
  listenPortNumber: number;
  responsePortNumber: number;

  /**
   * @param ns
   * @param listenPortNumber default 1001
   * @param responsePortNumber default 1002
   */
	constructor(ns: NS, listenPortNumber=DEFAULT_LISTEN_PORT, responsePortNumber=DEFAULT_RESPONSE_PORT) {
		this.ns = ns;
    this.listenPortNumber = listenPortNumber;
    this.responsePortNumber = responsePortNumber;

    for (const endpoint of Object.keys(ENDPOINTS))
      this.ns.print(`INFO endpoint recognized: ${endpoint}`);
	}

  /**
   * Listens to a port, handles web requests, and sends responses.
   */
	async listen() {
		const listenPort = this.ns.getPortHandle(this.listenPortNumber);
		const responsePort = this.ns.getPortHandle(this.responsePortNumber);
		this.ns.print(`INFO Now listening on port ${this.listenPortNumber}.`);
		this.ns.print(`INFO Responses will be sent on port ${this.responsePortNumber}.`);

		while (true) {
			// If the queue is empty, wait for a request
			if (listenPort.empty())
				await listenPort.nextWrite();

			// Parse the request
			const content = listenPort.read();
			const [request, error] = this.parseContent(content);
			if (error) {
				this.ns.print(`WARNING skipping invalid request: ${error}`);
				continue;
			}

			// Process the request
			this.ns.print(`INFO Now handling request for callback ${request.callback}.`);
			const response = this.handle(request);

			// Send a reply (unless indicated not to)
			if (!request.callback) continue;
			responsePort.write(JSON.stringify(response));
			this.ns.print(`${response.status.code < 400 ? 'SUCCESS' : 'WARNING'} response sent to ${response.callback}`);
		}
	}

  parseContent(content: string): [PortRequest, string | null] {
    try {
      const json = JSON.parse(content);
      return [{
        endpoint: json['endpoint'],
        callback: json['callback'],
        data: 		json['data'],
      }, null]
    } catch (err) {
      const error = `\
      Cannot parse message content. Perhaps the JSON is malformed?

      Message content:
      ${content}

      Stack:
      ${err.stack}`;
      return [{ endpoint: '', callback: null, data: {} }, error]
    }
  }

	handle(request: PortRequest): PortResponse {
		const [status, data] = this.doHandle(request.endpoint, request.data);

		return {
      callback: request.callback,
			status: StatusCodes[status],
			data: data,
		}
	}

	doHandle(endpoint: string, data: object): [Status, object] {
		try {
			const controller = ENDPOINTS[endpoint];
			if (!controller) {
				this.ns.print(`WARNING Unknown endpoint '${endpoint}' requested.`);
				return [Status.NOT_FOUND, {}];
			}

			return controller(data);
		} catch (err) {
			this.ns.print('ERROR server can not handle request:\n' + err.stack);
			return [Status.SERVER_ERROR, {}];
		}
	}
}
