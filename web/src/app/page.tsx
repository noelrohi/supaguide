"use client";
import { formatDate } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDemos } from "@/queries/demo";
import { Loader2, MoreVertical } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col justify-center min-h-screen items-center">
      <Suspense fallback={<Loader2 className="size-10" />}>
        <Demos />
      </Suspense>
    </div>
  );
}

function Demos() {
  const { data: demoData } = useDemos();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {demoData.map((demo) => (
        <Link href={`/demo?demoId=${demo.id}`} key={demo.id}>
          <Card className="min-w-[20rem]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {demo.title ?? "Untitled"}
              </CardTitle>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {demo.clickCount ?? 0} steps
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                {formatDate(new Date(demo.createdAt), "MMM d, yyyy")}
              </p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
