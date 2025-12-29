export interface Screen {
  id: string;
  client_id: string;
  playlist_id: string;
  user_id: string;
  name: string;
  location: string;
  is_online: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  playlist?: {
    name: string;
  };
}
