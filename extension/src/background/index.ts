const API_BASE_URL = "https://supaguide-api.noelrohi59.workers.dev";

let recordingState = {
  demoId: null,
  isRecording: false,
  isPlaying: false,
  clickCount: 0,
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
      handleClickEvent(message.event, message.screenshot);
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

    updateRecordingState({ isRecording: false, isPlaying: false, clickCount: 0, demoId: null });
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
    const file = new File([blob], `screenshot_${event.timestamp}.jpg`, { type: "image/jpeg" });
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
