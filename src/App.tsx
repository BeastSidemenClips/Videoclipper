import { useState, useEffect } from 'react';
import { Film, List, Scissors } from 'lucide-react';
import { VideoUpload } from './components/VideoUpload';
import { VideoPlayer } from './components/VideoPlayer';
import { ClipEditor, ClipData } from './components/ClipEditor';
import { DraftsManager } from './components/DraftsManager';
import { supabase } from './lib/supabase';

interface Video {
  id: string;
  title: string;
  source_type: 'upload' | 'youtube';
  source_url: string;
  duration: number;
  created_at: string;
}

interface Clip {
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
}

type View = 'upload' | 'editor' | 'drafts';

function App() {
  const [currentView, setCurrentView] = useState<View>('upload');
  const [videos, setVideos] = useState<Video[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    loadVideos();
    loadClips();
  }, []);

  const loadVideos = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading videos:', error);
      return;
    }

    setVideos(data || []);
  };

  const loadClips = async () => {
    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading clips:', error);
      return;
    }

    setClips(data || []);
  };

  const handleVideoAdded = async (videoData: {
    title: string;
    sourceType: 'upload' | 'youtube';
    sourceUrl: string;
    duration: number;
  }) => {
    const { data, error } = await supabase
      .from('videos')
      .insert({
        title: videoData.title,
        source_type: videoData.sourceType,
        source_url: videoData.sourceUrl,
        duration: videoData.duration
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding video:', error);
      alert('Failed to add video');
      return;
    }

    if (data) {
      setVideos([data, ...videos]);
      setSelectedVideo(data);
      setCurrentView('editor');
      setShowPlayer(true);
    }
  };

  const handleCreateClip = async (clipData: ClipData) => {
    if (!selectedVideo) return;

    const { data, error } = await supabase
      .from('clips')
      .insert({
        video_id: selectedVideo.id,
        title: clipData.title,
        start_time: clipData.startTime,
        end_time: clipData.endTime,
        aspect_ratio: clipData.aspectRatio,
        subtitle_enabled: clipData.subtitleEnabled,
        subtitle_settings: clipData.subtitleSettings,
        text_overlays: clipData.textOverlays
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating clip:', error);
      alert('Failed to create clip');
      return;
    }

    if (data) {
      setClips([data, ...clips]);
      alert('Clip created successfully!');
    }
  };

  const handleClipSelect = async (clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;

    const video = videos.find(v => v.id === clip.video_id);
    if (!video) return;

    setSelectedVideo(video);
    setCurrentTime(clip.start_time);
    setCurrentView('editor');
    setShowPlayer(true);
  };

  const handleBatchEdit = (clipIds: string[]) => {
    alert(`Batch editing ${clipIds.length} clips. Feature ready for implementation!`);
  };

  const handleDeleteClips = async (clipIds: string[]) => {
    if (!confirm(`Delete ${clipIds.length} clip(s)?`)) return;

    const { error } = await supabase
      .from('clips')
      .delete()
      .in('id', clipIds);

    if (error) {
      console.error('Error deleting clips:', error);
      alert('Failed to delete clips');
      return;
    }

    setClips(clips.filter(clip => !clipIds.includes(clip.id)));
  };

  const handleSelectVideo = (video: Video) => {
    setSelectedVideo(video);
    setCurrentView('editor');
    setShowPlayer(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                <Film className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Video Clipper</h1>
                <p className="text-sm text-gray-600">Create unlimited custom clips with AI</p>
              </div>
            </div>

            <nav className="flex gap-2">
              <button
                onClick={() => setCurrentView('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'upload'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Film className="w-4 h-4" />
                Upload
              </button>
              <button
                onClick={() => {
                  if (!selectedVideo) {
                    alert('Please select or upload a video first');
                    return;
                  }
                  setCurrentView('editor');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'editor'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Scissors className="w-4 h-4" />
                Editor
              </button>
              <button
                onClick={() => setCurrentView('drafts')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'drafts'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
                Drafts
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {currentView === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <VideoUpload onVideoAdded={handleVideoAdded} />

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Videos</h2>
              {videos.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No videos uploaded yet</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {videos.map(video => (
                    <div
                      key={video.id}
                      onClick={() => handleSelectVideo(video)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <h3 className="font-semibold text-gray-800">{video.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {video.source_type === 'youtube' ? 'YouTube' : 'Uploaded'} •
                        {video.duration > 0 ? ` ${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : ' Duration unknown'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'editor' && selectedVideo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {showPlayer && (
                <VideoPlayer
                  videoUrl={selectedVideo.source_url}
                  currentTime={currentTime}
                  onTimeUpdate={setCurrentTime}
                  onClose={() => setShowPlayer(false)}
                />
              )}

              {!showPlayer && (
                <button
                  onClick={() => setShowPlayer(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-medium transition-colors"
                >
                  Show Video Player
                </button>
              )}

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedVideo.title}</h3>
                <p className="text-sm text-gray-600">
                  Current time: {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>

            <ClipEditor
              videoDuration={selectedVideo.duration}
              onCreateClip={handleCreateClip}
            />
          </div>
        )}

        {currentView === 'editor' && !selectedVideo && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Scissors className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Video Selected</h2>
            <p className="text-gray-600 mb-6">Upload a video or select one from your library to start editing</p>
            <button
              onClick={() => setCurrentView('upload')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go to Upload
            </button>
          </div>
        )}

        {currentView === 'drafts' && (
          <DraftsManager
            clips={clips}
            onClipSelect={handleClipSelect}
            onBatchEdit={handleBatchEdit}
            onDeleteClips={handleDeleteClips}
          />
        )}
      </main>
    </div>
  );
}

export default App;
