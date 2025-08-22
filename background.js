setInterval(checkBrowserFocus, 1000);

chrome.storage.local.get().then((localStorage) => {
  if (localStorage["time"] === undefined) {
    chrome.storage.local.set({ time: {} });
  }
  if (localStorage["limits"] === undefined) {
    chrome.storage.local.set({
      limits: {
        "www.youtube.com": 5,
      },
    });
  }
  if (localStorage["youtubeUrls"] === undefined) {
    chrome.storage.local.set({ youtubeUrls: {} });
  }
  if (localStorage["lastCheckedTime"] === undefined) {
    chrome.storage.local.set({ lastCheckedTime: Date.now() });
  }
  if (localStorage["paused"] === undefined) {
    chrome.storage.local.set({ paused: false });
  }
});

function checkBrowserFocus() {
  chrome.windows.getCurrent(async function (browser) {
    const localStorage = await chrome.storage.local.get();
    let time = localStorage["time"];
    let limits = localStorage["limits"];
    let youtubeUrls = localStorage["youtubeUrls"];
    let lastCheckedTime = localStorage["lastCheckedTime"];
    const paused = localStorage["paused"];
    const now = Date.now();

    // Reset if day has changed
    if (new Date(now).getDay() !== new Date(lastCheckedTime).getDay()) {
      // TODO: Write these to some daily report location before clearing
      chrome.storage.local.set({
        time: {},
        youtubeUrls: {},
        paused: false,
        lastCheckedTime: now,
      });
      return;
    }

    const tab = await getCurrentTab();
    if (
      tab === undefined ||
      (browser.focused === false && tab.audible === false)
    ) {
      chrome.storage.local.set({ lastCheckedTime: now });
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
      time[url.origin].time += (now - lastCheckedTime) / 1000;
    }
    // Sometimes favicons aren't loaded/set in the first pass, so add it if it's missing later
    if (time[url.origin].favIconUrl === undefined) {
      time[url.origin].favIconUrl = url.favIconUrl;
    }
    chrome.storage.local.set({ lastCheckedTime: now });
    if (
      !paused &&
      limits[url.hostname] !== undefined &&
      time[url.origin].time > limits[url.hostname] &&
      youtubeUrls[tab.id] !== undefined &&
      youtubeUrls[tab.id] !== null &&
      url.href != youtubeUrls[tab.id]
    ) {
      console.log("CLOSING TAB", tab.id, url.origin, time[url.origin]);
      chrome.tabs.remove(tab.id);
    }
    console.log(browser.focused, tab, time);

    if (url.host !== "newtab") {
      youtubeUrls[tab.id] = url.href;
      chrome.storage.local.set({ youtubeUrls: youtubeUrls });
    }
    chrome.storage.local.set({ time: time });
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
    chrome.storage.local
      .get()
      .then((localStorage) => sendResponse(localStorage["time"]));

    return true;
  } else if (msg.type === "get-paused") {
    chrome.storage.local
      .get()
      .then((localStorage) => sendResponse(localStorage["paused"]));

    return true;
  } else if (msg.type === "toggle-paused") {
    chrome.storage.local.get().then((localStorage) => {
      const newPausedState = !localStorage["paused"];
      chrome.storage.local.set({ paused: newPausedState });
      sendResponse(newPausedState);
    });

    return true;
  }
});
