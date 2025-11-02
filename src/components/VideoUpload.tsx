import { useState } from 'react';
import { Upload, Link as LinkIcon } from 'lucide-react';

interface VideoUploadProps {
  onVideoAdded: (video: { title: string; sourceType: 'upload' | 'youtube'; sourceUrl: string; duration: number }) => void;
}

export function VideoUpload({ onVideoAdded }: VideoUploadProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'youtube'>('upload');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;

    video.onloadedmetadata = () => {
      onVideoAdded({
        title: title || file.name,
        sourceType: 'upload',
        sourceUrl: url,
        duration: Math.floor(video.duration)
      });
      setIsProcessing(false);
      setTitle('');
    };
  };

  const handleYoutubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl) return;

    setIsProcessing(true);

    const videoId = extractYoutubeId(youtubeUrl);
    if (!videoId) {
      alert('Invalid YouTube URL');
      setIsProcessing(false);
      return;
    }

    onVideoAdded({
      title: title || 'YouTube Video',
      sourceType: 'youtube',
      sourceUrl: youtubeUrl,
      duration: 0
    });

    setYoutubeUrl('');
    setTitle('');
    setIsProcessing(false);
  };

  const extractYoutubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Video</h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'upload'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload File
        </button>
        <button
          onClick={() => setActiveTab('youtube')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === 'youtube'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <LinkIcon className="w-4 h-4 inline mr-2" />
          YouTube Link
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video Title (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter video title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {activeTab === 'upload' ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
            id="video-upload"
            disabled={isProcessing}
          />
          <label htmlFor="video-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-1">
              {isProcessing ? 'Processing video...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-400">MP4, WebM, or any video format</p>
          </label>
        </div>
      ) : (
        <form onSubmit={handleYoutubeSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube URL
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing || !youtubeUrl}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            {isProcessing ? 'Adding Video...' : 'Add YouTube Video'}
          </button>
        </form>
      )}
    </div>
  );
}
