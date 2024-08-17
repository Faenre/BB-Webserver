import { NS } from '@/NetscriptDefinitions.js';
import * as ENDPOINTS from './endpoints/index.js';
import { Status, StatusCode, StatusCodes } from './StatusCodes.js';

const DEFAULT_LISTEN_PORT = 1001;
const DEFAULT_RESPONSE_PORT = 1002;

export interface PortRequest {
	endpoint: string;
	origin: string;
	callback: string | number | null;
	data: object;
	noreply: boolean;
	error: string | null;
}

export interface PortResponse {
	to: string;
	status: StatusCode;
	data: object;
	callback: string | number | null;
}

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
			const request = this.parseContent(content);
			if (request.error) {
				this.ns.print(`WARNING skipping invalid request: ${request.error}`);
				continue;
			}

			// Process the request
			this.ns.print(`INFO Now handling request from ${request.origin}.`);
			const response = this.handle(request);

			// Send a reply (unless indicated not to)
			if (request.noreply) continue;
			if (!request.origin) continue;
			responsePort.write(JSON.stringify(response));
			this.ns.print(`SUCCESS response sent to ${response.to}`);
		}
	}

	handle(request: PortRequest): PortResponse {
		const [status, data] = this.doHandle(request.endpoint, request.data);

		return {
			to: request.origin,
			status: StatusCodes[status],
			data: data,
			callback: request.callback,
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

  parseContent(content: string): PortRequest {
    try {
      const json = JSON.parse(content);
      return {
        endpoint: json['endpoint'],
        origin: 	json['from'],
        callback: json['callback'],
        data: 		json['data'],
        noreply: 	json['noreply'],
        error: 		null,
      }
    } catch (err) {
      const error = `\
      Cannot parse message content. Perhaps the JSON is malformed?

      Message content:
      ${content}

      Stack:
      ${err.stack}`;
      return {
        error,
        endpoint: '', origin: '', callback: null, data: {}, noreply: false,
      }
    }
  }

}
