export async function main(ns) {
    // Prepare the request according to the API
    const myRequest = {
        'endpoint': 'echo',
        'from': ns.getHostname(),
        'data': { 
            'this': 'is',
            'my': 'data',
        }
    }

    // Send the request to the webserver
    ns.writePort(1001, JSON.stringify(myRequest));

    // Receive the response
    const echoData = await readData(ns);
    ns.tprint(JSON.stringify(echoData));
}

async function readData(ns) {
    // Wait for the response to arrive
    while (await ns.sleep(50)) {
        if (parsePeek(ns).to === ns.getHostname()) 
            return JSON.parse(ns.readPort(1002));
    }
}

const NO_DATA = 'NULL PORT DATA';
const parsePeek = (ns) => ((raw) => raw === NO_DATA ? {} : JSON.parse(raw))(ns.peek(1002));
