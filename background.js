
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
    if (time[tab.id] === undefined) {
      time[tab.id] = {
        time: 0,
        favIconUrl: tab.favIconUrl,
        origin: url.origin,
        hostname: url.hostname,
      };
    } else {
      time[tab.id].time += (Date.now() - lastCheckedTime) / 1000;
    }
    lastCheckedTime = Date.now();
    if (
      limits[url.hostname] !== undefined &&
      time[tab.id].time > limits[url.hostname]
    ) {
      console.log("CLOSING TAB", time[tab.id]);
      chrome.tabs.remove(tab.id);
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
