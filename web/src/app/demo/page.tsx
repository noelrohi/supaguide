"use client";

import { useDemo } from "@/queries/demo";
import { useQueryState } from "nuqs";
import { RemotionVideo } from "./video";

export default function DemoPage() {
  const [demoId, setDemoId] = useQueryState("demoId");
  const { data } = useDemo(demoId ?? "");

  if (!demoId) throw new Error("DemoId is not provided");
  if (!data) return <div>Loading...</div>;

  return (
    <div className="flex flex-col justify-center min-h-screen items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Demo Guide Clip</h1>
      <div>
        <RemotionVideo data={data} />
      </div>
      {/* <div>{JSON.stringify(data)}</div> */}
      <ol>
        {data.clicks.map((click) => (
          <li key={click.id}>
            {click.elementContent ? click.elementContent : "Click this"} -{" "}
            <span className="font-mono bg-gray-200">
              {click.x},{click.y}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
