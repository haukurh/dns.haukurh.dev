const PROVIDERS = {
  cloudflare: 'https://1.1.1.1/dns-query',
  google: 'https://8.8.8.8/resolve',
  quad9: 'https://9.9.9.9:5053/dns-query',
};

const TYPES = ['ANY', 'A', 'AAAA', 'CNAME', 'TXT', 'MX', 'SRV', 'SOA', 'CAA'];

const records = {
  1: 'A',
  28: 'AAAA',
  18: 'AFSDB',
  42: 'APL',
  257: 'CAA',
  60: 'CDNSKEY',
  59: 'CDS',
  37: 'CERT',
  5: 'CNAME',
  62: 'CSYNC',
  49: 'DHCID',
  32769: 'DLV',
  39: 'DNAME',
  48: 'DNSKEY',
  43: 'DS',
  108: 'EUI48',
  109: 'EUI64',
  13: 'HINFO',
  55: 'HIP',
  65: 'HTTPS',
  45: 'IPSECKEY',
  25: 'KEY',
  36: 'KX',
  29: 'LOC',
  15: 'MX',
  35: 'NAPTR',
  2: 'NS',
  47: 'NSEC',
  50: 'NSEC3',
  51: 'NSEC3PARAM',
  61: 'OPENPGPKEY',
  12: 'PTR',
  17: 'RP',
  46: 'RRSIG',
  24: 'SIG',
  53: 'SMIMEA',
  6: 'SOA',
  33: 'SRV',
  44: 'SSHFP',
  64: 'SVCB',
  32768: 'TA',
  249: 'TKEY',
  52: 'TLSA',
  250: 'TSIG',
  16: 'TXT',
  256: 'URI',
  63: 'ZONEMD',
  255: '*',
  252: 'AXFR',
  251: 'IXFR',
  41: 'OPT',
  3: 'MD',
  4: 'MF',
  254: 'MAILA',
  7: 'MB',
  8: 'MG',
  9: 'MR',
  14: 'MINFO',
  253: 'MAILB',
  11: 'WKS',
  32: 'NB',
  33: 'NBSTAT',
  10: 'NULL',
  38: 'A6',
  30: 'NXT',
  25: 'KEY',
  24: 'SIG',
  13: 'HINFO',
  17: 'RP',
  19: 'X25',
  20: 'ISDN',
  21: 'RT',
  22: 'NSAP',
  23: 'NSAP-PTR',
  26: 'PX',
  31: 'EID',
  32: 'NIMLOC',
  34: 'ATMA',
  42: 'APL',
  40: 'SINK',
  27: 'GPOS',
  100: 'UINFO',
  101: 'UID',
  102: 'GID',
  103: 'UNSPEC',
  99: 'SPF',
  56: 'NINFO',
  57: 'RKEY',
  58: 'TALINK',
  104: 'NID',
  105: 'L32',
  106: 'L64',
  107: 'LP',
  259: 'DOA',
};

let form = document.getElementById('query');

function getHostname(inputData) {
  let hostname = inputData.trim();
  let hasProtocol =
    hostname.startsWith('https://') || hostname.startsWith('http://');

  let url = new URL(hasProtocol ? hostname : 'https://' + hostname);
  return url.hostname;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  let data = new FormData(event.target);
  let provider = data.get('provider');
  let hostname = data.get('hostname');
  let queryType = data.get('type');

  if (!TYPES.includes(queryType)) {
    queryType = 'ANY';
  }

  if (provider === null || !(provider in PROVIDERS)) {
    // todo: handle this case
    return;
  }

  if (hostname === null) {
    // todo: handle this case
    return;
  }

  try {
    hostname = getHostname(hostname);
    let url = new URL(PROVIDERS[provider]);
    let params = new URLSearchParams(url.search);
    params.set('name', hostname);
    params.set('type', queryType);
    url.search = params.toString();

    fetch(url.toString(), {
      headers: {
        Accept: 'application/dns-json',
      },
    })
      .then((response) => response.json())
      .then((response) => {
        const answer = response.Answer || [];
        const answerEl = document.getElementById('answer');
        answerEl.innerText = answer
          .map((entry) => {
            return (
              entry.name +
              '\t' +
              entry.TTL +
              '\tIN\t' +
              records[entry.type] +
              '\t' +
              entry.data
            );
          })
          .join('\n');
        console.log('response from server', {
          response,
        });
      });

    console.log(provider, hostname, queryType, url);
  } catch (error) {
    console.warn('Unable to parse hostname', {
      hostname,
      error,
    });
    return null;
  }
});
