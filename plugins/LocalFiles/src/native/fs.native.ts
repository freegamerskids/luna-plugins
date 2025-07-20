import sanitize from "sanitize-filename";

import { readFileSync } from "fs";
import { access, constants, readdir } from "fs/promises";
import { join, parse } from "path";

const fileExists = async (path: string): Promise<boolean> => {
	try {
		await access(path, constants.F_OK);
		return true;
	} catch {
		return false;
	}
};

export const loadFile = async (path: string): Promise<ArrayBuffer | false> => {
	try {
		if (!(await fileExists(path))) return false;
		const parsedPath = parse(path);
		const file = readFileSync(join(parsedPath.dir, sanitize(parsedPath.base)));

        return file.buffer;
	}
    catch (e) {
        return false
    }
}

export const getDirectoryContents = async (path: string): Promise<string[]> => {
	const files = await readdir(path, { withFileTypes: true });
	return files.map((file) => join(path, file.name));
}