import { Status } from '../StatusCodes';

/**
 * Gets simple server security information.
 *
 * @param {NS} ns
 * @param {Object} data object containing at least a `hostname`.
 * */
export default function(ns, data) {
	const hostname = data.hostname;

	const secCurrent = ns.getServerSecurityLevel(hostname);
	const secMax = ns.getServerMinSecurityLevel(hostname);

	return [Status.OK, { secCurrent, secMax }]
}
