import { useState, useEffect } from 'react';
import { Folder, FolderPlus, Trash2, Edit2, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DraftsManagerProps {
  clips: Array<{
    id: string;
    title: string;
    folder_id: string | null;
    start_time: number;
    end_time: number;
    aspect_ratio: string;
  }>;
  onClipSelect: (clipId: string) => void;
  onBatchEdit: (clipIds: string[]) => void;
  onDeleteClips: (clipIds: string[]) => void;
}

interface Folder {
  id: string;
  name: string;
  created_at: string;
}

export function DraftsManager({ clips, onClipSelect, onBatchEdit, onDeleteClips }: DraftsManagerProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading folders:', error);
      return;
    }

    setFolders(data || []);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    const { error } = await supabase
      .from('folders')
      .insert({ name: newFolderName });

    if (error) {
      console.error('Error creating folder:', error);
      return;
    }

    setNewFolderName('');
    setIsCreatingFolder(false);
    loadFolders();
  };

  const updateFolder = async (folderId: string) => {
    if (!editingFolderName.trim()) return;

    const { error } = await supabase
      .from('folders')
      .update({ name: editingFolderName })
      .eq('id', folderId);

    if (error) {
      console.error('Error updating folder:', error);
      return;
    }

    setEditingFolderId(null);
    setEditingFolderName('');
    loadFolders();
  };

  const deleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder? Clips will not be deleted.')) return;

    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId);

    if (error) {
      console.error('Error deleting folder:', error);
      return;
    }

    loadFolders();
  };

  const moveClipsToFolder = async (clipIds: string[], folderId: string | null) => {
    const { error } = await supabase
      .from('clips')
      .update({ folder_id: folderId })
      .in('id', clipIds);

    if (error) {
      console.error('Error moving clips:', error);
    }
  };

  const toggleClipSelection = (clipId: string) => {
    setSelectedClips(prev =>
      prev.includes(clipId)
        ? prev.filter(id => id !== clipId)
        : [...prev, clipId]
    );
  };

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const formatDuration = (start: number, end: number) => {
    const duration = end - start;
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const unorganizedClips = clips.filter(clip => !clip.folder_id);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Drafts</h2>
        <button
          onClick={() => setIsCreatingFolder(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FolderPlus className="w-4 h-4" />
          New Folder
        </button>
      </div>

      {selectedClips.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedClips.length} clip{selectedClips.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onBatchEdit(selectedClips)}
                className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
              >
                Edit Selected
              </button>
              <button
                onClick={() => onDeleteClips(selectedClips)}
                className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedClips([])}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreatingFolder && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              autoFocus
            />
            <button
              onClick={createFolder}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsCreatingFolder(false);
                setNewFolderName('');
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {folders.map(folder => {
          const folderClips = clips.filter(clip => clip.folder_id === folder.id);
          const isExpanded = expandedFolders.has(folder.id);

          return (
            <div key={folder.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => toggleFolderExpansion(folder.id)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Folder className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                  </button>

                  {editingFolderId === folder.id ? (
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded"
                        autoFocus
                      />
                      <button
                        onClick={() => updateFolder(folder.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingFolderId(null);
                          setEditingFolderName('');
                        }}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-gray-800">{folder.name}</span>
                      <span className="text-sm text-gray-500">({folderClips.length})</span>
                    </>
                  )}
                </div>

                {editingFolderId !== folder.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingFolderId(folder.id);
                        setEditingFolderName(folder.name);
                      }}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteFolder(folder.id)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="p-3 space-y-2">
                  {folderClips.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No clips in this folder</p>
                  ) : (
                    folderClips.map(clip => (
                      <div
                        key={clip.id}
                        className="flex items-center gap-3 p-3 bg-white rounded hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedClips.includes(clip.id)}
                          onChange={() => toggleClipSelection(clip.id)}
                          className="cursor-pointer"
                        />
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => onClipSelect(clip.id)}
                        >
                          <h4 className="font-medium text-gray-800">{clip.title}</h4>
                          <p className="text-sm text-gray-500">
                            {formatDuration(clip.start_time, clip.end_time)} • {clip.aspect_ratio}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {unorganizedClips.length > 0 && (
          <div className="border border-gray-200 rounded-lg">
            <div className="bg-gray-50 p-3">
              <span className="font-medium text-gray-800">Unorganized Clips ({unorganizedClips.length})</span>
            </div>
            <div className="p-3 space-y-2">
              {unorganizedClips.map(clip => (
                <div
                  key={clip.id}
                  className="flex items-center gap-3 p-3 bg-white rounded hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedClips.includes(clip.id)}
                    onChange={() => toggleClipSelection(clip.id)}
                    className="cursor-pointer"
                  />
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onClipSelect(clip.id)}
                  >
                    <h4 className="font-medium text-gray-800">{clip.title}</h4>
                    <p className="text-sm text-gray-500">
                      {formatDuration(clip.start_time, clip.end_time)} • {clip.aspect_ratio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
