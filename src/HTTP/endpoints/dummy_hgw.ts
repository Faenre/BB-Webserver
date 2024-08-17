import { Status } from '../StatusCodes';

/**
 * @param {NS} ns
 * @param {Object} data object with 'ram' and 'cores' keys
 * */
export default function(_ns: NS, data: object): [Status, object] {
	const _ram = data['ram'];
	const _cores = data['cores'];

	const h = 1;
	const g = 1;
	const w = 1;
	return [Status.OK, { h, g, w }];
}
