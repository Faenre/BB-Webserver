/** 
 * Testing endpoint, for ensuring clients can communicate back and forth. 
 * 
 * @param {NS} ns 
 * @param {Object} data object with k-v pairs
 * */
export default async function echo(ns, data) {
    return [STATUS_OK, data];
}

const STATUS_OK = 200;

