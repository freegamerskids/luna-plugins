import React from "react";

import { ReactiveStore } from "@luna/core";
import { LunaButtonSetting, LunaSettings } from "@luna/ui";
import { showOpenDialog } from "@luna/lib.native";

async function getLocalFilesFolder() {
	const { canceled, filePaths } = await showOpenDialog({
		properties: ["openDirectory", "createDirectory"],
	});
	if (!canceled) return filePaths[0];
}

type Settings = {
	localFilesFolder?: string;
};
export const settings = await ReactiveStore.getPluginStorage<Settings>("LocalFiles", {
	localFilesFolder: undefined,
});

export const Settings = () => {
	return (
		<LunaSettings>
			<LunaButtonSetting title="Set Local Files Folder" desc="Choose a folder to load local files from" onClick={() => getLocalFilesFolder().then((folder) => {
				if (folder) {
					settings.localFilesFolder = folder;
				}
			})} />
		</LunaSettings>
	);
};
