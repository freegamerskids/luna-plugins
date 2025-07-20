import React from "react";
import { getDirectoryContents } from "./fs.native";
import { settings } from "./Settings";
import { idToFileMap, trace } from "./index.safe";
import { redux } from "@luna/lib";

const play = (item: string) => {
    const randomId = Math.floor(Math.random() * 10000000);
    const randomAlbumId = Math.floor(Math.random() * 10000000);
    const artist = {
        id: "vendaxar",
        name: "vendax",
        type: "MAIN",
        picture: "",
    };
    const album = {
        id: randomAlbumId,
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
            title: item.replaceAll("\\", "/").split("/").pop(),
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
            audioQuality: "HIGH",
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

    idToFileMap.set(randomId.toString(), item);
    
    redux.actions["playQueue/ADD_NOW"]({
        context: { type: "UNKNOWN" },
        mediaItemIds: [randomId],
        fromIndex: 0,
    });
};

export function LocalFiles() {
    const [files, setFiles] = React.useState<string[]>([]);

    React.useEffect(() => {
        getDirectoryContents(settings.localFilesFolder ?? "").then((files) => {
            trace.log(files);
            setFiles(files);
        });
    }, [settings.localFilesFolder]);

    return (
        <div>
            <h1>Local Files</h1>
            <div>
                {files.map((file) => (
                    <div key={file}>
                        <div>{file.replaceAll("\\", "/").split("/").pop()}</div>
                        <button onClick={() => play(file.replaceAll("\\", "/"))}>Play</button>
                    </div>
                ))}
            </div>
        </div>
    )
}
