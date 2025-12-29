"use client";

import { useState } from "react";
import { Playlist } from "@/interfaces/Playlists";
import Tabs from "./Tabs";
import PlaylistHeader from "./PlaylistHeader";
import InfoTab from "./InfoTab";
import TimelineTab from "./TimelineTab";
import { Media } from "@/interfaces/Medias";

interface Props {
  playlist: Playlist;
  images: Media[] | null;
  videos: Media[] | null;
}

export default function Editor({ playlist, images, videos }: Props) {
  const [activeTab, setActiveTab] = useState<"info" | "timeline">("timeline");
  console.log(playlist);
  return (
    <div className="space-y-6">
      <PlaylistHeader playlist={playlist} />

      <Tabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "info" && <InfoTab playlist={playlist} />}
      {activeTab === "timeline" && (
        <TimelineTab
          items={playlist.playlist_items}
          images={images}
          videos={videos}
        />
      )}
    </div>
  );
}
