import { Button } from "@/components/ui/button";
import { PauseCircleIcon, PlayIcon, StopCircleIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface RecordingState {
  isRecording: boolean;
  isPlaying: boolean;
}

export default function Popup() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPlaying: false,
  });

  useEffect(() => {
    // Request initial state from background script
    chrome.runtime.sendMessage({ type: "GET_RECORDING_STATE" }, (response) => {
      setRecordingState(response);
    });

    // Listen for state updates from background script
    const listener = (message: any) => {
      if (message.type === "RECORDING_STATE_UPDATE") {
        setRecordingState(message.state);
      }
    };
    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const startRecording = useCallback(async () => {
    chrome.runtime.sendMessage({ type: "START_RECORDING" });
  }, []);

  const stopRecording = useCallback(() => {
    chrome.runtime.sendMessage({ type: "STOP_RECORDING" });
  }, []);

  const togglePause = useCallback(() => {
    chrome.runtime.sendMessage({
      type: "TOGGLE_PAUSE",
      isPlaying: !recordingState.isPlaying,
    });
  }, [recordingState.isPlaying]);

  return (
    <main className="container mx-auto flex h-[15rem] w-[15rem] items-center justify-center">
      <section className="flex flex-col items-center gap-4">
        <h1 className="font-bold text-3xl tracking-tighter">supaguide</h1>
        <p className="whitespace-nowrap text-sm">Easily create how-to videos</p>
        {recordingState.isRecording && (
          <Button onClick={togglePause}>
            {recordingState.isPlaying ? (
              <PauseCircleIcon className="size-4" />
            ) : (
              <PlayIcon className="size-4" />
            )}
            {recordingState.isPlaying ? "Pause" : "Continue"} recording
          </Button>
        )}
        <Button
          variant={recordingState.isRecording ? "destructive" : "default"}
          onClick={() => {
            if (!recordingState.isRecording) {
              startRecording();
            } else {
              stopRecording();
            }
          }}
        >
          {recordingState.isRecording ? (
            <>
              <StopCircleIcon className="size-4" />
              Stop recording
            </>
          ) : (
            <>
              <PlayIcon className="size-4" />
              Start recording
            </>
          )}
        </Button>
      </section>
    </main>
  );
}
