// video.tsx
"use client";

import dynamic from "next/dynamic";
import { useCallback } from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
} from "remotion";

// Dynamically import the Player to avoid SSR issues
const Player = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  {
    ssr: false,
  },
);

interface Click {
  id: string;
  demoId: string;
  x: number;
  y: number;
  elementHTML: string | null;
  elementContent: string | null;
  imageUrl: string;
  createdAt: string;
  updatedAt: string | null;
}

interface DemoData {
  id: string;
  isDraft: boolean | null;
  title: string | null;
  clickCount: number | null;
  createdAt: string;
  updatedAt: string | null;
  clicks: Click[];
}

const TRANSITION_DURATION = 30;
const CLICK_DURATION = 90;

const ClickIndicator: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();

  const scale = spring({
    fps: 30,
    frame,
    from: 0,
    to: 1,
    config: {
      damping: 12,
    },
  });

  const opacity = interpolate(
    frame,
    [0, 20, CLICK_DURATION - 20, CLICK_DURATION],
    [0, 1, 1, 0],
  );

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 0, 0, 0.5)",
          border: "2px solid red",
        }}
      />
    </div>
  );
};

const DemoGuideClip = ({ data }: { data: DemoData }) => {
  const sortedClicks = [...data.clicks].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      {sortedClicks.map((click, index) => (
        <Sequence
          key={click.id}
          from={index * (CLICK_DURATION + TRANSITION_DURATION)}
          durationInFrames={CLICK_DURATION}
        >
          <AbsoluteFill>
            <Img
              src={click.imageUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
            <ClickIndicator x={click.x} y={click.y} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const RemotionVideo: React.FC<{ data: DemoData }> = ({ data }) => {
  const totalDuration =
    data.clicks.length * (CLICK_DURATION + TRANSITION_DURATION);

  // Memoize the clip component to avoid re-renders
  const VideoComponent = useCallback(
    () => <DemoGuideClip data={data} />,
    [data],
  );

  if (typeof window === "undefined") {
    return null; // Return null during SSR
  }

  return (
    <Player
      component={VideoComponent}
      durationInFrames={totalDuration}
      fps={30}
      style={{
        width: "100%",
        maxWidth: "1200px",
        aspectRatio: "16/9",
      }}
      controls
      compositionWidth={1920}
      compositionHeight={1080}
    />
  );
};
