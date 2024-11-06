const API_BASE_URL = "https://your-api-url.com";

let recordingState = {
  isRecording: false,
  isPlaying: false,
};

function updateRecordingState(newState: Partial<typeof recordingState>) {
  recordingState = { ...recordingState, ...newState };
  chrome.runtime.sendMessage({
    type: "RECORDING_STATE_UPDATE",
    state: recordingState,
  });
}

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
    case "CLICK_EVENT":
      handleClickEvent(message.event);
      break;
    case "TOGGLE_PAUSE":
      togglePause(message.isPlaying);
      break;
  }
});

async function startRecording() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
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

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/content/index.js"],
    });

    updateRecordingState({ isRecording: true, isPlaying: true });
  } catch (error) {
    console.error("Error starting recording:", error);
  }
}

async function stopRecording() {
  try {
    const response = await fetch(`${API_BASE_URL}/extension/stop`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to stop recording");
    }

    updateRecordingState({ isRecording: false, isPlaying: false });
  } catch (error) {
    console.error("Error stopping recording:", error);
  }
}

async function handleClickEvent(event: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/extension/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error("Failed to send click event");
    }
  } catch (error) {
    console.error("Error sending click event:", error);
  }
}

function togglePause(isPlaying: boolean) {
  updateRecordingState({ isPlaying });
  // Implement pause/resume logic if needed
}
