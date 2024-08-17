import { Status } from '../StatusCodes';

/**
 * Testing endpoint, for ensuring clients can communicate back and forth.
 *
 * */
export default function(_ns: NS, data: object): [Status, object] {
	return [Status.OK, data];
}
