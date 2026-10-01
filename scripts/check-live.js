const https = require("https");

function fetchUrl(url) {
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      })
      .on("error", (err) => resolve({ error: err.message }));
  });
}

async function run() {
  console.log("Checking live site https://southcityhospital.in/ ...");
  const home = await fetchUrl("https://southcityhospital.in/");
  if (home.body) {
    const links = home.body.match(/<link[^>]+rel=["'](?:shortcut\s+)?(?:icon|apple-touch-icon)["'][^>]*>/gi);
    console.log("Favicon links on live site:", links);
  } else {
    console.log("Error or empty body:", home);
  }

  const files = ["/favicon.ico", "/favicon.svg", "/icon-192.png", "/apple-touch-icon.png", "/robots.txt"];
  for (const f of files) {
    const res = await fetchUrl(`https://southcityhospital.in${f}`);
    console.log(`${f} Status: ${res.status} Content-Type: ${res.headers ? res.headers["content-type"] : "N/A"} Length: ${res.headers ? res.headers["content-length"] : "N/A"}`);
  }
}

run();
