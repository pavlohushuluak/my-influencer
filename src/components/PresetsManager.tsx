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
import { Star, Search, Download, Share, Trash2, Filter, Calendar, Image, Video, SortAsc, SortDesc, ZoomIn, Folder, Plus, Upload, ChevronRight, Home, ArrowLeft, Pencil, Menu, X, File, User, RefreshCcw, Edit, BookOpen, Wand2, Eye, Monitor, Camera } from 'lucide-react';
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

export default function PresetsManager({ onClose }: { onClose: () => void }) {
  const userData = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const [presets, setPresets] = useState<PresetData[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPreset, setSelectedPreset] = useState<PresetData | null>(null);
  const [detailedPresetModal, setDetailedPresetModal] = useState<{ open: boolean; preset: PresetData | null }>({ open: false, preset: null });
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Folder management state
  const [currentPath, setCurrentPath] = useState<string>('');
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);

  // New folder modal state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // --- Folder context menu and copy/cut state ---
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderPath: string } | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState<string>('');
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<0|1|2>(0); // 0=none, 1=copy, 2=cut
  const [copiedPath, setCopiedPath] = useState<string>('');
  const [isPasting, setIsPasting] = useState(false);
  const [fileCopyState, setFileCopyState] = useState(0); // 0: none, 1: copy, 2: cut
  const [copiedFile, setCopiedFile] = useState<any | null>(null);
  const [isPastingFile, setIsPastingFile] = useState(false);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null);

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

    if (currentPath === copiedPath || copiedPath.includes(currentPath) || copiedPath.includes(currentPath + '/') || copiedPath.includes(currentPath + '/presets') || currentPath === 'presets') {
      toast.error('Cannot paste into the same folder or a subfolder of the same folder');
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
      console.log('copiedPath.split(/).pop()', copiedPath.split('/').pop() || '');

      const newFolderName = copiedPath.split('/').pop() || '';

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

      console.log('createResponse', createResponse);

      if (!createResponse.ok) {
        throw new Error('Failed to create new folder');
      }

      console.log('New folder created successfully');

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

        // Step 3: Copy all files to the new folder
        if (files && files.length > 0 && files[0].Key) {
          const copyPromises = files.map(async (file: any) => {
            console.log("File:", file);
            const fileKey = file.Key;
            const re = new RegExp(`^.*?presets/${copiedPath}/`);
            const fileName = fileKey.replace(re, "");
            console.log("File Name:", fileName);

            // Check if file already exists in destination folder
            const fileExistsInDest = await checkFileExistsInFolder(fileName, `${currentPath}/${newFolderName}`);
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
                destination: `presets/${currentPath}/${newFolderName}/${fileName}`
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

      // Step 4: If it was a cut operation, delete the original folder
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

      // Step 5: Refresh folders and presets
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
      const fileName = copiedFile.system_filename;
      const operationType = fileCopyState === 1 ? 'copying' : 'moving';

      toast.info(`${operationType.charAt(0).toUpperCase() + operationType.slice(1)} file...`, {
        description: `Processing "${fileName}"`,
        duration: 3000
      });

      // Check if file already exists in destination
      const fileExistsInDest = await checkFileExistsInFolder(fileName, currentPath);
      if (fileExistsInDest) {
        toast.error(`File "${fileName}" already exists in this folder`);
        setIsPastingFile(false);
        return;
      }

      const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          source: `presets/${copiedFile.route}/${fileName}`,
          destination: `presets/${currentPath}/${fileName}`
        })
      });

      if (!copyResponse.ok) {
        throw new Error('Failed to copy file');
      }

      // If it was a cut operation, delete the original file
      if (fileCopyState === 2) {
        try {
          const deleteResponse = await fetch('https://api.nymia.ai/v1/deletefile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              file: `presets/${copiedFile.route}/${fileName}`
            })
          });

          if (!deleteResponse.ok) {
            console.error('Failed to delete original file after move');
            toast.error('File copied but failed to delete original file');
          }
        } catch (error) {
          console.error('Error deleting original file:', error);
          toast.error('File copied but failed to delete original file');
        }
      }

      // Refresh presets
      await fetchPresets();

      setFileCopyState(0);
      setCopiedFile(null);
      setIsPastingFile(false);

      const operationText = fileCopyState === 1 ? 'copied' : 'moved';
      toast.success(`File "${fileName}" ${operationText} successfully`);

    } catch (error) {
      console.error('Error pasting file:', error);
      toast.error('Failed to paste file. Please try again.');
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
  };

  const navigateToParent = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const parentPath = pathParts.join('/');
    setCurrentPath(parentPath);
  };

  const navigateToHome = () => {
    setCurrentPath('');
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
      setFoldersLoading(true);
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
    } finally {
      setFoldersLoading(false);
    }
  };

  // Fetch presets
  const fetchPresets = async () => {
    try {
      setPresetsLoading(true);
      const response = await fetch('https://db.nymia.ai/rest/v1/presets', {
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
        
        // Generate image URL from image_name
        const imageUrl = preset.image_name ? `https://api.nymia.ai/v1/getfile?user=${userData.id}&filename=presets/${preset.image_name}` : null;

        return {
          ...preset,
          hasModel,
          hasScene,
          sceneCount,
          createdDate: createdDate.toLocaleDateString(),
          createdTime: createdDate.toLocaleTimeString(),
          imageUrl
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
    // This would apply the preset to the main form
    // You'll need to implement this based on your form structure
    console.log('Applying preset:', preset);
    toast.success(`Applied preset: ${preset.name}`);
  };

  // Handle view preset details
  const handleViewPresetDetails = (preset: PresetData) => {
    setDetailedPresetModal({ open: true, preset });
  };

  // Filter and sort presets
  const filteredAndSortedPresets = presets
    .filter(preset => {
      const searchMatch = !searchTerm ||
        preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (preset.jsonjob?.prompt && preset.jsonjob.prompt.toLowerCase().includes(searchTerm.toLowerCase()));
      return searchMatch;
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
                  onDragOver={(e) => handleDragOver(e, '')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, '')}
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
                  disabled={copyState === 0 || currentPath === '' || isPasting}
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
                  disabled={fileCopyState === 0 || isPastingFile || currentPath === ''}
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
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Presets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Presets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Presets */}
              {filteredAndSortedPresets.map((preset) => (
            <Card 
              key={preset.id} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer relative"
            >
              <CardContent className="p-4">
                {/* Preset Image */}
                <div className="relative mb-4 aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                  {preset.imageUrl ? (
                    <img
                      src={preset.imageUrl}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`${preset.imageUrl ? 'hidden' : ''} absolute inset-0 flex items-center justify-center`}>
                    <Image className="w-12 h-12 text-muted-foreground" />
                  </div>
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyPreset(preset);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Wand2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPresetDetails(preset);
                      }}
                      variant="outline"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePresetDelete(preset);
                      }}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Preset Info */}
                <div className="space-y-2">
                  <div>
                    <h3 className="font-semibold text-lg mb-1 truncate">{preset.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created {preset.createdDate} at {preset.createdTime}
                    </p>
                  </div>

                  {/* Preset Details */}
                  <div className="space-y-2">
                    {preset.hasModel && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="text-muted-foreground">
                          Model configured
                        </span>
                      </div>
                    )}
                    
                    {preset.sceneCount > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Camera className="w-4 h-4 text-green-500" />
                        <span className="text-muted-foreground">
                          {preset.sceneCount} scene settings
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {!presetsLoading && !foldersLoading && filteredAndSortedPresets.length === 0 && getCurrentPathFolders().length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No presets found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'Create your first preset to get started.'}
            </p>
          </div>
        )}

        {/* Loading State */}
        {(presetsLoading || foldersLoading) && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading presets...</p>
          </div>
        )}

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
          <Dialog open={detailedPresetModal.open} onOpenChange={() => setDetailedPresetModal({ open: false, preset: null })}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Preset Details: {detailedPresetModal.preset.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preset Image */}
                {detailedPresetModal.preset.imageUrl && (
                  <div className="flex justify-center">
                    <img
                      src={detailedPresetModal.preset.imageUrl}
                      alt={detailedPresetModal.preset.name}
                      className="max-w-full max-h-[400px] object-contain rounded-lg shadow-lg"
                    />
                  </div>
                )}

                {/* Preset Information */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Task:</span>
                          <span className="text-sm font-medium">{detailedPresetModal.preset.jsonjob.task}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Format:</span>
                          <span className="text-sm font-medium">{detailedPresetModal.preset.jsonjob.format}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Quality:</span>
                          <span className="text-sm font-medium">{detailedPresetModal.preset.jsonjob.quality}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Guidance:</span>
                          <span className="text-sm font-medium">{detailedPresetModal.preset.jsonjob.guidance}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Images:</span>
                          <span className="text-sm font-medium">{detailedPresetModal.preset.jsonjob.number_of_images}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Seed:</span>
                          <span className="text-sm font-medium">{detailedPresetModal.preset.jsonjob.seed}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Prompts */}
                  {(detailedPresetModal.preset.jsonjob?.prompt || detailedPresetModal.preset.jsonjob?.negative_prompt) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Pencil className="w-4 h-4" />
                          Prompts
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {detailedPresetModal.preset.jsonjob.prompt && (
                          <div>
                            <label className="text-sm font-medium">Positive Prompt</label>
                            <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                              {detailedPresetModal.preset.jsonjob.prompt}
                            </p>
                          </div>
                        )}
                        {detailedPresetModal.preset.jsonjob.negative_prompt && (
                          <div>
                            <label className="text-sm font-medium">Negative Prompt</label>
                            <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                              {detailedPresetModal.preset.jsonjob.negative_prompt}
                            </p>
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
      </DialogContent>
    </Dialog>
  );
} 