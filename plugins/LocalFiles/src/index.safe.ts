import { LunaUnload, Tracer } from "@luna/core";

export const unloads = new Set<LunaUnload>();
export const { trace, errSignal } = Tracer("[LocalFilesPlugin]");