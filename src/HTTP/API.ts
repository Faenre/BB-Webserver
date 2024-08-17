import { StatusCode } from './StatusCodes';

export const DEFAULT_LISTEN_PORT = 1001;
export const DEFAULT_RESPONSE_PORT = 1002;

export interface PortRequest {
	endpoint: string;
	callback: string | number | null;
	data: object;
}

export interface PortResponse {
	callback: string | number | null;
	status: StatusCode;
	data: object;
}

/**
 *
 * @param ns
 * @param request
 * @param serverListenPort
 * @param serverResponsePort
 * @returns Promise<PortResponse>
 */
export async function getFromWeb(ns: NS, request: PortRequest, serverListenPort=DEFAULT_LISTEN_PORT, serverResponsePort=DEFAULT_RESPONSE_PORT): Promise<PortResponse> {
  ns.writePort(serverListenPort, request);

  while (true) {
    await ns.nextPortWrite(serverResponsePort);

    const portContent = ns.peek(serverResponsePort);
    if (portContent !== 'NULL PORT DATA')
      continue;
    if (portContent.callback === request.callback)
      return ns.readPort(serverResponsePort);
  }
}
