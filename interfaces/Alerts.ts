export interface EmergencyAlert {
  id: string;
  batch_id: string;
  user_id: string;
  screen_id: string;
  message: string;
  created_at: string;
  expires_at: string;
  dismissed_at: string | null;
  screen?: {
    name: string;
  };
}
