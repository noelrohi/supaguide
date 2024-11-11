const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:8787"
  : "https://supaguide-api.noelrohi59.workers.dev";

let recordingState = {
  demoId: null,
  isRecording: false,
  isPlaying: false,
  clickCount: 0,
};

async function updateRecordingState(newState: Partial<typeof recordingState>) {
  recordingState = { ...recordingState, ...newState };

  // Send update to all tabs
  const tabs = await chrome.tabs.query({});
  tabs.forEach((tab) => {
    if (tab.id) {
      chrome.tabs
        .sendMessage(tab.id, {
          type: "RECORDING_STATE_UPDATE",
          state: recordingState,
        })
        .catch((err) => {
          // Ignore errors from tabs that don't have the content script
          console.log("Could not send to tab:", tab.id, err);
        });
    }
  });

  // Also send to popup
  chrome.runtime
    .sendMessage({
      type: "RECORDING_STATE_UPDATE",
      state: recordingState,
    })
    .catch(() => {
      // Ignore error if popup is not open
    });
}

// Add tab change listener at the top level
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  chrome.runtime.sendMessage({
    type: "LOG_SOMETHING",
    data: {
      activeInfo,
      message: "Tab changed",
    },
  });
  if (recordingState.isRecording) {
    console.log("Tab changed while recording, stopping recording");
    await stopRecording();
  }
});

// Also stop recording when the window changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE && recordingState.isRecording) {
    console.log("Window focus lost while recording, stopping recording");
    await stopRecording();
  }
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  switch (message.type) {
    case "GET_RECORDING_STATE":
      sendResponse(recordingState);
      break;
    case "START_RECORDING":
      startRecording();
      break;
    case "STOP_RECORDING":
      stopRecording();
      break;
    case "LOG_SOMETHING":
      console.log("LOG_SOMETHING", message.data);
      break;
    case "CLICK_EVENT":
      handleClickWithScreenshot(message.event);
      break;
    case "TOGGLE_PAUSE":
      togglePause(message.isPlaying);
      break;
  }
});

async function handleClickWithScreenshot(clickEvent: any) {
  try {
    // Capture the visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab();

    // Convert data URL to array buffer
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    console.log({ arrayBuffer });

    // Process the click event with screenshot
    await handleClickEvent(clickEvent, arrayBuffer);
  } catch (error) {
    console.error("Screenshot capture failed:", error);
  }
}

async function startRecording() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab.id) return;

    const response = await fetch(`${API_BASE_URL}/extension/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tabId: tab.id }),
    });

    if (!response.ok) {
      throw new Error("Failed to start recording");
    }
    const data = await response.json();

    updateRecordingState({
      isRecording: true,
      isPlaying: true,
      demoId: data.demoId,
      clickCount: 0,
    });
  } catch (error) {
    console.error("Error starting recording:", error);
  }
}

async function stopRecording() {
  if (!recordingState.demoId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/extension/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        demoId: recordingState.demoId,
        clickCount: recordingState.clickCount,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to stop recording");
    }

    updateRecordingState({
      isRecording: false,
      isPlaying: false,
      clickCount: 0,
      demoId: null,
    });
  } catch (error) {
    console.error("Error stopping recording:", error);
  }
}

async function handleClickEvent(event: any, screenshot: ArrayBuffer) {
  if (!recordingState.demoId) return;

  recordingState.clickCount++;

  try {
    const formData = new FormData();
    formData.append("demoId", recordingState.demoId);
    formData.append("x", event.x.toString());
    formData.append("y", event.y.toString());
    formData.append("timestamp", event.timestamp.toString());
    formData.append("elementHTML", event.elementHTML);
    formData.append("elementContent", event.elementContent);

    const blob = new Blob([screenshot], { type: "image/jpeg" });
    const file = new File([blob], `screenshot_${event.timestamp}.jpg`, {
      type: "image/jpeg",
    });
    formData.append("screenshot", file);

    const response = await fetch(`${API_BASE_URL}/extension/image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to send click event");
    }

    console.log("Click event sent successfully");
  } catch (error) {
    console.error("Error sending click event:", error);
  }
}

function togglePause(isPlaying: boolean) {
  updateRecordingState({ isPlaying });
  // Implement pause/resume logic if needed
}
