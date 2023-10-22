chrome.runtime.sendMessage({ type: "refresh" }, (response) => {
  console.log("response", response);
  let screenTimeP = document.getElementById("screen-time");
  screenTimeP.innerText = Object.values(response)
    .map((tab) => `${tab.hostname}: ${Math.floor(tab.time / 60)} minuets`)
    .join("\n");
});

