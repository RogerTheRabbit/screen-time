chrome.runtime?.sendMessage({ type: "refresh" }, (response) => {
  console.log("refresh response", response);
  const sortedTabs = Object.values(response).sort(
    (tabA, tabB) => tabB.time - tabA.time
  );
  setTable(sortedTabs);
  setTotalTime(sortedTabs);
});

chrome.runtime?.sendMessage({ type: "get-paused" }, (response) => {
  console.log("get-state response", response);
  setPausedButton(response);
});

const pasuedButton = document.getElementById("pause-button");

pasuedButton.onclick = () => {
  chrome.runtime?.sendMessage({ type: "toggle-paused" }, (response) => {
    console.log("toggle-state response", response);
    setPausedButton(response);
  });
};

function setTable(tabs) {
  const table = document.getElementById("table");
  table.innerHTML = null;
  tabs.forEach((tab) => {
    favicon = document.createElement("img");
    console.log(favicon);
    favicon.className = "website-favicon";
    favicon.src = tab.favIconUrl;
    hostnameCell = document.createElement("div");
    hostnameCell.innerText = tab.hostname;
    timeCell = document.createElement("div");
    timeCell.innerText =
      tab.time > 60 ? `${Math.floor(tab.time / 60)} minutes` : "< 1 minute";
    table.appendChild(favicon);
    table.appendChild(hostnameCell);
    table.appendChild(timeCell);
  });
}

function setTotalTime(tabs) {
  const totalTimeText = document.getElementById("total-time");
  let totalTime = tabs.reduce((total, tab) => {
    console.log(total);
    return total + tab.time;
  }, 0);

  if (totalTime < 3600) {
    totalTimeText.innerText =
      totalTime > 60 ? `${Math.floor(totalTime / 60)} minutes` : "< 1 minute";
  } else {
    totalTimeText.innerText = `${Math.floor(totalTime / 3600)} hours`;
  }
}

function setPausedButton(state) {
  pasuedButton.innerText = state ? "unpause" : "pause";
}
