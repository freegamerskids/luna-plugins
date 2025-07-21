import React from "react";

import { redux, observePromise } from "@luna/lib";
import { Page } from "@luna/ui";

import { unloads, trace, blobURLMap, idToFileMap } from "./index.safe";
import { loadFile } from "./native/fs.native";
import { LocalFiles } from "./LocalFilesPage";
import { settings } from "./Settings";
import { audioMimes } from "./util";
import { startWebserver, stopWebserver } from "./native/webserver.native";

export { unloads, errSignal } from "./index.safe";
export { Settings } from "./Settings";

import folderSvg from "file://folder-open.svg";

const PORT = 51423;

startWebserver(PORT);
unloads.add(() => {
    stopWebserver();
});

const LocalFilesPage = Page.register("local-files", unloads, 
    <>
        <LocalFiles />
    </>
);

const constantMock = window.fetch;
window.fetch = async function() {
    trace.log("Fetch arguments: ", arguments);
    if (typeof arguments[0] === "string" && arguments[0].includes("___.___")) {
        const fileName = arguments[0].split("___.___/")[1];
        trace.log("Fetching file: ", fileName);
        const file = await loadFile(decodeURIComponent(fileName));
        if (file === false) {
            trace.err("Failed to load file");
            return new Response(null, { status: 404 });
        }
        return new Response(file, { status: 200 })
    }
    
    if (typeof arguments[0] === "string" && arguments[0].includes("playbackinfo")) {
        const url = new URL(arguments[0]);
        const productId = url.pathname.split("/").reverse()[1];
        if (productId && idToFileMap.has(productId)) {
            const fileName = idToFileMap.get(productId)!;
            const extension = fileName.split(".").pop()!;

            let fakeurl = `file://${fileName}`;
            let manifest = "";
            let manifestMimeType = "";
            let audioQuality = "";

            if (extension === "flac") {
                audioQuality = "LOSSLESS";
                manifestMimeType = "application/vnd.tidal.bts";
                manifest = JSON.stringify({
                    "mimeType": audioMimes[`.${extension}`],
                    "codecs": extension,
                    "encryptionType": "NONE",
                    "urls": [
                        fakeurl
                    ]
                })
            } else if (extension === "m4a") {
                fakeurl = `https://___.___/${fileName}`;
                audioQuality = "HIGH";
                manifestMimeType = "application/dash+xml";
                manifest = `<?xml version='1.0' encoding='UTF-8'?>
                <MPD xmlns="urn:mpeg:dash:schema:mpd:2011" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:cenc="urn:mpeg:cenc:2013" xsi:schemaLocation="urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd" profiles="urn:mpeg:dash:profile:isoff-main:2011" type="static" minBufferTime="PT3.993S" mediaPresentationDuration="PT2M46.726S">
                    <Period id="0">
                        <AdaptationSet id="0" contentType="audio" mimeType="audio/mp4" segmentAlignment="true">
                            <Representation id="0" codecs="mp4a.40.2" bandwidth="321718" audioSamplingRate="44100">
                                <SegmentTemplate timescale="44100" initialization="${fakeurl}" media="${fakeurl}" startNumber="1">
                                    <SegmentTimeline>
                                        <S d="176128" r="1"/>
                                    </SegmentTimeline>
                                </SegmentTemplate>
                            </Representation>
                        </AdaptationSet>
                    </Period>
                </MPD>`;
            } else {
                audioQuality = "HIGH";
                manifestMimeType = "application/vnd.tidal.bts";
                fakeurl = `http://localhost:${PORT}/${fileName}`;
                manifest = JSON.stringify({
                    "mimeType": audioMimes[`.${extension}`],
                    "codecs": extension,
                    "encryptionType": "NONE",
                    "urls": [
                        fakeurl
                    ]
                })
            }

            return new Response(JSON.stringify({
                "trackId": Number(productId),
                "assetPresentation": "FULL",
                "audioMode": "STEREO",
                "audioQuality": audioQuality,
                "streamingSessionId": crypto.randomUUID(),
                "manifestMimeType": manifestMimeType,
                "manifestHash": "",
                "manifest": btoa(manifest),
            }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
    }
    // @ts-ignore
    return constantMock.apply(this, arguments);
}
unloads.add(() => {
    window.fetch = constantMock;
});

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
        if (!settings.localFilesFolder) return trace.err("No local files folder set");
        LocalFilesPage.open();
    }

    elem.appendChild(localFileBtn);

    unloads.add(() => {
        localFileBtn.remove()
    });
});

const lfAudioNode = document.createElement("audio");
document.body.appendChild(lfAudioNode);
unloads.add(() => {
    lfAudioNode.remove();
});

// redux.intercept(["playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION", "playbackControls/MEDIA_PRODUCT_TRANSITION"], unloads, ({ mediaProduct: { productId, productType } }, action) => {
//     trace.log("Intercepted action: " + action);
//     trace.log("Product ID: " + productId);
//     trace.log("idToFileMap: ", idToFileMap.keys().toArray());
    
//     if (typeof productId === "string" && idToFileMap.has(productId)) {
//         (async () => {
//             const fileName = idToFileMap.get(productId)!;
//             const blobURL = blobURLMap.get(fileName);
//             if (fileName && !blobURL) {
//                 const file = await loadFile(fileName);
//                 if (!file) return trace.err("Failed to load file");
//                 const fileBlob = new Blob([file]);
//                 const blobURL = URL.createObjectURL(fileBlob);
//                 blobURLMap.set(fileName, blobURL);

//                 const tempAudio = document.createElement("audio");
//                 tempAudio.ondurationchange = () => {
//                     const duration = tempAudio.duration;

//                     trace.log("Duration: " + duration);
//                     switch (action) {
//                         case "playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION":
//                             redux.actions["playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION"]({
//                                 mediaProduct: {
//                                     productId,
//                                     productType,
//                                 },
//                                 playbackContext: {
//                                     actualDuration: duration,
//                                 }
//                             });
//                             break;
//                         case "playbackControls/MEDIA_PRODUCT_TRANSITION":
//                             redux.actions["playbackControls/MEDIA_PRODUCT_TRANSITION"]({
//                                 mediaProduct: {
//                                     productId,
//                                     productType,
//                                 },
//                                 playbackContext: {
//                                     actualDuration: duration,
//                                     actualAssetPresentation: "FULL",
//                                     actualAudioMode: "STEREO",
//                                     actualAudioQuality: "HIGH",
//                                     actualProductId: productId.toString(),
//                                     actualStreamType: "AUDIO",
//                                     assetPosition: 0,
//                                     bitDepth: 16,
//                                     codec: "unknown",
//                                     playbackSessionId: "",
//                                     sampleRate: 44100,
//                                     actualVideoQuality: "",
//                                 }
//                             });
//                             break;
//                     }
//                     tempAudio.remove();
//                 }
//                 tempAudio.src = blobURL;
//             }

//             if (action === "playbackControls/MEDIA_PRODUCT_TRANSITION") {
//                 lfAudioNode.src = blobURL!;
//                 lfAudioNode.play();
//             }
//         })();
//         return true;
//     }
// })