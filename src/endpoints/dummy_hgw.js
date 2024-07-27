/** 
 * @param {NS} ns 
 * @param {Object} data object with 'ram' and 'cores' keys
 * */
export default async function (ns, data) {
    const ram = data.ram;
    const cores = data.cores;

    const h = 1;
    const g = 1;
    const w = 1;
    return [STATUS_OK, { h, g, w }];
}

const STATUS_OK = 200;
