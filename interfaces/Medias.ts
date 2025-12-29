import { PlaylistItemForm, PlaylistItems } from "./Playlists";

export interface Media {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  thumbnail_path: string;
  created_at: string;
  updated_at: string;
}
export interface MediaFormProps {
  value: PlaylistItemForm;
  onChange: (data: PlaylistItemForm) => void;
}

export interface ImageFormProps extends MediaFormProps {
  images: Media[] | null;
}

export interface VideoFormProps extends MediaFormProps {
  videos: Media[] | null;
}

export type MediaType =
  | "image"
  | "video"
  | "weather"
  | "news"
  | "stock"
  | "google-sheets";
