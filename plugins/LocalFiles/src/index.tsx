import React from "react";

import { redux, observePromise } from "@luna/lib";
import { Page } from "@luna/ui";

import { unloads, trace } from "./index.safe";
import { loadFile } from "./loadfile.native";

export { unloads, errSignal } from "./index.safe";
export { Settings } from "./Settings";

import folderSvg from "file://folder-open.svg";

const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    play();
};

const LocalFilesPage = Page.register("local-files", unloads, 
    <>
        <div>Local Files</div>
        <input type="file" multiple accept=".mp3" onChange={handleFileChange} />
    </>
);

const play = () => {
    const id = 1;
    const artist = {
        id: "vendaxar",
        name: "vendax",
        type: "MAIN",
        picture: "",
    };
    const album = {
        id: "vndx",
        title: "vendax",
        cover: "",
        vibrantColor: "#000000",
        videoCover: undefined,
        duration: 180,
        streamStartDate: "1",
        numberOfTracks: 1,
        numberOfVideos: 0,
        numberOfVolumes: 1,
        releaseDate: "1",
        releaseYear: null,
        copyright: "",
        type: "ALBUM",
        version: null,
        url: "/",
        explicit: false,
        upc: "PLACEHOLDER_UPC",
        popularity: 0,
        audioQuality: "LOSSLESS",
        audioModes: [],
        mediaMetadata: { tags: [] },
        upload: false,
        artist,
        artists: [artist],
        genre: null,
        recordLabel: null,
        allowStreaming: true,
        streamReady: true,
        payToStream: false,
        adSupportedStreamReady: false,
        djReady: false,
        stemReady: false,
        premiumStreamingOnly: false,
    };
    const mediaItem = {
        type: "track",
        item: {
            id: 1,
            contentType: "track" as "track",
            title: "PLACEHOLDERR",
            version: null,
            duration: 180,
            trackNumber: 1,
            volumeNumber: 1,
            streamStartDate: new Date().toISOString(),
            releaseDate: new Date().toISOString(),
            explicit: false,
            popularity: 0,
            artist,
            artists: [artist],
            album,
            mixes: null,
            allowStreaming: true,
            streamReady: true,
            payToStream: false,
            adSupportedStreamReady: false,
            djReady: false,
            stemReady: false,
            premiumStreamingOnly: false,
            url: "",
            replayGain: 0,
            peak: 0,
            editable: false,
            audioQuality: "LOSSLESS",
            audioModes: [],
            mediaMetadata: { tags: [] },
            upload: false,
            genre: null,
            recordLabel: null,
            type: "ALBUM",
            videoCover: undefined,
            numberOfTracks: 1,
            numberOfVideos: 0,
            numberOfVolumes: 1,
            releaseYear: null,
            copyright: "",
            upc: "PLACEHOLDER_UPC"
        }
    } as any;
    redux.actions["content/LOAD_ALL_ALBUM_MEDIA_ITEMS_SUCCESS"]({
        albumId: album.id,
        mediaItems: [mediaItem],
    });
    redux.actions["playQueue/ADD_NOW"]({
        context: { type: "UNKNOWN" },
        mediaItemIds: [id],
        fromIndex: 0,
        overwritePlayQueue: true,
    });
};

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

const lfAudioNode = document.createElement("audio");
document.body.appendChild(lfAudioNode);
unloads.add(() => {
    lfAudioNode.remove();
});

const blobURLMap = new Map<string, string>();
const idToFileURLMap = new Map<number, string>();

redux.intercept(["playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION", "playbackControls/MEDIA_PRODUCT_TRANSITION"], unloads, ({ mediaProduct: { productId, productType } }, action) => {
    if (typeof productId === "number" && idToFileURLMap.has(productId)) {
        (async () => {
            const fileURL = idToFileURLMap.get(productId)!;
            const blobURL = blobURLMap.get(fileURL);
            if (fileURL && !blobURL) {
                const file = await loadFile(fileURL);
                if (!file) return trace.err("Failed to load file");
                const fileBlob = new Blob([file]);
                const blobURL = URL.createObjectURL(fileBlob);
                blobURLMap.set(fileURL, blobURL);

                const tempAudio = document.createElement("audio");
                tempAudio.ondurationchange = () => {
                    const duration = tempAudio.duration;

                    trace.log("Duration: " + duration);
                    switch (action) {
                        case "playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION":
                            redux.actions["playbackControls/PREFILL_MEDIA_PRODUCT_TRANSITION"]({
                                mediaProduct: {
                                    productId: 151515,
                                    productType,
                                },
                                playbackContext: {
                                    actualDuration: duration,
                                }
                            });
                            break;
                        case "playbackControls/MEDIA_PRODUCT_TRANSITION":
                            redux.actions["playbackControls/MEDIA_PRODUCT_TRANSITION"]({
                                mediaProduct: {
                                    productId: 151515,
                                    productType,
                                },
                                playbackContext: {
                                    actualDuration: duration,
                                    actualAssetPresentation: "FULL",
                                    actualAudioMode: "STEREO",
                                    actualAudioQuality: "HIGH",
                                    actualProductId: "151515",
                                    actualStreamType: "AUDIO",
                                    assetPosition: 0,
                                    bitDepth: 16,
                                    codec: "unknown",
                                    playbackSessionId: "",
                                    sampleRate: 44100,
                                    actualVideoQuality: "",
                                }
                            });
                            break;
                    }
                    tempAudio.remove();
                }
                tempAudio.src = blobURL;
            }

            if (action === "playbackControls/MEDIA_PRODUCT_TRANSITION") {
                lfAudioNode.src = blobURL!;
                lfAudioNode.play();
            }
        })();
        return true;
    }
})

redux.intercept("playQueue/ADD_NOW", unloads, (state, action) => {
    for (const item of state.mediaItemIds) {
        if (typeof item === "string" && item.startsWith("file://")) {
            const randomId = Math.floor(Math.random() * 10000000);
            const artist = {
                id: "vendaxar",
                name: "vendax",
                type: "MAIN",
                picture: "",
            };
            const album = {
                id: "vndx",
                title: "vendax",
                cover: "",
                vibrantColor: "#000000",
                videoCover: undefined,
                duration: 180,
                streamStartDate: "1",
                numberOfTracks: 1,
                numberOfVideos: 0,
                numberOfVolumes: 1,
                releaseDate: "1",
                releaseYear: null,
                copyright: "",
                type: "ALBUM",
                version: null,
                url: "/",
                explicit: false,
                upc: "PLACEHOLDER_UPC",
                popularity: 0,
                audioQuality: "LOSSLESS",
                audioModes: [],
                mediaMetadata: { tags: [] },
                upload: false,
                artist,
                artists: [artist],
                genre: null,
                recordLabel: null,
                allowStreaming: true,
                streamReady: true,
                payToStream: false,
                adSupportedStreamReady: false,
                djReady: false,
                stemReady: false,
                premiumStreamingOnly: false,
            };
            const mediaItem = {
                type: "track",
                item: {
                    id: randomId,
                    contentType: "track" as "track",
                    title: "PLACEHOLDERR",
                    version: null,
                    duration: 180,
                    trackNumber: 1,
                    volumeNumber: 1,
                    streamStartDate: new Date().toISOString(),
                    releaseDate: new Date().toISOString(),
                    explicit: false,
                    popularity: 0,
                    artist,
                    artists: [artist],
                    album,
                    mixes: null,
                    allowStreaming: true,
                    streamReady: true,
                    payToStream: false,
                    adSupportedStreamReady: false,
                    djReady: false,
                    stemReady: false,
                    premiumStreamingOnly: false,
                    url: "",
                    replayGain: 0,
                    peak: 0,
                    editable: false,
                    audioQuality: "LOSSLESS",
                    audioModes: [],
                    mediaMetadata: { tags: [] },
                    upload: false,
                    genre: null,
                    recordLabel: null,
                    type: "ALBUM",
                    videoCover: undefined,
                    numberOfTracks: 1,
                    numberOfVideos: 0,
                    numberOfVolumes: 1,
                    releaseYear: null,
                    copyright: "",
                    upc: "PLACEHOLDER_UPC"
                }
            } as any;
            redux.actions["content/LOAD_SINGLE_MEDIA_ITEM_SUCCESS"]({
                mediaItem: mediaItem,
            });
            idToFileURLMap.set(randomId, item);
        }
    }
})

redux.actions["playQueue/ADD_NOW"]({
    context: { type: "UNKNOWN" },
    mediaItemIds: [""],
    fromIndex: 0,
});

// (async () => {
//     const file = await loadFile("<file name here>");
//     if (!file) return trace.err("Failed to load file");
//     const fileBlob = new Blob([file]);

    
//     lfAudioNode.src = URL.createObjectURL(fileBlob);

    
//     lfAudioNode.play();

    
// })()