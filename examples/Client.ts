import { getFromWeb } from './HTTP/API';

/**
 * Get HGW thread counts to hack current server with its own ram/cores.
 *
 * @param ns
 */
export async function main(ns: NS) {
  const _threads = getHgwThreads(ns);

  // @TODO fill in as exercise for the reader
}

async function getHgwThreads(ns: NS) {
  const hostname = ns.getHostname();
  const request = {
    endpoint: 'calc_hgw',
    callback: hostname,
    data: { target: hostname, ram: ns.getServerMaxRam(hostname), cores: 1 },
  }
  const response = await getFromWeb(ns, request);
  return response.data;
}
