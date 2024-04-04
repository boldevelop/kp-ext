// chrome.webNavigation.onCommitted.addListener(function(e) {
//     if (hasHostSuffix(e.url, 'google.com') ||
//         hasHostSuffix(e.url, 'google.com.au')) {
//       // ...
//     }
// });

/* 
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.requestBody) {
      // Захват данных requestBody
    }
  },
  {
    urls: ["<all_urls>"],
  },
  ["requestBody"]
);
*/
console.log("background js init");
chrome.webRequest.onCompleted.addListener(function(details) {
  const parsedUrl = new URL(details.url);
  console.log(parsedUrl);
// TODO: filter and check if the desired URL has completed
}, { urls: ['*://graphql.kinopoisk.ru/*'] });