import { useState } from 'react';
import { Scissors, Type, FileText } from 'lucide-react';

interface ClipEditorProps {
  videoDuration: number;
  onCreateClip: (clipData: ClipData) => void;
}

export interface ClipData {
  title: string;
  startTime: number;
  endTime: number;
  aspectRatio: string;
  subtitleEnabled: boolean;
  subtitleSettings: {
    font: string;
    design: string;
    highlights: string[];
  };
  textOverlays: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
  }>;
}

const ASPECT_RATIOS = [
  { label: '3:2', value: '3:2' },
  { label: '4:3', value: '4:3' },
  { label: '5:4', value: '5:4' },
  { label: '9:16 (Portrait)', value: '9:16' },
  { label: '16:10', value: '16:10' },
  { label: '16:9 (Standard)', value: '16:9' },
  { label: '21:9 (Ultrawide)', value: '21:9' },
  { label: '2.35:1 (Cinematic)', value: '2.35:1' },
  { label: '1.85:1 (Cinema)', value: '1.85:1' }
];

const SUBTITLE_FONTS = ['Arial', 'Helvetica', 'Times New Roman', 'Courier', 'Verdana', 'Georgia', 'Comic Sans MS'];
const SUBTITLE_DESIGNS = ['default', 'bold', 'outline', 'shadow', 'box'];

export function ClipEditor({ videoDuration, onCreateClip }: ClipEditorProps) {
  const [clipTitle, setClipTitle] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(Math.min(30, videoDuration));
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [subtitleEnabled, setSubtitleEnabled] = useState(true);
  const [subtitleFont, setSubtitleFont] = useState('Arial');
  const [subtitleDesign, setSubtitleDesign] = useState('default');
  const [textOverlays, setTextOverlays] = useState<Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
  }>>([]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddTextOverlay = () => {
    setTextOverlays([
      ...textOverlays,
      {
        id: `overlay-${Date.now()}`,
        text: 'New Text',
        x: 50,
        y: 50,
        fontSize: 24,
        color: '#ffffff'
      }
    ]);
  };

  const handleUpdateTextOverlay = (id: string, updates: Partial<typeof textOverlays[0]>) => {
    setTextOverlays(textOverlays.map(overlay =>
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
  };

  const handleRemoveTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter(overlay => overlay.id !== id));
  };

  const handleCreateClip = () => {
    if (!clipTitle.trim()) {
      alert('Please enter a clip title');
      return;
    }

    if (startTime >= endTime) {
      alert('Start time must be before end time');
      return;
    }

    onCreateClip({
      title: clipTitle,
      startTime,
      endTime,
      aspectRatio,
      subtitleEnabled,
      subtitleSettings: {
        font: subtitleFont,
        design: subtitleDesign,
        highlights: []
      },
      textOverlays
    });

    setClipTitle('');
    setStartTime(0);
    setEndTime(Math.min(30, videoDuration));
    setTextOverlays([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Scissors className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800">Create Clip</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clip Title
          </label>
          <input
            type="text"
            value={clipTitle}
            onChange={(e) => setClipTitle(e.target.value)}
            placeholder="Enter clip title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time ({formatTime(startTime)})
            </label>
            <input
              type="range"
              min="0"
              max={videoDuration}
              value={startTime}
              onChange={(e) => setStartTime(parseFloat(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              value={startTime}
              onChange={(e) => setStartTime(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full mt-2 px-3 py-1 border border-gray-300 rounded"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time ({formatTime(endTime)})
            </label>
            <input
              type="range"
              min="0"
              max={videoDuration}
              value={endTime}
              onChange={(e) => setEndTime(parseFloat(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              value={endTime}
              onChange={(e) => setEndTime(Math.min(videoDuration, parseFloat(e.target.value) || 0))}
              className="w-full mt-2 px-3 py-1 border border-gray-300 rounded"
              step="0.1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aspect Ratio
          </label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {ASPECT_RATIOS.map(ratio => (
              <option key={ratio.value} value={ratio.value}>
                {ratio.label}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-800">Subtitles</h3>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={subtitleEnabled}
                onChange={(e) => setSubtitleEnabled(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Enable AI Subtitles</span>
            </label>
          </div>

          {subtitleEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font
                </label>
                <select
                  value={subtitleFont}
                  onChange={(e) => setSubtitleFont(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {SUBTITLE_FONTS.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Design
                </label>
                <select
                  value={subtitleDesign}
                  onChange={(e) => setSubtitleDesign(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {SUBTITLE_DESIGNS.map(design => (
                    <option key={design} value={design}>{design}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-800">Text Overlays</h3>
            </div>
            <button
              onClick={handleAddTextOverlay}
              className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors"
            >
              Add Text
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {textOverlays.map(overlay => (
              <div key={overlay.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={overlay.text}
                    onChange={(e) => handleUpdateTextOverlay(overlay.id, { text: e.target.value })}
                    placeholder="Text content"
                    className="px-3 py-1 border border-gray-300 rounded"
                  />
                  <input
                    type="color"
                    value={overlay.color}
                    onChange={(e) => handleUpdateTextOverlay(overlay.id, { color: e.target.value })}
                    className="h-8 w-full border border-gray-300 rounded"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={overlay.fontSize}
                    onChange={(e) => handleUpdateTextOverlay(overlay.id, { fontSize: parseInt(e.target.value) })}
                    placeholder="Size"
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    value={overlay.x}
                    onChange={(e) => handleUpdateTextOverlay(overlay.id, { x: parseInt(e.target.value) })}
                    placeholder="X pos"
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    value={overlay.y}
                    onChange={(e) => handleUpdateTextOverlay(overlay.id, { y: parseInt(e.target.value) })}
                    placeholder="Y pos"
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <button
                  onClick={() => handleRemoveTextOverlay(overlay.id)}
                  className="mt-2 text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreateClip}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          Create Clip
        </button>
      </div>
    </div>
  );
}
