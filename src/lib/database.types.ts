export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string;
          title: string;
          source_type: 'upload' | 'youtube';
          source_url: string;
          duration: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          source_type: 'upload' | 'youtube';
          source_url: string;
          duration?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          source_type?: 'upload' | 'youtube';
          source_url?: string;
          duration?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      folders: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      clips: {
        Row: {
          id: string;
          video_id: string;
          folder_id: string | null;
          title: string;
          start_time: number;
          end_time: number;
          aspect_ratio: string;
          subtitle_enabled: boolean;
          subtitle_settings: {
            font: string;
            design: string;
            highlights: string[];
          };
          text_overlays: Array<{
            id: string;
            text: string;
            x: number;
            y: number;
            fontSize: number;
            color: string;
          }>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          folder_id?: string | null;
          title: string;
          start_time?: number;
          end_time?: number;
          aspect_ratio?: string;
          subtitle_enabled?: boolean;
          subtitle_settings?: {
            font: string;
            design: string;
            highlights: string[];
          };
          text_overlays?: Array<{
            id: string;
            text: string;
            x: number;
            y: number;
            fontSize: number;
            color: string;
          }>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string;
          folder_id?: string | null;
          title?: string;
          start_time?: number;
          end_time?: number;
          aspect_ratio?: string;
          subtitle_enabled?: boolean;
          subtitle_settings?: {
            font: string;
            design: string;
            highlights: string[];
          };
          text_overlays?: Array<{
            id: string;
            text: string;
            x: number;
            y: number;
            fontSize: number;
            color: string;
          }>;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
