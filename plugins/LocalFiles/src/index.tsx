import React from "react";

import { redux, observePromise } from "@luna/lib";
import { Page } from "@luna/ui";

import { unloads, trace } from "./index.safe";

export { unloads, errSignal } from "./index.safe";

export { Settings } from "./Settings";

import folderSvg from "file://folder-open.svg";

const LocalFilesPage = Page.register("local-files", unloads, 
    <div>Local Files</div>
);

observePromise(unloads, "nav div section[role='menu']", 1000).then((elem) => {
    if (!elem) return trace.err("Failed to find menu");
    const localFileBtn = document.createElement("button")
    localFileBtn.classList = elem.querySelector("a")?.classList.toString() ?? "";
    localFileBtn.draggable = false;
    localFileBtn.role = "menuitem";
    // @ts-ignore
    localFileBtn['data-test'] = "menu--local-files"

    localFileBtn.innerHTML = folderSvg + '<span data-wave-color="textDefault" data-wave-number-of-lines="1" class="wave-text-description-demi">Local Files</span>'

    localFileBtn.onclick = () => {
        LocalFilesPage.open();
    }

    elem.appendChild(localFileBtn);

    unloads.add(() => {
        localFileBtn.remove()
    });
});