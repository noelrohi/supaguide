// Add recording state at the top of the file
let isRecording = false;
let isPlaying = false;

// Initialize connection with background script
chrome.runtime.connect({ name: "content-script" });

// Listen for recording state updates from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "RECORDING_STATE_UPDATE") {
    isRecording = message.state.isRecording;
    isPlaying = message.state.isPlaying;
    console.log("Recording state updated:", { isRecording, isPlaying });
  }
});

// Get initial recording state
chrome.runtime.sendMessage({ type: "GET_RECORDING_STATE" }, (state) => {
  if (state) {
    isRecording = state.isRecording;
    isPlaying = state.isPlaying;
    console.log("Initial state received:", { isRecording, isPlaying });
  }
});

document.addEventListener("click", async (e) => {
  await chrome.runtime.sendMessage({
    type: "LOG_SOMETHING",
    data: {
      isRecording,
      isPlaying,
    },
  });
  // Only process clicks if recording is active and not paused
  if (!isRecording || !isPlaying) return;

  const event = {
    x: e.clientX,
    y: e.clientY,
    timestamp: Date.now(),
    elementHTML: getElementHTML(e.target as Element),
    elementContent: getElementContent(e.target as Element),
  };

  try {
    await chrome.runtime.sendMessage({
      type: "CLICK_EVENT",
      event: event,
    });
  } catch (error) {
    console.error("Error capturing click event:", error);
  }
});

function getElementContent(element: Element): string {
  if (!element?.tagName) return "";
  const text = element.textContent?.trim() || "";
  return text ? `Click on "${text}"` : "";
}

function getElementHTML(element: Element): string {
  if (!element?.tagName) return "";
  return element.innerHTML;
}
