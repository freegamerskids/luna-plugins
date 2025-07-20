import React from "react";
import { getDirectoryContents } from "./native/fs.native";
import { settings } from "./Settings";
import { idToFileMap, trace, unloads } from "./index.safe";
import { redux, StyleTag } from "@luna/lib";
import { IAudioMetadata } from "music-metadata";

import styles from "file://localfilespage.css?minify";

new StyleTag("LocalFiles", unloads, styles);

const play = (item: { path: string; metadata: IAudioMetadata; albumCover: string }) => {
    const randomId = Math.floor(Math.random() * 10000000);
    const randomAlbumId = Math.floor(Math.random() * 10000000);

    const artist = {
        id: "random-artist-id",
        name: item.metadata.common.artist ?? "Unknown Artist",
        type: "MAIN",
        picture: "",
        url: "/not-found?local-files",
    };

    const album = {
        id: randomAlbumId,
        title: item.metadata.common.album ?? "",
        cover: item.albumCover,
        vibrantColor: "#000000",
        videoCover: undefined,
        duration: item.metadata.format.duration ?? 0,
        streamStartDate: "1",
        numberOfTracks: 1,
        numberOfVideos: 0,
        numberOfVolumes: 1,
        releaseDate: "1",
        releaseYear: null,
        copyright: "",
        type: "ALBUM",
        version: null,
        url: "/not-found?local-files",
        explicit: false,
        upc: "PLACEHOLDER_UPC",
        popularity: 0,
        audioQuality: "HIGH",
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
            title: item.metadata.common.title ?? item.path.replaceAll("\\", "/").split("/").pop(),
            version: null,
            duration: item.metadata.format.duration ?? 0,
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
            url: "/not-found?local-files",
            replayGain: 0,
            peak: 0,
            editable: false,
            audioQuality: item.metadata.format.container === "flac" ? "LOSSLESS" : "HIGH",
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

    idToFileMap.set(randomId.toString(), item.path);
    
    redux.actions["playQueue/ADD_NOW"]({
        context: { type: "UNKNOWN" },
        mediaItemIds: [randomId],
        fromIndex: 0,
    });
};

function ListItem({ path, metadata }: { path: string; metadata: IAudioMetadata }) {
    const albumCover = metadata.common.picture?.[0]?.data ? URL.createObjectURL(new Blob([metadata.common.picture?.[0]?.data])) : "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNDIgNDIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJkZWZhdWx0QWxidW1JbWFnZSI+CjxnIGlkPSJkZWZhdWx0QWxidW1JbWFnZV8yIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTIxIDMxLjVDMjYuNzk5IDMxLjUgMzEuNSAyNi43OTkgMzEuNSAyMUMzMS41IDE1LjIwMSAyNi43OTkgMTAuNSAyMSAxMC41QzE1LjIwMSAxMC41IDEwLjUgMTUuMjAxIDEwLjUgMjFDMTAuNSAyNi43OTkgMTUuMjAxIDMxLjUgMjEgMzEuNVoiIHN0cm9rZT0iIzc4Nzc3RiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggaWQ9IlZlY3Rvcl8yIiBkPSJNMjEgMjMuNUMyMi4zODA3IDIzLjUgMjMuNSAyMi4zODA3IDIzLjUgMjFDMjMuNSAxOS42MTkzIDIyLjM4MDcgMTguNSAyMSAxOC41QzE5LjYxOTMgMTguNSAxOC41IDE5LjYxOTMgMTguNSAyMUMxOC41IDIyLjM4MDcgMTkuNjE5MyAyMy41IDIxIDIzLjVaIiBzdHJva2U9IiM3ODc3N0YiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjwvZz4KPC9nPgo8L3N2Zz4K";
    return (
        <div key={path} style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", contain: "strict", height: "48px", gap: "12px" }}>
            <figure style={{ flex: "0 0 42px" }}>
                <img src={albumCover} alt="Album Cover" height={42} width={42} style={{ display: "block", objectFit: "cover", objectPosition: "0 0", backgroundColor: "#242429" }}/>
                <div style={{ display: "flex", justifyContent: "center", alignContent: "center", position: "absolute", height: "42px", width: "42px", top: 3, left: 0 }}>
                    <button className="playButton" onClick={() => play({ path, metadata, albumCover })} style={{ height: "42px", width: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" stroke-width="0" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                    </button>
                </div>
            </figure>
            <div>{metadata.common.title ?? path.replaceAll("\\", "/").split("/").pop()}</div>
        </div>
    )
}

export function LocalFiles() {
    const [files, setFiles] = React.useState<{ path: string; metadata: IAudioMetadata }[]>([]);

    React.useEffect(() => {
        getDirectoryContents(settings.localFilesFolder ?? "").then((files) => {
            trace.log(files);
            setFiles(files);
        });
    }, [settings.localFilesFolder]);

    return (
        <div style={{ paddingRight: "28px", paddingLeft: "28px" }}>
            <h1>Local Files</h1>
            <div>
                {files.map((file) => (
                    <ListItem path={file.path} metadata={file.metadata} />
                ))}
            </div>
        </div>
    )
}
