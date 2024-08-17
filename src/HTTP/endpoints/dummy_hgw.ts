import { Status } from '../StatusCodes';

/**
 * @param {NS} ns
 * @param {object} data object with 'target', 'ram', and 'cores' keys
 * @return {object} with h, g, w keys for thread counts
 * */
export default function(_ns: NS, data: object): [Status, object] {
	const hostname = data['target'];
	const ram = data['ram'];
	const cores = data['cores'];

	if (!hostname || !ram || !cores)
		return [Status.BAD_INPUT, { h: 0, g: 0, w: 0 }];

	const h = 1;
	const g = 1;
	const w = 1;

	return [Status.OK, { h, g, w }];
}
