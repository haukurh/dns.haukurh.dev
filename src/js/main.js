const PROVIDERS = {
  cloudflare: 'https://1.1.1.1/dns-query',
  google: 'https://8.8.8.8/resolve',
  quad9: 'https://9.9.9.9:5053/dns-query',
};

const TYPES = ['ANY', 'A', 'AAAA', 'CNAME', 'TXT', 'MX', 'SRV', 'SOA', 'CAA'];

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
        'Accept': 'application/dns-json',
      },
    })
      .then((response) => response.json())
      .then((response) => {
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
