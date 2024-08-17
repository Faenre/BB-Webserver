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
