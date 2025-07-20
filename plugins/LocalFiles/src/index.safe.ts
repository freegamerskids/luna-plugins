import { LunaUnload, Tracer } from "@luna/core";

export const unloads = new Set<LunaUnload>();
export const { trace, errSignal } = Tracer("[LocalFilesPlugin]");

export const blobURLMap = new Map<string, string>();
export const idToFileMap = new Map<string, string>();