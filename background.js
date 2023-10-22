
setInterval(checkBrowserFocus, 1000);

let time = {};
let limits = {
  "www.youtube.com": 30,
};
let lastCheckedTime = Date.now();

function checkBrowserFocus() {
  chrome.windows.getCurrent(async function (browser) {
    const tab = await getCurrentTab();
    if (tab === undefined || browser.focused === false) {
      lastCheckedTime = Date.now();
      return;
    }
    const url = new URL(tab.url);
    if (time[url.origin] === undefined) {
      time[url.origin] = {
        time: 0,
        favIconUrl: tab.favIconUrl,
        origin: url.origin,
        hostname: url.hostname,
      };
    } else {
      time[url.origin].time += (Date.now() - lastCheckedTime) / 1000;
    }
    // Sometimes favicons aren't loaded/set in the first pass, so add it if it's missing later
    if (time[url.origin].favIconUrl === undefined) {
      time[url.origin].favIconUrl = url.favIconUrl;
    }
    lastCheckedTime = Date.now();
    if (
      limits[url.hostname] !== undefined &&
      time[url.origin].time > limits[url.hostname]
    ) {
      console.log("CLOSING TAB", time[url.origin]);
      chrome.tabs.remove(url.origin);
    }
    console.log(browser.focused, tab, time);
  });
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log(msg, sender);
  if (msg.type === "refresh") {
    sendResponse(time);
    return true;
  }
});
