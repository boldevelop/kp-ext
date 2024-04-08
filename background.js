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

/* 
  operationName=Favorites
*/
console.log("background js init");
const OP_NAME = {
  Favorites: 'Favorites',
}


chrome.webRequest.onCompleted.addListener(function(details) {
  const parsedUrl = new URL(details.url);
  console.log(parsedUrl);
  console.log(parsedUrl.search);
  console.log(parsedUrl.searchParams.get('operationName'));
  if (parsedUrl.searchParams.get('operationName') === OP_NAME.Favorites) {
    console.log(details);
  }

}, { urls: ['*://graphql.kinopoisk.ru/*'] });