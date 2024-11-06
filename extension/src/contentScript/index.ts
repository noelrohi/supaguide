document.addEventListener("click", async (e) => {
  const event = {
    x: e.clientX,
    y: e.clientY,
    timestamp: Date.now(),
    elementHTML: getElementHTML(e.target as Element),
    elementContent: getElementContent(e.target as Element),
  };

  try {
    // Capture the visible part of the page
    const canvas = document.createElement("canvas");
    const { width, height } = window.visualViewport ?? { width: 0, height: 0 };
    canvas.width = width;
    canvas.height = height;

    // Use html2canvas to capture the visible part of the page
    const html2canvas = (await import("html2canvas")).default;
    const screenshot = await html2canvas(document.body, {
      width,
      height,
      x: window.scrollX,
      y: window.scrollY,
      scrollX: 0,
      scrollY: 0,
      scale: 1,
      logging: false,
      removeContainer: true,
      allowTaint: true,
      foreignObjectRendering: false,
    });

    // Convert the canvas to a Blob
    const blob = await new Promise<Blob | null>((resolve) =>
      screenshot.toBlob(resolve, "image/jpeg", 0.7),
    );

    // Create a File from the Blob
    const file = blob
      ? new File([blob], `screenshot_${Date.now()}.jpg`, { type: "image/jpeg" })
      : null;

    // Send the File to the background script
    chrome.runtime.sendMessage({
      type: "CLICK_EVENT",
      event: event,
      screenshot: file ? await blobToArrayBuffer(file) : null,
    });
  } catch (error) {
    console.error("Error capturing screenshot:", error);
    // Still send the click data even if screenshot fails
    chrome.runtime.sendMessage({ type: "CLICK_EVENT", event });
  }
});

function getElementContent(element: Element): string {
  if (!element || !element.tagName) return "";
  if (!element.textContent) return "";
  return `Click on "${element.textContent.trim()}"`;
}

function getElementHTML(element: Element): string {
  if (!element || !element.tagName) return "";
  return element.innerHTML;
}

async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}
