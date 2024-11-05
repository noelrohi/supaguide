import { processVideo } from "@/lib/utils";

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === "COUNT") {
    console.log("background has received a message from popup, and count is ", request?.count);
  }
  if (request.action === "processVideo") {
    processVideo(request.video)
      .then((url) => sendResponse({ success: true, url }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Indicates that the response is sent asynchronously
  }
});
