import { env } from "@/env";
import ky from "ky";
import type { Demo } from "./demo.types";

class Sdk {
  url: string;
  constructor(url?: string) {
    this.url = url ?? env.NEXT_PUBLIC_SUPAGUIDE_API_URL;
  }

  async getDemos() {
    const res = await ky.get(`${this.url}/web/demos`);
    const data = await res.json<Demo[]>();
    return data;
  }

  async getDemo(id: string) {
    const res = await ky.get(`${this.url}/web/demo/${id}`);
    const data = await res.json<Demo>();
    return data;
  }
}

export const sdk = new Sdk();
