import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/presetDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Search, Download, Share, Trash2, Filter, Calendar, Image, Video, SortAsc, SortDesc, ZoomIn, Folder, Plus, Upload, ChevronRight, Home, ArrowLeft, Pencil, Menu, X, File, User, RefreshCcw, Edit, BookOpen, Wand2, Eye, Monitor, Camera, Clock, Settings, Zap, Target, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';

// Interface for preset data from API
interface PresetData {
  id: number;
  created_at: string;
  user_id: string;
  jsonjob: {
    lora: boolean;
    noAI: boolean;
    seed: number;
    task: string;
    model: any;
    scene: {
      pose: string;
      clothes: string;
      framing: string;
      rotation: string;
      scene_setting: string;
      lighting_preset: string;
    };
    engine: string;
    format: string;
    prompt: string;
    quality: string;
    guidance: number;
    lora_strength: number;
    nsfw_strength: number;
    usePromptOnly: boolean;
    negative_prompt: string;
    number_of_images: number;
  };
  name: string;
  image_name: string;
  route: string;
  rating?: number;
  favorite?: boolean;
  // Computed properties added during transformation
  hasModel?: boolean;
  hasScene?: boolean;
  sceneCount?: number;
  createdDate?: string;
  createdTime?: string;
  imageUrl?: string | null;
}

// Interface for folder structure
interface FolderStructure {
  name: string;
  path: string;
  children: FolderStructure[];
  isFolder: boolean;
}

// Interface for folder data from API
interface FolderData {
  Key: string;
}

export default function PresetsManager({ onClose, onApplyPreset }: {
  onClose: () => void;
  onApplyPreset?: (preset: PresetData) => void;
}) {
  const userData = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const [presets, setPresets] = useState<PresetData[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPreset, setSelectedPreset] = useState<PresetData | null>(null);
  const [detailedPresetModal, setDetailedPresetModal] = useState<{ open: boolean; preset: PresetData | null }>({ open: false, preset: null });
  const [loadingInfluencer, setLoadingInfluencer] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [influencerData, setInfluencerData] = useState<any>(null);
  // Folder management state
  const [currentPath, setCurrentPath] = useState<string>('');
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);

  // New folder modal state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // --- Folder context menu and copy/cut state ---
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderPath: string } | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState<string>('');
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<0 | 1 | 2>(0); // 0=none, 1=copy, 2=cut
  const [copiedPath, setCopiedPath] = useState<string>('');
  const [isPasting, setIsPasting] = useState(false);
  const [fileCopyState, setFileCopyState] = useState(0); // 0: none, 1: copy, 2: cut
  const [copiedFile, setCopiedFile] = useState<any | null>(null);
  const [isPastingFile, setIsPastingFile] = useState(false);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null);

  // --- File context menu and operations ---
  const [fileContextMenu, setFileContextMenu] = useState<{ x: number; y: number; preset: PresetData } | null>(null);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState<string>('');
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [pendingRenameData, setPendingRenameData] = useState<any>(null);
  const [conflictRenameFilename, setConflictRenameFilename] = useState('');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [showNewFilenameDialog, setShowNewFilenameDialog] = useState(false);

  // --- Confirmation modal for preset usage ---
  const [usePresetConfirmation, setUsePresetConfirmation] = useState<{ open: boolean; preset: PresetData | null }>({ open: false, preset: null });

  // --- Filename conflict handling for paste operations ---
  const [filenameConflictModal, setFilenameConflictModal] = useState<{ open: boolean; originalName: string; suggestedName: string }>({ open: false, originalName: '', suggestedName: '' });
  const [conflictNewFilename, setConflictNewFilename] = useState<string>('');
  const [pendingPasteOperation, setPendingPasteOperation] = useState<{ operation: 'copy' | 'move'; preset: PresetData; destRoute: string } | null>(null);

  // --- Folder copy/cut handlers ---
  const handleCopy = (folderPath: string) => {
    setCopyState(1);
    setCopiedPath(folderPath);
    setContextMenu(null);
    toast.success(`Folder "${folderPath.split('/').pop()}" copied`);
  };
  const handleCut = (folderPath: string) => {
    setCopyState(2);
    setCopiedPath(folderPath);
    setContextMenu(null);
    toast.success(`Folder "${folderPath.split('/').pop()}" cut`);
  };
  const handlePaste = async () => {
    if (copyState === 0 || !copiedPath) {
      toast.error('No folder to paste');
      return;
    }

    // Prevent pasting into the same folder or its subfolders
    if (currentPath === copiedPath ||
      (currentPath && copiedPath.startsWith(currentPath + '/')) ||
      (currentPath && currentPath.startsWith(copiedPath + '/'))) {
      toast.error('Cannot paste into the same folder or a subfolder of the source folder');
      return;
    }

    setIsPasting(true);

    try {
      const sourceFolderName = copiedPath.split('/').pop() || '';
      const operationType = copyState === 1 ? 'copying' : 'moving';

      toast.info(`${operationType.charAt(0).toUpperCase() + operationType.slice(1)} folder...`, {
        description: `Processing "${sourceFolderName}" - this may take a moment depending on the folder contents`,
        duration: 5000
      });

      console.log('currentPath', currentPath);
      console.log('copiedPath', copiedPath);
      console.log('sourceFolderName', sourceFolderName);

      const newFolderName = sourceFolderName;
      const targetPath = currentPath ? `${currentPath}/${newFolderName}` : newFolderName;

      // Create the new folder
      const createResponse = await fetch('https://api.nymia.ai/v1/createfolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          parentfolder: `presets/${currentPath ? currentPath + '/' : ''}`,
          folder: newFolderName
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create new folder');
      }

      console.log('New folder created successfully');

      // Get all files from the source folder
      const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `presets/${copiedPath}`
        })
      });

      if (getFilesResponse.ok) {
        const files = await getFilesResponse.json();
        console.log('Files to copy:', files);

        // Copy all files to the new folder
        if (files && files.length > 0 && files[0].Key) {
          const copyPromises = files.map(async (file: any) => {
            console.log("File:", file);
            const fileKey = file.Key;
            const re = new RegExp(`^.*?presets/${copiedPath}/`);
            const fileName = fileKey.replace(re, "");
            console.log("File Name:", fileName);

            // Check if file already exists in destination folder
            const fileExistsInDest = await checkFileExistsInFolder(fileName, targetPath);
            if (fileExistsInDest) {
              console.warn(`File "${fileName}" already exists in destination folder. Skipping.`);
              toast.warning(`File "${fileName}" already exists in destination. Skipped.`, {
                duration: 3000
              });
              return; // Skip this file
            }

            const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer WeInfl3nc3withAI'
              },
              body: JSON.stringify({
                user: userData.id,
                source: `presets/${copiedPath}/${fileName}`,
                destination: `presets/${targetPath}/${fileName}`
              })
            });

            if (!copyResponse.ok) {
              console.error(`Failed to copy file: ${fileName}`);
              toast.error(`Failed to copy file: ${fileName}`);
            } else {
              console.log(`Successfully copied file: ${fileName}`);
            }
          });

          await Promise.all(copyPromises);
        }
      }

      // If it was a cut operation, delete the original folder
      if (copyState === 2) {
        try {
          const deleteResponse = await fetch('https://api.nymia.ai/v1/deletefolder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              folder: `presets/${copiedPath}`
            })
          });

          if (!deleteResponse.ok) {
            console.error('Failed to delete original folder after move');
            toast.error('Folder copied but failed to delete original folder');
          } else {
            console.log('Successfully deleted original folder after move');
          }
        } catch (error) {
          console.error('Error deleting original folder:', error);
          toast.error('Folder copied but failed to delete original folder');
        }
      }

      // Refresh folders and presets
      await Promise.all([fetchFolders(), fetchPresets()]);

      setCopyState(0);
      setCopiedPath(null);
      setIsPasting(false);

      const operationText = copyState === 1 ? 'copied' : 'moved';
      toast.success(`Folder "${sourceFolderName}" ${operationText} successfully`);

    } catch (error) {
      console.error('Error pasting folder:', error);
      toast.error('Failed to paste folder. Please try again.');
      setIsPasting(false);
    }
  };

  const checkFileExistsInFolder = async (fileName: string, folderPath: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `presets/${folderPath}`
        })
      });

      if (!response.ok) {
        return false;
      }

      const files = await response.json();
      return files.some((file: any) => file.Key && file.Key.includes(fileName));
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  };

  const handleFilePaste = async () => {
    if (fileCopyState === 0 || !copiedFile) {
      toast.error('No file to paste');
      return;
    }

    setIsPastingFile(true);

    try {
      const operationType = fileCopyState === 1 ? 'copying' : 'moving';
      const fileName = copiedFile.name;
      const sourceRoute = copiedFile.route;

      // Fix the destination route construction
      const destRoute = currentPath === '' ? '' : currentPath;

      // Check if file already exists in destination
      const fileExists = presets.some(p => p.name === fileName && p.route === destRoute);
      if (fileExists) {
        toast.warning(`Preset "${fileName}" already exists in this location. Skipping paste operation.`, {
          description: 'Please rename the existing preset or choose a different location.'
        });
        return;
      }

      if (fileCopyState === 1) {

        const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            sourcefilename: `presets/${copiedFile.route}/${copiedFile.image_name}`,
            destinationfilename: `presets/${destRoute}/${copiedFile.image_name}`
          })
        });

        if (!copyResponse.ok) {
          throw new Error('Failed to copy file');
        }

        // Copy operation - create a new preset with the same data but different route
        const newPresetData = {
          user_id: copiedFile.user_id,
          jsonjob: copiedFile.jsonjob,
          name: fileName,
          image_name: copiedFile.image_name,
          route: destRoute,
          rating: copiedFile.rating || 0,
          favorite: copiedFile.favorite || false
        };

        const response = await fetch('https://db.nymia.ai/rest/v1/presets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify(newPresetData)
        });

        if (!response.ok) {
          throw new Error('Failed to copy preset');
        }

        fetchPresets();

        toast.success(`Preset "${fileName}" copied successfully`);

      } else {
        // Move operation - update the route of the existing preset
        const response = await fetch(`https://db.nymia.ai/rest/v1/presets?id=eq.${copiedFile.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            route: destRoute
          })
        });

        if (!response.ok) {
          throw new Error('Failed to move preset');
        }

        await fetch('https://api.nymia.ai/v1/copyfile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            sourcefilename: `presets/${copiedFile.route}/${copiedFile.image_name}`,
            destinationfilename: `presets/${destRoute}/${copiedFile.image_name}`
          })
        });

        await fetch('https://api.nymia.ai/v1/deletefile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer WeInfl3nc3withAI'
          },
          body: JSON.stringify({
            user: userData.id,
            filename: `presets/${copiedFile.route}/${copiedFile.image_name}`
          })
        });

        // Update local state
        setPresets(prev => prev.map(preset =>
          preset.id === copiedFile.id
            ? { ...preset, route: destRoute }
            : preset
        ));

        toast.success(`Preset "${fileName}" moved successfully`);
      }

      // Clear clipboard
      setFileCopyState(0);
      setCopiedFile(null);

    } catch (error) {
      console.error('Error pasting file:', error);
      const operationType = fileCopyState === 1 ? 'copy' : 'move';
      toast.error(`Failed to ${operationType} preset: ${error.message}`);
    } finally {
      setIsPastingFile(false);
    }
  };

  const handleDeleteFolder = async (folderPath: string) => {
    try {
      toast.info('Deleting folder...', {
        description: 'This may take a moment depending on the folder contents'
      });

      // Delete folder from storage
      const response = await fetch('https://api.nymia.ai/v1/deletefolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `presets/${folderPath}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }

      // Refresh folders from API
      await fetchFolders();

      // If we're currently in the deleted folder or one of its subfolders, navigate to parent
      if (currentPath === folderPath || currentPath.startsWith(folderPath + '/')) {
        const pathParts = folderPath.split('/');
        pathParts.pop();
        const parentPath = pathParts.join('/');
        setCurrentPath(parentPath);
      }

      setContextMenu(null);
      toast.success(`Folder "${folderPath.split('/').pop()}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder. Please try again.');
      setContextMenu(null);
    }
  };

  // --- Folder rename functionality ---
  const handleFolderRename = async (oldPath: string, newName: string) => {
    try {
      // Get the old folder name from the path
      const oldFolderName = oldPath.split('/').pop() || '';
      const enNewName = encodeName(newName);

      // Check if the new name is the same as the old name
      if (oldFolderName === enNewName) {
        console.log('Folder name unchanged, cancelling rename operation');
        setEditingFolder(null);
        setEditingFolderName('');
        return;
      }

      // Show warning toast before starting the operation
      toast.warning('Folder rename in progress...', {
        description: 'This operation may take some time depending on the folder contents. Please wait.',
        duration: 3000
      });

      // Set loading state
      setRenamingFolder(oldPath);
      toast.info('Renaming folder...', {
        description: 'This may take a moment depending on the folder contents'
      });

      console.log('Renaming folder:', oldPath, 'to:', enNewName);

      // Get the parent path and construct the new path
      const pathParts = oldPath.split('/');
      const oldFolderNameFromPath = pathParts.pop() || '';
      const parentPath = pathParts.join('/');
      const newPath = parentPath ? `${parentPath}/${enNewName}` : enNewName;

      console.log('Parent path:', parentPath);
      console.log('New path:', newPath);

      // Step 1: Create the new folder
      const createResponse = await fetch('https://api.nymia.ai/v1/createfolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          parentfolder: `presets/${parentPath ? parentPath + '/' : ''}`,
          folder: enNewName
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create new folder');
      }

      console.log('New folder created successfully');

      // Step 2: Get all files from the old folder
      const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `presets/${oldPath}`
        })
      });

      if (getFilesResponse.ok) {
        const files = await getFilesResponse.json();
        console.log('Files to copy:', files);

        // Step 3: Copy all files to the new folder
        if (files && files.length > 0 && files[0].Key) {
          const copyPromises = files.map(async (file: any) => {
            console.log("File:", file);
            const fileKey = file.Key;
            const re = new RegExp(`^.*?presets/${oldPath}/`);
            const fileName = fileKey.replace(re, "");
            console.log("File Name:", fileName);

            const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer WeInfl3nc3withAI'
              },
              body: JSON.stringify({
                user: userData.id,
                sourcefilename: `presets/${oldPath}/${fileName}`,
                destinationfilename: `presets/${newPath}/${fileName}`
              })
            });

            if (!copyResponse.ok) {
              console.warn(`Failed to copy file ${file}`);
              throw new Error(`Failed to copy file ${file}`);
            }
          });

          await Promise.all(copyPromises);
          console.log('All files copied successfully');
        }
      }

      // Step 4: Delete the old folder
      await handleDeleteFolder(oldPath);

      // Reset form
      setEditingFolder(null);
      setEditingFolderName('');
      setRenamingFolder(null);

      toast.success(`Folder renamed to "${newName}" successfully`);
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast.error('Failed to rename folder');
      setRenamingFolder(null);
      setEditingFolder(null);
      setEditingFolderName('');
    }
  };

  // --- Drag & drop state ---
  const handleDragStart = (e: React.DragEvent, folderPath: string) => {
    setDraggedFolder(folderPath);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedFolder(null);
    setDragOverFolder(null);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent, folderPath: string) => {
    e.preventDefault();
    if (draggedFolder && draggedFolder !== folderPath) {
      setDragOverFolder(folderPath);
    }
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolderPath: string) => {
    e.preventDefault();
    if (!draggedFolder || draggedFolder === targetFolderPath) {
      setDragOverFolder(null);
      return;
    }

    try {
      const sourceFolderName = draggedFolder.split('/').pop() || '';
      toast.info('Moving folder...', {
        description: `Processing "${sourceFolderName}" - this may take a moment`,
        duration: 5000
      });

      // Create new folder in destination
      const createResponse = await fetch('https://api.nymia.ai/v1/createfolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          parentfolder: `presets/${targetFolderPath ? targetFolderPath + '/' : ''}`,
          folder: sourceFolderName
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create new folder');
      }

      // Copy all files from source to destination
      const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `presets/${draggedFolder}`
        })
      });

      if (getFilesResponse.ok) {
        const files = await getFilesResponse.json();
        if (files && files.length > 0 && files[0].Key) {
          const copyPromises = files.map(async (file: any) => {
            const fileKey = file.Key;
            const re = new RegExp(`^.*?presets/${draggedFolder}/`);
            const fileName = fileKey.replace(re, "");

            const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer WeInfl3nc3withAI'
              },
              body: JSON.stringify({
                user: userData.id,
                sourcefilename: `presets/${draggedFolder}/${fileName}`,
                destinationfilename: `presets/${targetFolderPath ? targetFolderPath + '/' : ''}${sourceFolderName}/${fileName}`
              })
            });

            if (!copyResponse.ok) {
              console.warn(`Failed to copy file ${fileName}`);
            }
          });

          await Promise.all(copyPromises);
        }
      }

      // Delete the original folder
      await handleDeleteFolder(draggedFolder);

      // Refresh folders
      await fetchFolders();

      setDragOverFolder(null);
      toast.success(`Folder "${sourceFolderName}" moved successfully`);
    } catch (error) {
      console.error('Error moving folder:', error);
      toast.error('Failed to move folder');
      setDragOverFolder(null);
    }
  };

  // --- Context menu handler ---
  const handleContextMenu = (e: React.MouseEvent, folderPath: string) => {
    e.preventDefault();

    // Get the dialog element to calculate relative positioning
    const dialogElement = document.querySelector('[role="dialog"]') as HTMLElement;
    if (!dialogElement) {
      // Fallback to mouse coordinates if dialog not found
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        folderPath
      });
      return;
    }

    // Get dialog bounds
    const dialogRect = dialogElement.getBoundingClientRect();

    // Calculate position relative to dialog
    const relativeX = e.clientX - dialogRect.left;
    const relativeY = e.clientY - dialogRect.top;

    // Ensure menu doesn't go outside dialog bounds
    const menuWidth = 160; // min-w-[160px]
    const menuHeight = 200; // approximate height

    let finalX = relativeX;
    let finalY = relativeY;

    // Adjust if menu would go outside right edge
    if (relativeX + menuWidth > dialogRect.width) {
      finalX = relativeX - menuWidth;
    }

    // Adjust if menu would go outside bottom edge
    if (relativeY + menuHeight > dialogRect.height) {
      finalY = relativeY - menuHeight;
    }

    // Ensure menu doesn't go outside left/top edges
    finalX = Math.max(0, finalX);
    finalY = Math.max(0, finalY);

    setContextMenu({
      x: finalX,
      y: finalY,
      folderPath
    });
  };
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Helper functions for folder management
  const extractFolderName = (fullPath: string): string => {
    const match = fullPath.match(/presets\/(.+)/);
    return match ? match[1] : '';
  };

  const encodeName = (name: string): string => {
    return name.replace(/[^a-zA-Z0-9-_]/g, '_');
  };

  const decodeName = (name: string): string => {
    return name.replace(/_/g, ' ');
  };

  const buildFolderStructure = (folderData: FolderData[]): FolderStructure[] => {
    const folderMap = new Map<string, FolderStructure>();
    const rootFolders: FolderStructure[] = [];

    folderData.forEach(folder => {
      const extractedPath = extractFolderName(folder.Key);
      if (!extractedPath) return;

      const pathParts = extractedPath.split('/');
      let currentPath = '';

      pathParts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!folderMap.has(currentPath) && part !== '') {
          const folderStructure: FolderStructure = {
            name: part,
            path: currentPath,
            children: [],
            isFolder: true
          };

          folderMap.set(currentPath, folderStructure);

          if (parentPath) {
            const parent = folderMap.get(parentPath);
            if (parent) {
              parent.children.push(folderStructure);
            }
          } else {
            rootFolders.push(folderStructure);
          }
        }
      });
    });

    return rootFolders;
  };

  // Navigation functions
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
    // Reset context menus and editing states when navigating
    setFileContextMenu(null);
    setContextMenu(null);
    setEditingFile(null);
    setEditingFileName('');
  };

  const navigateToParent = () => {
    if (currentPath) {
      const parentPath = currentPath.split('/').slice(0, -1).join('/');
      setCurrentPath(parentPath);
      // Reset context menus and editing states when navigating
      setFileContextMenu(null);
      setContextMenu(null);
      setEditingFile(null);
      setEditingFileName('');
    }
  };

  const navigateToHome = () => {
    setCurrentPath('');
    // Reset context menus and editing states when navigating
    setFileContextMenu(null);
    setContextMenu(null);
    setEditingFile(null);
    setEditingFileName('');
  };

  const getBreadcrumbItems = () => {
    if (!currentPath) return [];

    const pathParts = currentPath.split('/');
    const breadcrumbs = [];
    let currentPathBuilt = '';

    pathParts.forEach((part, index) => {
      currentPathBuilt = currentPathBuilt ? `${currentPathBuilt}/${part}` : part;
      breadcrumbs.push({
        name: part,
        path: currentPathBuilt
      });
    });

    return breadcrumbs;
  };

  const getCurrentPathFolders = (): FolderStructure[] => {
    if (!currentPath) {
      return folderStructure;
    }

    const findFolder = (folders: FolderStructure[], path: string): FolderStructure | null => {
      for (const folder of folders) {
        if (folder.path === path) {
          return folder;
        }
        if (folder.children.length > 0) {
          const found = findFolder(folder.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    const currentFolder = findFolder(folderStructure, currentPath);
    return currentFolder ? currentFolder.children : [];
  };

  const getAllSubfolders = async (folderPath: string): Promise<string[]> => {
    try {
      const response = await fetch('https://api.nymia.ai/v1/getfoldernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `presets/${folderPath}`
        })
      });

      if (!response.ok) {
        return [];
      }

      const folders = await response.json();
      const subfolders: string[] = [];

      for (const folder of folders) {
        const extractedPath = extractFolderName(folder.Key);
        if (extractedPath && extractedPath.startsWith(folderPath + '/')) {
          subfolders.push(extractedPath);
          // Recursively get subfolders of this subfolder
          const nestedSubfolders = await getAllSubfolders(extractedPath);
          subfolders.push(...nestedSubfolders);
        }
      }

      return subfolders;
    } catch (error) {
      console.error('Error getting subfolders:', error);
      return [];
    }
  };

  // Fetch folders from API
  const fetchFolders = async () => {
    try {
      const response = await fetch('https://api.nymia.ai/v1/getfoldernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: "presets"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      const data = await response.json();
      setFolders(data);

      console.log(data);

      // Build folder structure
      const structure = buildFolderStructure(data);
      setFolderStructure(structure);

      // If no structure was built, create a fallback from the raw data
      if (structure.length === 0 && data.length > 0) {
        const fallbackFolders = data.map((folder: FolderData) => ({
          name: folder.Key || extractFolderName(folder.Key) || 'Unknown Folder',
          path: folder.Key || extractFolderName(folder.Key) || 'unknown',
          children: [],
          isFolder: true
        }));
        setFolderStructure(fallbackFolders);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      setFolders([]);
      setFolderStructure([]);
    }
  };

  // Fetch presets
  const fetchPresets = async () => {
    try {
      setPresetsLoading(true);

      const response = await fetch(`https://db.nymia.ai/rest/v1/presets?user_id=eq.${userData.id}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch presets');
      }

      const data: PresetData[] = await response.json();

      // Transform the data to add computed properties
      const transformedPresets = data.map(preset => {
        const createdDate = new Date(preset.created_at);
        const hasModel = preset.jsonjob?.model && Object.keys(preset.jsonjob.model).length > 0;
        const hasScene = preset.jsonjob?.scene && Object.keys(preset.jsonjob.scene).length > 0;
        const sceneCount = hasScene ? Object.keys(preset.jsonjob.scene).filter(key => preset.jsonjob.scene[key]).length : 0;

        // Generate image URL from image_name and route
        const presetImageUrl = preset.image_name ?
          `https://images.nymia.ai/cdn-cgi/image/w=400/${userData.id}/presets/${preset.route ? preset.route + '/' : ''}${preset.image_name}` :
          null;

        return {
          ...preset,
          hasModel,
          hasScene,
          sceneCount,
          createdDate: createdDate.toLocaleDateString(),
          createdTime: createdDate.toLocaleTimeString(),
          imageUrl: presetImageUrl
        };
      });

      setPresets(transformedPresets);
    } catch (error) {
      console.error('Error fetching presets:', error);
      setPresets([]);
    } finally {
      setPresetsLoading(false);
    }
  };

  // Handle create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    const enFolderName = encodeName(newFolderName);

    try {
      const folderPath = currentPath ? `${currentPath}/${enFolderName}` : enFolderName;

      // Create folder in storage
      const response = await fetch('https://api.nymia.ai/v1/createfolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          parentfolder: `presets/${currentPath ? currentPath + '/' : ''}`,
          folder: enFolderName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      // Add the new folder to the structure
      const newFolder: FolderStructure = {
        name: enFolderName,
        path: folderPath,
        children: [],
        isFolder: true
      };

      if (currentPath) {
        // Add to current folder's children
        setFolderStructure(prev => {
          const updated = [...prev];
          const updateFolder = (folders: FolderStructure[]): FolderStructure[] => {
            return folders.map(folder => {
              if (folder.path === currentPath) {
                return { ...folder, children: [...folder.children, newFolder] };
              }
              if (folder.children.length > 0) {
                return { ...folder, children: updateFolder(folder.children) };
              }
              return folder;
            });
          };
          return updateFolder(updated);
        });
      } else {
        // Add to root level
        setFolderStructure(prev => [...prev, newFolder]);
      }

      // Reset form
      setNewFolderName('');
      setShowNewFolderModal(false);

      toast.success(`Folder "${newFolderName}" created successfully`);
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  // Handle preset delete
  const handlePresetDelete = async (preset: PresetData) => {
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/presets?id=eq.${preset.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (response.ok) {
        setPresets(prev => prev.filter(p => p.id !== preset.id));
        toast.success(`Deleted preset: ${preset.name}`);
      } else {
        throw new Error('Failed to delete preset');
      }
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast.error('Failed to delete preset');
    }
  };

  // Handle apply preset
  const handleApplyPreset = (preset: PresetData) => {
    // Show confirmation modal
    setUsePresetConfirmation({ open: true, preset });
  };

  // Handle confirm preset usage
  const handleConfirmPresetUsage = (preset: PresetData) => {
    try {
      // Apply the preset using the callback if provided
      if (onApplyPreset) {
        onApplyPreset(preset);
      } else {
        // Fallback: dispatch a custom event for backward compatibility
        const presetApplyEvent = new CustomEvent('presetApplied', {
          detail: {
            preset: preset,
            jsonjob: preset.jsonjob
          }
        });
        window.dispatchEvent(presetApplyEvent);
      }

      toast.success(`Applied preset: ${preset.name}`);

      // Close both modals
      setUsePresetConfirmation({ open: false, preset: null });
      setDetailedPresetModal({ open: false, preset: null });
      onClose(); // Close the presets modal
    } catch (error) {
      console.error('Error applying preset:', error);
      toast.error('Failed to apply preset');
    }
  };

  // Handle view preset details
  const handleViewPresetDetails = (preset: PresetData) => {
    setDetailedPresetModal({ open: true, preset });

    // Fetch influencer data if model has an ID
    if (preset.jsonjob.model && preset.jsonjob.model.id) {
      fetchInfluencerData(preset.jsonjob.model.id);
    }
  };

  const fetchInfluencerData = async (influencerId: string) => {
    setLoadingInfluencer(true);
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/influencer?id=eq.${influencerId}`, {
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch influencer data');
      }

      const data = await response.json();
      console.log(data);
      if (data && data.length > 0) {
        setInfluencerData(data[0]);
      }
    } catch (error) {
      console.error('Error fetching influencer data:', error);
    } finally {
      setLoadingInfluencer(false);
    }
  };

  // Update rating for preset
  const updatePresetRating = async (presetId: number, rating: number) => {
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/presets?id=eq.${presetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          rating: rating
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update rating');
      }

      // Update local state
      setPresets(prev => prev.map(preset =>
        preset.id === presetId
          ? { ...preset, rating: rating }
          : preset
      ));

      // Update modal state if the preset is currently being viewed
      setDetailedPresetModal(prev =>
        prev.open && prev.preset?.id === presetId
          ? { ...prev, preset: { ...prev.preset, rating: rating } }
          : prev
      );

      toast.success(`Rating updated to ${rating} stars`);
    } catch (error) {
      console.error('Error updating rating:', error);
      toast.error('Failed to update rating');
    }
  };

  // Update favorite for preset
  const updatePresetFavorite = async (presetId: number, favorite: boolean) => {
    try {
      const response = await fetch(`https://db.nymia.ai/rest/v1/presets?id=eq.${presetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          favorite: favorite
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }

      // Update local state
      setPresets(prev => prev.map(preset =>
        preset.id === presetId
          ? { ...preset, favorite: favorite }
          : preset
      ));

      // Update modal state if the preset is currently being viewed
      setDetailedPresetModal(prev =>
        prev.open && prev.preset?.id === presetId
          ? { ...prev, preset: { ...prev.preset, favorite: favorite } }
          : prev
      );

      toast.success(favorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast.error('Failed to update favorite status');
    }
  };

  // --- File context menu handlers ---
  const handlePresetCopy = (preset: PresetData) => {
    setFileCopyState(1);
    setCopiedFile(preset);
    setFileContextMenu(null);
    toast.success(`Preset "${preset.name}" copied to clipboard`);
  };

  const handlePresetCut = (preset: PresetData) => {
    setFileCopyState(2);
    setCopiedFile(preset);
    setFileContextMenu(null);
    toast.success(`Preset "${preset.name}" cut to clipboard`);
  };

  const handlePresetRename = async (oldName: string, newName: string, preset: PresetData) => {
    if (!newName.trim()) {
      toast.error('Please enter a valid name');
      return;
    }

    setIsRenaming(true);
    const loadingToast = toast.loading('Renaming preset...');

    try {
      // Check if new name already exists in the same route
      const existingPreset = presets.find(p => p.name === newName && p.route === preset.route && p.id !== preset.id);
      if (existingPreset) {
        toast.error('A preset with this name already exists in this location');
        setIsRenaming(false);
        return;
      }

      // Update preset name in database
      const response = await fetch(`https://db.nymia.ai/rest/v1/presets?id=eq.${preset.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          name: newName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to rename preset');
      }

      // Update local state
      setPresets(prev => prev.map(p =>
        p.id === preset.id ? { ...p, name: newName } : p
      ));

      setEditingFile(null);
      setEditingFileName('');
      toast.success(`Preset renamed to "${newName}"`);
    } catch (error) {
      console.error('Error renaming preset:', error);
      toast.error('Failed to rename preset');
    } finally {
      setIsRenaming(false);
    }
  };

  const handlePresetContextMenu = (e: React.MouseEvent, preset: PresetData) => {
    e.preventDefault();
    e.stopPropagation();

    // Get the dialog container to calculate relative position
    const dialogContent = e.currentTarget.closest('[role="dialog"]') as HTMLElement;
    if (dialogContent) {
      const rect = dialogContent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Ensure the menu stays within the dialog bounds
      const menuWidth = 160;
      const menuHeight = 200;
      const adjustedX = Math.min(x, rect.width - menuWidth - 10);
      const adjustedY = Math.min(y, rect.height - menuHeight - 10);

      setFileContextMenu({ x: adjustedX, y: adjustedY, preset });
    } else {
      // Fallback to original positioning
      setFileContextMenu({ x: e.clientX, y: e.clientY, preset });
    }
  };

  // Close file context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setFileContextMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Filter and sort presets based on current route
  const filteredAndSortedPresets = presets
    .filter(preset => {
      // Route-based filtering
      const routeMatch = preset.route === `${currentPath}`;

      // Search filtering
      const searchMatch = !searchTerm ||
        preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (preset.jsonjob?.prompt && preset.jsonjob.prompt.toLowerCase().includes(searchTerm.toLowerCase()));

      return routeMatch && searchMatch;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'newest':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'oldest':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        default:
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Refresh presets
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchPresets(), fetchFolders()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchPresets();
    fetchFolders();
  }, [userData.id]);

  // Refetch presets when route changes
  useEffect(() => {
    if (currentPath !== undefined) {
      setPresetsLoading(true);
      fetchPresets().finally(() => {
        setPresetsLoading(false);
      });
    }
  }, [currentPath]);

  // --- Preset drag and drop state ---
  const [draggedPreset, setDraggedPreset] = useState<PresetData | null>(null);
  const [dragOverPreset, setDragOverPreset] = useState<string | null>(null);
  const [isDraggingPreset, setIsDraggingPreset] = useState(false);

  // --- Preset drag and drop handlers ---
  const handlePresetDragStart = (e: React.DragEvent, preset: PresetData) => {
    setDraggedPreset(preset);
    setIsDraggingPreset(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(preset));
  };

  const handlePresetDragEnd = () => {
    setDraggedPreset(null);
    setDragOverPreset(null);
    setIsDraggingPreset(false);
  };

  const handlePresetDragOver = (e: React.DragEvent, folderPath: string) => {
    e.preventDefault();
    if (draggedPreset && draggedPreset.route !== folderPath) {
      setDragOverPreset(folderPath);
    }
  };

  const handlePresetDragLeave = () => {
    setDragOverPreset(null);
  };

  const handlePresetDrop = async (e: React.DragEvent, targetFolderPath: string) => {
    e.preventDefault();
    if (!draggedPreset || draggedPreset.route === targetFolderPath) {
      setDragOverPreset(null);
      return;
    }

    try {
      toast.info('Moving preset...', {
        description: `Processing "${draggedPreset.name}" - this may take a moment`,
        duration: 3000
      });

      // Update the preset route in the database
      const response = await fetch(`https://db.nymia.ai/rest/v1/presets?id=eq.${draggedPreset.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          route: targetFolderPath
        })
      });

      if (!response.ok) {
        throw new Error('Failed to move preset');
      }

      // Copy the file to the new location
      await fetch('https://api.nymia.ai/v1/copyfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `presets/${draggedPreset.route}/${draggedPreset.image_name}`,
          destinationfilename: `presets/${targetFolderPath}/${draggedPreset.image_name}`
        })
      });

      // Delete the original file
      await fetch('https://api.nymia.ai/v1/deletefile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `presets/${draggedPreset.route}/${draggedPreset.image_name}`
        })
      });

      // Refresh presets
      await fetchPresets();

      setDragOverPreset(null);
      toast.success(`Preset "${draggedPreset.name}" moved successfully`);
    } catch (error) {
      console.error('Error moving preset:', error);
      toast.error('Failed to move preset');
      setDragOverPreset(null);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              My Presets
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Search and Sort Controls */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search presets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Folders Section */}
        <Card className="border-blue-500/20 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 mb-6">
          <CardHeader className="pt-5 pb-2">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${dragOverFolder === '' ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-100 dark:bg-blue-900/20 scale-105 shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  onDragOver={(e) => {
                    handleDragOver(e, '');
                    handlePresetDragOver(e, '');
                  }}
                  onDragLeave={() => {
                    handleDragLeave();
                    handlePresetDragLeave();
                  }}
                  onDrop={(e) => {
                    handleDrop(e, '');
                    handlePresetDrop(e, '');
                  }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={navigateToHome}
                    className="h-8 px-2 text-sm font-medium"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    Home
                  </Button>
                </div>
                {getBreadcrumbItems().map((item, index) => (
                  <div key={item.path} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <div
                      className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${dragOverFolder === item.path ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-100 dark:bg-blue-900/20 scale-105 shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      onDragOver={(e) => handleDragOver(e, item.path)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, item.path)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateToFolder(item.path)}
                        className="h-8 px-2 text-sm font-medium"
                      >
                        {decodeName(item.name)}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 transition-all duration-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 shadow-sm hover:shadow-md"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="w-4 h-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToParent}
                  className="flex items-center gap-1"
                  disabled={currentPath === ''}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={copyState > 0 ? "default" : "outline"}
                  size="sm"
                  onClick={handlePaste}
                  disabled={copyState === 0 || isPasting}
                  className={`flex items-center gap-1.5 transition-all duration-200 ${copyState > 0
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md'
                    : 'text-muted-foreground'
                    }`}
                >
                  {isPasting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {copyState === 1 ? 'Paste Copy' : copyState === 2 ? 'Paste Move' : 'Paste'}
                    </>
                  )}
                </Button>

                {/* File Paste Button */}
                <Button
                  variant={fileCopyState > 0 ? "default" : "outline"}
                  size="sm"
                  onClick={handleFilePaste}
                  disabled={fileCopyState === 0 || isPastingFile}
                  className={`flex items-center gap-1.5 transition-all duration-200 ${fileCopyState > 0
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md'
                    : 'text-muted-foreground'
                    }`}
                >
                  {isPastingFile ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      {fileCopyState === 1 ? 'Paste File Copy' : fileCopyState === 2 ? 'Paste File Move' : 'Paste File'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Folders Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {/* Folders */}
              {getCurrentPathFolders().map((folder) => (
                <div
                  key={folder.path}
                  className={`group cursor-pointer ${renamingFolder === folder.path ? 'opacity-60 pointer-events-none' : ''} ${dragOverFolder === folder.path ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-100 dark:bg-blue-900/20 scale-105 shadow-lg' : ''}`}
                  onDoubleClick={() => renamingFolder !== folder.path && navigateToFolder(folder.path)}
                  onContextMenu={(e) => renamingFolder !== folder.path && handleContextMenu(e, folder.path)}
                  draggable={renamingFolder !== folder.path}
                  onDragStart={(e) => handleDragStart(e, folder.path)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, folder.path)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, folder.path)}
                >
                  <div className={`flex flex-col items-center p-3 rounded-lg border-2 border-transparent transition-all duration-200 ${renamingFolder === folder.path
                    ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20'
                    : 'hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                    }`}>
                    <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 transition-transform duration-200 ${renamingFolder === folder.path ? 'animate-pulse' : 'group-hover:scale-110'
                      }`}>
                      {renamingFolder === folder.path ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : (
                        <Folder className="w-6 h-6 text-white" />
                      )}
                    </div>
                    {editingFolder === folder.path && renamingFolder !== folder.path ? (
                      <div className="w-full">
                        <Input
                          value={editingFolderName}
                          onChange={(e) => setEditingFolderName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleFolderRename(folder.path, editingFolderName);
                            } else if (e.key === 'Escape') {
                              setEditingFolder(null);
                              setEditingFolderName('');
                            }
                          }}
                          onBlur={() => handleFolderRename(folder.path, editingFolderName)}
                          className="text-xs h-6 text-center"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span className={`text-xs font-medium text-center transition-colors ${renamingFolder === folder.path
                        ? 'text-yellow-700 dark:text-yellow-300'
                        : 'text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                        }`}>
                        {decodeName(folder.name)}
                        {renamingFolder === folder.path && ' (Renaming...)'}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground mt-1">{folder.children.length} folders</span>
                  </div>
                </div>
              ))}

              {/* Add New Folder Button */}
              <div
                className="group cursor-pointer"
                onClick={() => setShowNewFolderModal(true)}
              >
                <div className="flex flex-col items-center p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    New Folder
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Context Menu for Folders */}
        {contextMenu && (
          <div
            className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => {
                // Navigate to folder
                navigateToFolder(contextMenu.folderPath);
                setContextMenu(null);
              }}
            >
              <Folder className="w-4 h-4" />
              Open
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => {
                setEditingFolder(contextMenu.folderPath);
                setEditingFolderName(decodeName(contextMenu.folderPath.split('/').pop() || ''));
                setContextMenu(null);
              }}
            >
              <Pencil className="w-4 h-4" />
              Rename
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => handleCopy(contextMenu.folderPath)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => handleCut(contextMenu.folderPath)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cut
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
              onClick={() => {
                // Delete folder functionality would go here
                handleDeleteFolder(contextMenu.folderPath);
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}

        {/* Presets Section */}
        <Card className="border-green-500/20 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 mb-6">
          <CardHeader className="pt-5 pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Presets
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Empty State */}
            {!presetsLoading && filteredAndSortedPresets.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No presets found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Create your first preset to get started.'}
                </p>
              </div>
            )}

            {/* Loading State */}
            {(presetsLoading) && (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Loading Presets</p>
                <p className="text-sm text-muted-foreground">Please wait while we fetch your presets...</p>
              </div>
            )}

            {/* Preset Cards */}
            {!presetsLoading && filteredAndSortedPresets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedPresets.map((preset) => (
                  <Card
                    key={preset.id}
                    className="group hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
                    onContextMenu={(e) => handlePresetContextMenu(e, preset)}
                    onDragStart={(e) => handlePresetDragStart(e, preset)}
                    onDragEnd={handlePresetDragEnd}
                    onDragOver={(e) => handlePresetDragOver(e, preset.route)}
                    onDragLeave={handlePresetDragLeave}
                    onDrop={(e) => handlePresetDrop(e, preset.route)}
                  >
                    {/* Top Row: Ratings and Favorite */}
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
                      {/* Professional Mark */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                      </div>

                      {/* Rating Stars */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 cursor-pointer hover:scale-110 transition-transform ${star <= (preset.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 24 24"
                            onClick={(e) => {
                              e.stopPropagation();
                              updatePresetRating(preset.id, star);
                            }}
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>

                      {/* Favorite Heart */}
                      <div>
                        {preset.favorite ? (
                          <div
                            className="bg-red-500 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              updatePresetFavorite(preset.id, false);
                            }}
                          >
                            <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          </div>
                        ) : (
                          <div
                            className="bg-gray-200 dark:bg-gray-700 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              updatePresetFavorite(preset.id, true);
                            }}
                          >
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preset Image */}
                    <div
                      className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 cursor-pointer"
                      onClick={() => handleViewPresetDetails(preset)}
                    >
                      {preset.imageUrl ? (
                        <img
                          src={preset.imageUrl}
                          alt={preset.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`${preset.imageUrl ? 'hidden' : ''} absolute inset-0 flex items-center justify-center`}>
                        <Image className="w-16 h-16 text-muted-foreground" />
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Eye className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                      </div>

                      {/* Scene Count Badge */}
                      {preset.hasScene && preset.sceneCount > 0 && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                          {preset.sceneCount} scene{preset.sceneCount !== 1 ? 's' : ''}
                        </div>
                      )}

                      {/* Quality Badge */}
                      {preset.jsonjob?.quality && (
                        <div className="absolute top-2 left-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm font-medium">
                          {preset.jsonjob.quality}
                        </div>
                      )}
                    </div>

                    {/* Preset Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {preset.name}
                        </h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {preset.createdDate} at {preset.createdTime}
                          </p>
                          {preset.jsonjob?.prompt && (
                            <p className="line-clamp-2 text-xs">
                              {preset.jsonjob.prompt.length > 50
                                ? `${preset.jsonjob.prompt.substring(0, 50)}...`
                                : preset.jsonjob.prompt
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyPreset(preset);
                          }}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          Use
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePresetDelete(preset);
                          }}
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Folder Modal */}
        <Dialog open={showNewFolderModal} onOpenChange={setShowNewFolderModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Folder Name</label>
                <Input
                  placeholder="Enter folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="mt-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newFolderName.trim()) {
                      handleCreateFolder();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewFolderModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                >
                  Create Folder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Detailed Preset Modal */}
        {detailedPresetModal.open && detailedPresetModal.preset && (
          <Dialog open={detailedPresetModal.open} onOpenChange={(open) => setDetailedPresetModal({ open, preset: null })}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="text-center">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Preset Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Header Section with Image and Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preset Image */}
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-lg">
                      {detailedPresetModal.preset.imageUrl ? (
                        <img
                          src={detailedPresetModal.preset.imageUrl}
                          alt={detailedPresetModal.preset.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`${detailedPresetModal.preset.imageUrl ? 'hidden' : ''} absolute inset-0 flex items-center justify-center`}>
                        <Image className="w-24 h-24 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Engine</div>
                        <div className="text-lg font-semibold">{detailedPresetModal.preset.jsonjob.engine}</div>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">Quality</div>
                        <div className="text-lg font-semibold">{detailedPresetModal.preset.jsonjob.quality}</div>
                      </div>
                    </div>
                    {/* Preset Information */}
                    <div className="space-y-6">
                      {/* Main Info Card */}
                      <Card className="border-2 border-gradient-to-r from-blue-500/20 to-purple-500/20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                        <CardHeader className="text-center pb-4">
                          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                            {detailedPresetModal.preset.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Creation Info */}
                          <div className="text-center space-y-2">
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>Created on {detailedPresetModal.preset.createdDate}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>At {detailedPresetModal.preset.createdTime}</span>
                            </div>
                          </div>

                          {/* Rating and Favorite */}
                          <div className="flex items-center justify-center gap-8 pt-4">
                            {/* Rating Stars */}
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-muted-foreground">Rating:</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-6 h-6 cursor-pointer hover:scale-110 transition-transform ${star <= (detailedPresetModal.preset.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    viewBox="0 0 24 24"
                                    onClick={() => updatePresetRating(detailedPresetModal.preset.id, star)}
                                  >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                ))}
                              </div>
                            </div>

                            {/* Favorite Heart */}
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-muted-foreground">Favorite:</span>
                              {detailedPresetModal.preset.favorite ? (
                                <div
                                  className="bg-red-500 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors shadow-md"
                                  onClick={() => updatePresetFavorite(detailedPresetModal.preset.id, false)}
                                >
                                  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                  </svg>
                                </div>
                              ) : (
                                <div
                                  className="bg-gray-200 dark:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-md"
                                  onClick={() => updatePresetFavorite(detailedPresetModal.preset.id, true)}
                                >
                                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApplyPreset(detailedPresetModal.preset)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Wand2 className="w-5 h-5 mr-2" />
                          Use Preset
                        </Button>
                        <Button
                          onClick={() => handlePresetDelete(detailedPresetModal.preset)}
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200"
                        >
                          <Trash2 className="w-5 h-5 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Influencer Information */}
                  {influencerData && (
                    <Card className="border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-rose-950/30 shadow-lg">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-purple-700 dark:text-purple-300">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <span>Influencer Profile</span>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Influencer Card */}
                        <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20">
                          <CardContent className="p-6 h-full">
                            <div className="flex flex-col justify-between h-full space-y-4">
                              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                                {influencerData.image_url ? (
                                  <img
                                    src={influencerData.image_url}
                                    alt={`${influencerData.name || 'Influencer'}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="flex flex-col w-full h-full items-center justify-center max-h-48 min-h-40">
                                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No image found</h3>
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors">
                                      {influencerData.name_first + ' ' + influencerData.name_last || 'Unknown Influencer'}
                                    </h3>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1 mb-3">
                                  <div className="flex text-sm text-muted-foreground flex-col">
                                    <span className="text-sm text-muted-foreground">
                                      {influencerData.sex ? influencerData.sex : 'Unknown Sex'} • {influencerData.age ? influencerData.age : 'Unknown Age'} • {influencerData.lifestyle ? influencerData.lifestyle : 'Unknown Lifestyle'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Detailed Information Grid */}
                              <div className="grid grid-cols-2 gap-3">

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2-green-500ounded-full"></div>
                                    <span className="text-xs font-medium text-muted-foreground">Cultural Background</span>
                                  </div>
                                  <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                    {influencerData?.cultural_background || 'N/A'}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500ounded-full"></div>
                                    <span className="text-xs font-medium text-muted-foreground">Hair Style</span>
                                  </div>
                                  <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                    {influencerData?.hair_style || 'N/A'}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2g-pink-500ounded-full"></div>
                                    <span className="text-xs font-medium text-muted-foreground">Face Shape</span>
                                  </div>
                                  <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                    {influencerData?.face_shape || 'N/A'}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-500ounded-full"></div>
                                    <span className="text-xs font-medium text-muted-foreground">Eye Shape</span>
                                  </div>
                                  <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                    {influencerData?.eye_shape || 'N/A'}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500ounded-full"></div>
                                    <span className="text-xs font-medium text-muted-foreground">Lip Style</span>
                                  </div>
                                  <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                    {influencerData?.lip_style || 'N/A'}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500ounded-full"></div>
                                    <span className="text-xs font-medium text-muted-foreground">Nose Style</span>
                                  </div>
                                  <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                    {influencerData?.nose_style || 'N/A'}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2g-teal-500ounded-full"></div>
                                    <span className="text-xs font-medium text-muted-foreground">Skin Tone</span>
                                  </div>
                                  <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                    {influencerData?.skin_tone || 'N/A'}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2g-cyan-500ounded-full"></div>
                                    <span className="text-xs font-medium text-muted-foreground">Body Type</span>
                                  </div>
                                  <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                    {influencerData?.body_type || 'N/A'}
                                  </p>
                                </div>

                                {/* Loading State */}
                                {loadingInfluencer && (
                                  <div className="flex items-center justify-center py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                      <span className="text-sm text-muted-foreground">Loading influencer data...</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Detailed Configuration Information */}
                <div className="space-y-6">
                  {/* Scene Settings */}
                  {detailedPresetModal.preset.jsonjob.scene && (
                    <Card className="border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-green-700 dark:text-green-300">
                          <Camera className="w-5 h-5" />
                          Scene Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {detailedPresetModal.preset.jsonjob.scene.pose && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Pose</label>
                              <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.scene.pose}</p>
                            </div>
                          )}
                          {detailedPresetModal.preset.jsonjob.scene.clothes && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Clothes</label>
                              <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.scene.clothes}</p>
                            </div>
                          )}
                          {detailedPresetModal.preset.jsonjob.scene.framing && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Framing</label>
                              <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.scene.framing}</p>
                            </div>
                          )}
                          {detailedPresetModal.preset.jsonjob.scene.rotation && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Rotation</label>
                              <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.scene.rotation}</p>
                            </div>
                          )}
                          {detailedPresetModal.preset.jsonjob.scene.scene_setting && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Scene Setting</label>
                              <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.scene.scene_setting}</p>
                            </div>
                          )}
                          {detailedPresetModal.preset.jsonjob.scene.lighting_preset && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Lighting</label>
                              <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.scene.lighting_preset}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Basic Settings */}
                  <Card className="border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg text-blue-700 dark:text-blue-300">
                        <Settings className="w-5 h-5" />
                        Basic Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Task</label>
                          <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.task}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Format</label>
                          <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.format}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Quality</label>
                          <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.quality}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Engine</label>
                          <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.engine}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Number of Images</label>
                          <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.number_of_images}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Seed</label>
                          <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.seed}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Advanced Settings */}
                  <Card className="border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg text-purple-700 dark:text-purple-300">
                        <Zap className="w-5 h-5" />
                        Advanced Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Guidance Scale</label>
                          <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.guidance}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">LoRA Strength</label>
                          <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.lora_strength}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">NSFW Strength</label>
                          <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.nsfw_strength}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">LoRA Enabled</label>
                          <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.lora ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">No AI</label>
                          <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.noAI ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Prompt Only</label>
                          <p className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border">{detailedPresetModal.preset.jsonjob.usePromptOnly ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Prompts */}
                  {(detailedPresetModal.preset.jsonjob?.prompt || detailedPresetModal.preset.jsonjob?.negative_prompt) && (
                    <Card className="border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50/50 to-yellow-50/50 dark:from-orange-950/20 dark:to-yellow-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-orange-700 dark:text-orange-300">
                          <Pencil className="w-5 h-5" />
                          Prompts
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {detailedPresetModal.preset.jsonjob.prompt && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Positive Prompt</label>
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                              <p className="text-sm leading-relaxed">{detailedPresetModal.preset.jsonjob.prompt}</p>
                            </div>
                          </div>
                        )}
                        {detailedPresetModal.preset.jsonjob.negative_prompt && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Negative Prompt</label>
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                              <p className="text-sm leading-relaxed">{detailedPresetModal.preset.jsonjob.negative_prompt}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* File Context Menu */}
        {fileContextMenu && (
          <div
            className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]"
            style={{ left: fileContextMenu.x, top: fileContextMenu.y }}
          >
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => {
                setDetailedPresetModal({ open: true, preset: fileContextMenu.preset });
                setFileContextMenu(null);
              }}
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => {
                setEditingFile(fileContextMenu.preset.name);
                setEditingFileName(fileContextMenu.preset.name);
                setFileContextMenu(null);
              }}
            >
              <Pencil className="w-4 h-4" />
              Rename
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => handlePresetCopy(fileContextMenu.preset)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => handlePresetCut(fileContextMenu.preset)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cut
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => handleApplyPreset(fileContextMenu.preset)}
            >
              <Wand2 className="w-4 h-4" />
              Use
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
              onClick={() => {
                handlePresetDelete(fileContextMenu.preset);
                setFileContextMenu(null);
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}

        {/* Rename Dialog */}
        {editingFile && (
          <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename Preset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">New Name</label>
                  <Input
                    placeholder="Enter new name"
                    value={editingFileName}
                    onChange={(e) => setEditingFileName(e.target.value)}
                    className="mt-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && editingFileName.trim()) {
                        const preset = presets.find(p => p.name === editingFile);
                        if (preset) {
                          handlePresetRename(editingFile, editingFileName, preset);
                        }
                      }
                    }}
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingFile(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const preset = presets.find(p => p.name === editingFile);
                      if (preset) {
                        handlePresetRename(editingFile, editingFileName, preset);
                      }
                    }}
                    disabled={!editingFileName.trim() || isRenaming}
                  >
                    {isRenaming ? 'Renaming...' : 'Rename'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Use Preset Confirmation Modal */}
        {usePresetConfirmation.open && usePresetConfirmation.preset && (
          <Dialog open={usePresetConfirmation.open} onOpenChange={() => setUsePresetConfirmation({ open: false, preset: null })}>
            <DialogContent className="max-w-md">
              <DialogHeader className="text-center">
                <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold">
                  <Wand2 className="w-6 h-6 text-green-600" />
                  Use Preset
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 text-center">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Apply "{usePresetConfirmation.preset.name}"?
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This will apply all the preset settings to your current form.
                    <span className="font-semibold text-orange-600 dark:text-orange-400"> All your current selections will be reset</span> and replaced with the preset configuration.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                        What will be applied:
                      </p>
                      <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Task, format, and quality settings</li>
                        <li>• Advanced parameters (guidance, LoRA, etc.)</li>
                        <li>• Scene configuration (pose, clothes, framing)</li>
                        <li>• Positive and negative prompts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setUsePresetConfirmation({ open: false, preset: null })}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleConfirmPresetUsage(usePresetConfirmation.preset)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Apply Preset
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
} 