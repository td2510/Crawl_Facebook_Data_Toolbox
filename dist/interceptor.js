/* global chrome */

chrome.browserAction.onClicked.addListener(function () {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    var isOriginHeaderExists = false;
    var isRefererHeaderExists = false;

    for (var i = 0; i < details.requestHeaders.length; ++i) {
      if (details.requestHeaders[i].name.toLowerCase() === "origin") {
        details.requestHeaders[i].value = "https://m.facebook.com";
        isOriginHeaderExists = true;
      }
      if (details.requestHeaders[i].name.toLowerCase() === "referer") {
        details.requestHeaders[i].value = "https://m.facebook.com";
        isRefererHeaderExists = true;
      }
      if (details.requestHeaders[i].name.toLowerCase() === "sec-fetch-site") {
        details.requestHeaders[i].value = "none";
      }
      if (details.requestHeaders[i].name.toLowerCase() === "sec-fetch-dest") {
        details.requestHeaders[i].value = "empty";
      }
      if (details.requestHeaders[i].name.toLowerCase() === "sec-fetch-mode") {
        details.requestHeaders[i].value = "cors";
      }
    }

    if (isOriginHeaderExists === false) {
      details.requestHeaders.push({
        name: "origin",
        value: "https://m.facebook.com",
      });
    }

    if (isRefererHeaderExists === false) {
      details.requestHeaders.push({
        name: "referer",
        value: details.url.includes("www.facebook.com")
          ? "https://www.facebook.com"
          : "https://m.facebook.com",
      });
    }

    return { requestHeaders: details.requestHeaders };
  },
  // filters
  {
    urls: [
      "https://m.facebook.com/composer/ocelot/async_loader/*",
      "https://www.facebook.com/api/graphql/*",
      "https://www.facebook.com/ajax/browser/list/group_confirmed_members/",
      "https://graph.facebook.com/*"
    ],
  },
  // extraInfoSpec
  ["blocking", "requestHeaders", "extraHeaders"]
);

chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    var isAllowCORSHeaderExists = false;

    for (var i = 0; i < details.responseHeaders.length; ++i) {
      if (
        details.responseHeaders[i].name.toLowerCase() ===
        "access-control-allow-origin"
      ) {
        details.responseHeaders[i].value = "*";
        isAllowCORSHeaderExists = true;
      }
    }

    if (isAllowCORSHeaderExists === false) {
      details.responseHeaders.push({
        name: "access-control-allow-origin",
        value: "*",
      });
    }

    return { responseHeaders: details.responseHeaders };
  },
  // filters
  {
    urls: ["https://graph.facebook.com/*"],
  },
  // extraInfoSpec
  ["blocking", "responseHeaders", "extraHeaders"]
);