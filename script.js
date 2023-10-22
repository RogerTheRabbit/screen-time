chrome.runtime?.sendMessage({ type: "refresh" }, (response) => {
  console.log("response", response);
  setTable(Object.values(response).sort((tabA, tabB) => tabB.time - tabA.time));
});

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
