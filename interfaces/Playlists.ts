import { Media } from "./Medias";
import { Screen } from "./Screens";

export interface Playlist {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  description: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  playlist_items: PlaylistItems[];
  screens: Screen[];
}

export interface PlaylistItems {
  id: string;
  playlist_id: string;
  media_file_id: string | null;
  order_index: number;
  duration_override: number | null;
  type: string;
  config: Record<string, any>;
  start_view: string | null;
  end_view: string | null;
  updated_at: string;
  created_at: string;
  media_files: Media;
}

export interface PlaylistItemForm {
  id?: string;
  playlist_id: string;
  type: string;
  media_file_id: string | null;
  order_index: number;
  duration_override: number | null;
  start_view: string | null;
  end_view: string | null;
  config: Record<string, any>;
}
