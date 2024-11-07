import { sdk } from "@/data/demo";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useDemos() {
  return useSuspenseQuery({
    queryKey: ["demos"],
    queryFn: async () => {
      const data = await sdk.getDemos();
      return data;
    },
  });
}

export function useDemo(args: Parameters<typeof sdk.getDemo>[0]) {
  return useSuspenseQuery({
    queryKey: ["demo", args],
    queryFn: async () => {
      const data = await sdk.getDemo(args);
      return data;
    },
  });
}
