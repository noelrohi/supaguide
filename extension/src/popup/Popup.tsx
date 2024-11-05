"use client";

import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

export function Popup() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await new Promise<MediaStream>((resolve, reject) => {
        chrome.tabCapture.capture({ video: true, audio: true }, (stream) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (stream) {
            resolve(stream);
          } else {
            reject(new Error("Failed to capture tab"));
          }
        });
      });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const continueRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setIsProcessing(true);

      // Create a blob from the recorded chunks
      const blob = new Blob(recordedChunks, { type: "video/webm" });

      // Send the blob to the background script for processing
      chrome.runtime.sendMessage({ action: "processVideo", video: blob }, (response) => {
        if (response.success) {
          setDownloadUrl(response.url);
        } else {
          console.error("Error processing video:", response.error);
        }
        setIsProcessing(false);
      });

      // Clear recorded chunks
      setRecordedChunks([]);
    }
  };

  return (
    <main className="container mx-auto flex h-[15rem] w-[20rem] items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-6">
        <h3 className="font-bold text-3xl tracking-tighter">Supaguide</h3>
        <p className="text-center">Easily create how-to video guides for the current tab</p>
        <div className="flex items-center justify-center space-x-4">
          {!isRecording && !isProcessing && !downloadUrl && (
            <Button onClick={startRecording}>Start</Button>
          )}
          {isRecording && (
            <>
              <Button onClick={isPaused ? continueRecording : pauseRecording}>
                {isPaused ? "Continue" : "Pause"}
              </Button>
              <Button onClick={stopRecording}>Stop</Button>
            </>
          )}
          {isProcessing && <p>Processing your guide video...</p>}
        </div>
      </div>
    </main>
  );
}
