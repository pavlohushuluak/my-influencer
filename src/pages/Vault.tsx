import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Star, Search, Download, Share, Trash2, Filter, Calendar, Image, Video, SortAsc, SortDesc, ZoomIn, Folder, Plus, Upload, ChevronRight, Home, ArrowLeft, Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DialogContentZoom } from '@/components/ui/zoomdialog';
import { DialogZoom } from '@/components/ui/zoomdialog';
import { removeFromVault } from '@/store/slices/contentSlice';

// Interface for folder data from API
interface FolderData {
  Key: string;
}

// Interface for task data from API
interface TaskData {
  id: string;
  type: string;
  created_at: string;
}

// Interface for folder structure
interface FolderStructure {
  name: string;
  path: string;
  children: FolderStructure[];
  isFolder: boolean;
}

export default function Vault() {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [vaultItems, setVaultItems] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState<{ open: boolean; itemId: string | null }>({ open: false, itemId: null });

  // New folder modal state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderIcon, setSelectedFolderIcon] = useState('');
  const [uploadedIcon, setUploadedIcon] = useState<File | null>(null);
  const [folderIcons, setFolderIcons] = useState<string[]>([]);

  // Folder navigation state
  const [currentPath, setCurrentPath] = useState<string>('');
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([]);
  const [currentFolderItems, setCurrentFolderItems] = useState<TaskData[]>([]);

  // Folder renaming state
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderPath: string } | null>(null);

  // Extract folder name from full path
  const extractFolderName = (fullPath: string): string => {
    // Remove the user ID and "vault/" prefix
    const pathWithoutPrefix = fullPath.replace(/^[^\/]+\/vault\//, '');
    return pathWithoutPrefix;
  };

  // Build folder structure from raw folder data
  const buildFolderStructure = (folderData: FolderData[]): FolderStructure[] => {
    const structure: FolderStructure[] = [];
    const pathMap = new Map<string, FolderStructure>();

    // console.log('Building folder structure from:', folderData);

    folderData.forEach(folder => {
      // console.log('Processing folder:', folder);
      // console.log('Folder key:', folder.Key);

      // Extract the folder path from the key
      const folderPath = extractFolderName(folder.Key);
      // console.log('Extracted folder path:', folderPath);

      if (!folderPath) {
        // console.log('No folder path extracted, skipping');
        return;
      }

      const pathParts = folderPath.split('/').filter(part => part.length > 0);
      // console.log('Path parts:', pathParts);

      let currentPath = '';

      pathParts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        // console.log(`Processing part "${part}", currentPath: "${currentPath}", parentPath: "${parentPath}"`);

        if (!pathMap.has(currentPath)) {
          const folderNode: FolderStructure = {
            name: part,
            path: currentPath,
            children: [],
            isFolder: true
          };

          pathMap.set(currentPath, folderNode);
          // console.log(`Created folder node:`, folderNode);

          if (parentPath && pathMap.has(parentPath)) {
            // console.log(`Adding to parent "${parentPath}"`);
            pathMap.get(parentPath)!.children.push(folderNode);
          } else if (!parentPath) {
            // console.log(`Adding to root structure`);
            structure.push(folderNode);
          }
        }
      });
    });

    // console.log('Final folder structure:', structure);
    return structure;
  };

  // Get items in current folder
  const getCurrentFolderItems = (): TaskData[] => {
    if (!currentPath) {
      return vaultItems;
    }

    // Filter items that belong to the current folder path
    // This is a simplified implementation - in a real system, items would have folder metadata
    return vaultItems.filter(item => {
      // For now, return all items since we don't have folder association yet
      // In the future, this would check item.folder_path === currentPath
      return true;
    });
  };

  // Update current folder items when path changes
  useEffect(() => {
    setCurrentFolderItems(getCurrentFolderItems());
  }, [currentPath, vaultItems]);

  // Navigate to folder
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
    setCurrentFolderItems(getCurrentFolderItems());
  };

  // Navigate to parent folder
  const navigateToParent = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const parentPath = pathParts.join('/');
    setCurrentPath(parentPath);
    setCurrentFolderItems(getCurrentFolderItems());
  };

  // Navigate to home (root)
  const navigateToHome = () => {
    setCurrentPath('');
    setCurrentFolderItems(vaultItems);
  };

  // Get breadcrumb items
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

  // Fetch folders from API
  useEffect(() => {
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
            folder: "vault"
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch folders');
        }

        const data = await response.json();
        // console.log('Raw folders data from API:', data);
        setFolders(data);

        // Build folder structure
        const structure = buildFolderStructure(data);
        // console.log('Built folder structure:', structure);
        setFolderStructure(structure);

        // If no structure was built, create a fallback from the raw data
        if (structure.length === 0 && data.length > 0) {
          // console.log('No structure built, creating fallback folders');
          const fallbackFolders = data.map((folder: FolderData) => ({
            name: folder.Key || extractFolderName(folder.Key) || 'Unknown Folder',
            path: folder.Key || extractFolderName(folder.Key) || 'unknown',
            children: [],
            isFolder: true
          }));
          // console.log('Fallback folders:', fallbackFolders);
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

    if (userData.id) {
      fetchFolders();
    }
  }, [userData.id]);

  // Fetch data from API
  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://db.nymia.ai/rest/v1/tasks?uuid=eq.${userData.id}`, {
          headers: {
            'Authorization': 'Bearer WeInfl3nc3withAI'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vault data');
        }

        const data = await response.json();
        // console.log(data);
        setVaultItems(data);
        setCurrentFolderItems(data);
      } catch (error) {
        console.error('Error fetching vault data:', error);
        setVaultItems([]);
        setCurrentFolderItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (userData.id) {
      fetchVaultData();
    }
  }, [userData.id]);

  const filteredAndSortedItems = currentFolderItems
    .filter(item => {
      const matchesSearch = item.id;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'newest':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'oldest':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const hasActiveFilters = searchTerm || typeFilter !== 'all';

  const handleRemoveFromVault = async (contentId: string) => {
    try {
      // Delete from database
      const dbResponse = await fetch(`https://db.nymia.ai/rest/v1/tasks?uuid=eq.${userData.id}&id=eq.${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer WeInfl3nc3withAI'
        }
      });

      if (!dbResponse.ok) {
        throw new Error('Failed to delete from database');
      }

      // Delete file from API
      const fileResponse = await fetch('https://api.nymia.ai/v1/deletefile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `output/${contentId}.png`
        })
      });

      if (!fileResponse.ok) {
        throw new Error('Failed to delete file');
      }

      // Remove from local state
      dispatch(removeFromVault(contentId));

      // Update local vault items
      setVaultItems(prev => prev.filter(item => item.id !== contentId));
      setCurrentFolderItems(prev => prev.filter(item => item.id !== contentId));

      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleDownload = async (itemId: string) => {
    try {
      const response = await fetch('https://api.nymia.ai/v1/downloadfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `output/${itemId}.png`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${itemId}.png`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleShare = (itemId: string) => {
    setShareModal({ open: true, itemId });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareToSocialMedia = (platform: string, itemId: string) => {
    const imageUrl = `https://images.nymia.ai/cdn-cgi/image/w=800/${userData.id}/output/${itemId}.png`;
    const shareText = `Check out this amazing content!`;

    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(imageUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(imageUrl)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(shareText)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setSortBy('newest');
    setSortOrder('desc');
  };

  // Handle new folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      const folderPath = currentPath ? `${currentPath}/${newFolderName}` : newFolderName;

      const response = await fetch('https://api.nymia.ai/v1/createfolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          parentfolder: `vault/${currentPath ? currentPath + '/' : ''}`,
          folder: newFolderName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      // Add the new folder to the structure
      const newFolder: FolderStructure = {
        name: newFolderName,
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
      setSelectedFolderIcon('');
      setUploadedIcon(null);
      setShowNewFolderModal(false);

      toast.success(`Folder "${newFolderName}" created successfully`);
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  // Handle file upload for folder icon
  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedIcon(file);
      setSelectedFolderIcon('');
    }
  };

  // Get folders for current path
  const getCurrentPathFolders = (): FolderStructure[] => {
    if (!currentPath) {
      return folderStructure;
    }

    // Find the current folder and return its children
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

  // Get raw folders for current path (fallback)
  const getCurrentPathRawFolders = (): FolderData[] => {
    if (!currentPath) {
      // For root level, only show folders that have valid paths
      return folders.filter(folder => {
        const folderPath = extractFolderName(folder.Key);
        if (!folderPath || folderPath.trim() === '') return false;

        // Only show root level folders (single part paths)
        const pathParts = folderPath.split('/').filter(part => part.length > 0);
        return pathParts.length === 1;
      });
    }

    // Filter folders that belong to the current path
    return folders.filter(folder => {
      const folderPath = extractFolderName(folder.Key);
      if (!folderPath || folderPath.trim() === '') return false;

      // Check if this folder is a direct child of the current path
      const pathParts = folderPath.split('/').filter(part => part.length > 0);
      const currentPathParts = currentPath.split('/').filter(part => part.length > 0);

      // Check if this folder is one level deeper than current path
      if (pathParts.length !== currentPathParts.length + 1) {
        return false;
      }

      // Check if the folder path starts with current path
      return folderPath.startsWith(currentPath + '/');
    });
  };

  // Get all subfolders in a folder recursively
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
          folder: `vault/${folderPath}`
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

  // Create folder structure recursively
  const createFolderStructure = async (basePath: string, subfolders: string[]): Promise<void> => {
    for (const subfolder of subfolders) {
      const relativePath = subfolder.replace(basePath + '/', '');
      if (relativePath) {
        try {
          const response = await fetch('https://api.nymia.ai/v1/createfolder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              parentfolder: `vault/${basePath}/`,
              folder: relativePath
            })
          });

          if (!response.ok) {
            console.warn(`Failed to create subfolder: ${relativePath}`);
          }
        } catch (error) {
          console.error(`Error creating subfolder ${relativePath}:`, error);
        }
      }
    }
  };

  // Handle folder rename
  const handleFolderRename = async (oldPath: string, newName: string) => {
    try {
      console.log('Renaming folder:', oldPath, 'to:', newName);

      // Get the parent path and construct the new path
      const pathParts = oldPath.split('/');
      const oldFolderName = pathParts.pop() || '';
      const parentPath = pathParts.join('/');
      const newPath = parentPath ? `${parentPath}/${newName}` : newName;

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
          parentfolder: `vault/${parentPath ? parentPath + '/' : ''}`,
          folder: newName
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create new folder');
      }

      console.log('New folder created successfully');

      // Step 2: Get all files and subfolders from the old folder
      const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `vault/${oldPath}`
        })
      });

      if (getFilesResponse.ok) {
        const files = await getFilesResponse.json();
        console.log('Files to copy:', files);

        // Step 3: Copy all files to the new folder
        if (files && files.length > 0) {
          const copyPromises = files.map(async (file: any) => {
            console.log("File:", file);
            const fileKey = file.Key;
            const re = new RegExp(`^.*?vault/${oldPath}/`);
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
                sourcefilename: `vault/${oldPath}/${fileName}`,
                destinationfilename: `vault/${newPath}/${fileName}`
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

      // Step 4: Get all subfolders from the old folder
      const getFoldersResponse = await fetch('https://api.nymia.ai/v1/getfoldernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `vault/${oldPath}`
        })
      });

      if (getFoldersResponse.ok) {
        const folders = await getFoldersResponse.json();
        console.log('Subfolders to copy:', folders);

        // Step 5: Copy all subfolders recursively
        if (folders && folders.length > 0) {
          for (const folder of folders) {
            const folderKey = folder.Key;
            const re = new RegExp(`^.*?vault/${oldPath}/`);

            // Then just do:
            const relativePath = folderKey.replace(re, "").replace(/\/$/, "");

            console.log("Folder Key:", folderKey);
            console.log("Relative Path:", relativePath);

            if (relativePath && relativePath !== folderKey) {
              // Create the subfolder in the new location
              const subfolderCreateResponse = await fetch('https://api.nymia.ai/v1/createfolder', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer WeInfl3nc3withAI'
                },
                body: JSON.stringify({
                  user: userData.id,
                  parentfolder: `vault/${newPath}/`,
                  folder: relativePath
                })
              });

              if (subfolderCreateResponse.ok) {
                // Copy files from this subfolder
                await copyFilesFromFolder(`${oldPath}/${relativePath}`, `${newPath}/${relativePath}`);
              }
            }

            const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer WeInfl3nc3withAI'
              },
              body: JSON.stringify({
                user: userData.id,
                folder: `vault/${oldPath}/${relativePath}`
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
                  const re = new RegExp(`^.*?vault/${oldPath}/${relativePath}/`);
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
                      sourcefilename: `vault/${oldPath}/${relativePath}/${fileName}`,
                      destinationfilename: `vault/${newPath}/${relativePath}/${fileName}`
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
          }
        }
      }

      // Step 6: Delete the old folder
      const deleteResponse = await fetch('https://api.nymia.ai/v1/deletefolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `vault/${oldPath}`
        })
      });

      if (!deleteResponse.ok) {
        console.warn('Failed to delete old folder, but rename operation completed');
      }

      // Step 7: Refresh folder structure
      const refreshResponse = await fetch('https://api.nymia.ai/v1/getfoldernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: "vault"
        })
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setFolders(data);

        // Rebuild folder structure
        const structure = buildFolderStructure(data);
        setFolderStructure(structure);
      }

      // Step 8: Update current path if we're in the renamed folder
      if (currentPath === oldPath) {
        setCurrentPath(newPath);
      } else if (currentPath.startsWith(oldPath + '/')) {
        const newCurrentPath = currentPath.replace(oldPath, newPath);
        setCurrentPath(newCurrentPath);
      }

      // Step 9: Exit edit mode
      setEditingFolder(null);
      setEditingFolderName('');

      console.log('Folder rename completed successfully');
      toast.success(`Folder renamed to "${newName}" successfully`);

    } catch (error) {
      console.error('Error renaming folder:', error);
      toast.error('Failed to rename folder. Please try again.');
      setEditingFolder(null);
      setEditingFolderName('');
    }
  };

  // Helper function to copy files from a specific folder
  const copyFilesFromFolder = async (sourceFolder: string, destFolder: string): Promise<void> => {
    try {
      const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `vault/${sourceFolder}`
        })
      });

      if (!getFilesResponse.ok) {
        console.warn(`Failed to get files from folder: ${sourceFolder}`);
        return;
      }

      const filesData = await getFilesResponse.json();
      // console.log(`Files in folder ${sourceFolder}:`, filesData);

      if (filesData && filesData.length > 0) {
        const copyPromises = filesData.map(async (file: any) => {
          const copyResponse = await fetch('https://api.nymia.ai/v1/copyfile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              sourcefilename: `vault/${sourceFolder}/${file}`,
              destinationfilename: `vault/${destFolder}/${file}`
            })
          });

          if (!copyResponse.ok) {
            console.warn(`Failed to copy file ${file} from ${sourceFolder} to ${destFolder}`);
            throw new Error(`Failed to copy file ${file}`);
          }
        });

        await Promise.all(copyPromises);
      }
    } catch (error) {
      console.error(`Error copying files from ${sourceFolder}:`, error);
    }
  };

  // Handle F2 key press
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'F2' && contextMenu) {
      e.preventDefault();
      setEditingFolder(contextMenu.folderPath);
      setEditingFolderName(contextMenu.folderPath.split('/').pop() || '');
      setContextMenu(null);
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu]);

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent, folderPath: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, folderPath });
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Delete folder and all its contents recursively
  const deleteFolderRecursively = async (folderPath: string): Promise<void> => {
    try {
      // Use the correct deletefolder API endpoint
      const response = await fetch('https://api.nymia.ai/v1/deletefolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `vault/${folderPath}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }

      console.log(`Successfully deleted folder: ${folderPath}`);
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  };

  // Helper function to delete all files from a specific folder (keeping for reference but not used in new implementation)
  const deleteFilesFromFolder = async (folderPath: string): Promise<void> => {
    try {
      const getFilesResponse = await fetch('https://api.nymia.ai/v1/getfilenames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `vault/${folderPath}`
        })
      });

      if (!getFilesResponse.ok) {
        console.warn(`Failed to get files from folder: ${folderPath}`);
        return;
      }

      const filesData = await getFilesResponse.json();
      console.log(`Files in folder ${folderPath}:`, filesData);

      if (filesData && filesData.length > 0) {
        const deletePromises = filesData.map(async (file: any) => {
          const deleteResponse = await fetch('https://api.nymia.ai/v1/deletefile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer WeInfl3nc3withAI'
            },
            body: JSON.stringify({
              user: userData.id,
              filename: `vault/${folderPath}/${file}`
            })
          });

          if (!deleteResponse.ok) {
            console.warn(`Failed to delete file ${file} from ${folderPath}`);
            throw new Error(`Failed to delete file ${file}`);
          }
        });

        await Promise.all(deletePromises);
      }
    } catch (error) {
      console.error(`Error deleting files from ${folderPath}:`, error);
    }
  };

  // Handle folder deletion
  const handleDeleteFolder = async (folderPath: string) => {
    try {
      toast.info('Deleting folder...', {
        description: 'This may take a moment depending on the folder contents'
      });

      await deleteFolderRecursively(folderPath);

      // Refresh folders from API to get updated structure
      const response = await fetch('https://api.nymia.ai/v1/getfoldernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer WeInfl3nc3withAI'
        },
        body: JSON.stringify({
          user: userData.id,
          folder: "vault"
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFolders(data);

        // Rebuild folder structure
        const structure = buildFolderStructure(data);
        setFolderStructure(structure);
      }

      // If we're currently in the deleted folder or one of its subfolders, navigate to parent
      if (currentPath === folderPath || currentPath.startsWith(folderPath + '/')) {
        const pathParts = folderPath.split('/');
        pathParts.pop();
        const parentPath = pathParts.join('/');
        setCurrentPath(parentPath);
        setCurrentFolderItems(getCurrentFolderItems());
      }

      setContextMenu(null);
      toast.success(`Folder "${folderPath.split('/').pop()}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder. Please try again.');
      setContextMenu(null);
    }
  };

  if (loading || foldersLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <h1 className="flex flex-col items-center md:items-start text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
              File Manager of nymia
            </h1>
            <p className="text-muted-foreground">
              Organize and manage your content with folders
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading file manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        <div>
          <h1 className="flex flex-col items-center md:items-start text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
            File Manager of nymia
          </h1>
          <p className="text-muted-foreground">
            Organize and manage your content with folders
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="w-4 h-4 text-yellow-500" />
          {vaultItems.length} items saved
        </div>
      </div>

      {/* Professional Search and Filter Bar */}
      <Card className="border-yellow-500/20 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20">
        <CardHeader className="pt-5 pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pb-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search vault by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images Only</SelectItem>
                <SelectItem value="video">Videos Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Date Added</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-1"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>

              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <span className="text-sm text-muted-foreground">
                  Search: "{searchTerm}"
                </span>
              )}
              {typeFilter !== 'all' && (
                <span className="text-sm text-muted-foreground">
                  Type: {typeFilter}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Folders Section */}
      <Card className="border-blue-500/20 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader className="pt-5 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Folders
            </CardTitle>
            <div className="flex items-center gap-2">
              {currentPath && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToParent}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToHome}
                className="flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          {currentPath && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={navigateToHome}
                className="h-6 px-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/20"
              >
                Home
              </Button>
              {getBreadcrumbItems().map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToFolder(item.path)}
                    className="h-6 px-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/20"
                  >
                    {item.name}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Folder Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {/* Show folders for current path */}
            {(() => {
              const currentFolders = getCurrentPathFolders();

              // console.log('Current folders to display:', currentFolders);
              // console.log('Current path:', currentPath);
              // console.log('Folder structure:', folderStructure);

              return currentFolders.map((folder) => (
                <div
                  key={folder.path}
                  className="group cursor-pointer"
                  onDoubleClick={() => navigateToFolder(folder.path)}
                  onContextMenu={(e) => handleContextMenu(e, folder.path)}
                >
                  <div className="flex flex-col items-center p-3 rounded-lg border-2 border-transparent hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                      <Folder className="w-6 h-6 text-white" />
                    </div>
                    {editingFolder === folder.path ? (
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
                      <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {folder.name}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground mt-1">
                      {folder.children.length} items
                    </span>
                  </div>
                </div>
              ));
            })()}

            {/* Fallback folders with renaming */}
            {(() => {
              const currentFolders = getCurrentPathFolders();
              if (currentFolders.length === 0 && folders.length > 0) {
                // console.log('No structured folders, showing raw folders as fallback');
                const rawFolders = getCurrentPathRawFolders();

                if (rawFolders.length === 0) {
                  return null; // Don't show anything if no valid folders
                }

                return rawFolders.map((folder) => {
                  const folderPath = extractFolderName(folder.Key);
                  if (!folderPath || folderPath.trim() === '') {
                    return null; // Skip invalid folders
                  }

                  const folderName = folderPath.split('/').pop();
                  if (!folderName || folderName.trim() === '') {
                    return null; // Skip folders with empty names
                  }

                  return (
                    <div
                      key={folder.Key}
                      className="group cursor-pointer"
                      onClick={() => {
                        if (folderPath) {
                          navigateToFolder(folderPath);
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (folderPath) {
                          handleContextMenu(e, folderPath);
                        }
                      }}
                    >
                      <div className="flex flex-col items-center p-3 rounded-lg border-2 border-transparent hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200">
                          <Folder className="w-6 h-6 text-white" />
                        </div>
                        {editingFolder === folderPath ? (
                          <div className="w-full">
                            <Input
                              value={editingFolderName}
                              onChange={(e) => setEditingFolderName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleFolderRename(folderPath, editingFolderName);
                                } else if (e.key === 'Escape') {
                                  setEditingFolder(null);
                                  setEditingFolderName('');
                                }
                              }}
                              onBlur={() => handleFolderRename(folderPath, editingFolderName)}
                              className="text-xs h-6 text-center"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {folderName}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground mt-1">
                          0 items
                        </span>
                      </div>
                    </div>
                  );
                }).filter(Boolean); // Remove null entries
              }
              return null;
            })()}

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

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedItems.length} of {currentFolderItems.length} items
            {currentPath && ` in "${currentPath}"`}
          </p>
          {currentPath && (
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <Folder className="w-3 h-3 mr-1" />
              {currentPath}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="w-4 h-4 text-yellow-500" />
          {vaultItems.length} total items
        </div>
      </div>

      {/* Content Grid */}
      {filteredAndSortedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredAndSortedItems.map((item) => (
            <Card
              key={item.id}
              className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-yellow-500/30 bg-gradient-to-br from-yellow-50/20 to-orange-50/20 dark:from-yellow-950/5 dark:to-orange-950/5 backdrop-blur-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.type === 'video' ? (
                      <Video className="w-4 h-4 text-purple-500" />
                    ) : (
                      <Image className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">{item.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative w-full group mb-4" style={{ paddingBottom: '100%' }}>
                  <img
                    src={`https://images.nymia.ai/cdn-cgi/image/w=400/${userData.id}/output/${item.id}.png`}
                    alt={item.id}
                    className="absolute inset-0 w-full h-full object-cover rounded-md shadow-sm"
                  />
                  <div
                    className="absolute right-2 top-2 bg-black/50 rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                    onClick={() => setSelectedImage(`https://images.nymia.ai/cdn-cgi/image/w=800/${userData.id}/output/${item.id}.png`)}
                  >
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Added {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs font-medium hover:bg-purple-700 hover:border-purple-500 transition-colors"
                      onClick={() => handleDownload(item.id)}
                    >
                      <Download className="w-3 h-3 mr-1.5" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 hover:bg-green-50 hover:bg-green-700 hover:border-green-500 transition-colors"
                      onClick={() => handleShare(item.id)}
                    >
                      <Share className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-amber-500 hover:border-amber-300 transition-colors"
                      onClick={() => handleRemoveFromVault(item.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            {currentPath ? (
              <>
                <Folder className="w-12 h-12 text-blue-500/50" />
                <h3 className="text-lg font-semibold mb-2">No items in this folder</h3>
                <p className="text-muted-foreground">
                  The folder "{currentPath}" is empty. Try navigating to a different folder or create some content.
                </p>
              </>
            ) : (
              <>
                <Star className="w-12 h-12 text-yellow-500/50" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      <DialogZoom open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContentZoom className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full size image"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </DialogContentZoom>
      </DialogZoom>

      {/* Share Modal */}
      <Dialog open={shareModal.open} onOpenChange={() => setShareModal({ open: false, itemId: null })}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Share Content</h3>
              <p className="text-sm text-muted-foreground">Choose how you'd like to share this content</p>
            </div>

            {shareModal.itemId && (
              <>
                {/* Copy Link Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Direct Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`https://images.nymia.ai/cdn-cgi/image/w=800/${userData.id}/output/${shareModal.itemId}.png`}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`https://images.nymia.ai/cdn-cgi/image/w=800/${userData.id}/output/${shareModal.itemId}.png`)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Social Media Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Share on Social Media</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => shareToSocialMedia('twitter', shareModal.itemId)}
                    >
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Twitter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => shareToSocialMedia('facebook', shareModal.itemId)}
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => shareToSocialMedia('linkedin', shareModal.itemId)}
                    >
                      <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => shareToSocialMedia('pinterest', shareModal.itemId)}
                    >
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                      </svg>
                      Pinterest
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Folder Modal */}
      <Dialog open={showNewFolderModal} onOpenChange={setShowNewFolderModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-blue-500" />
              Create New Folder
            </DialogTitle>
            <DialogDescription>
              {currentPath ? (
                <>
                  Create a new folder in <span className="font-medium text-blue-600">{currentPath}</span>
                </>
              ) : (
                'Create a new folder in the root directory'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Path Display */}
            {currentPath && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-sm">
                  <Folder className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">Location:</span>
                  <span className="text-blue-600 dark:text-blue-300">{currentPath}</span>
                </div>
              </div>
            )}

            {/* Folder Name Input */}
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFolderName.trim()) {
                    handleCreateFolder();
                  }
                }}
              />
            </div>

            {/* Folder Icon Selection */}
            <div className="space-y-2">
              <Label>Folder Icon (Optional)</Label>
              <div className="grid grid-cols-4 gap-2">
                {folderIcons.map((icon, index) => (
                  <Button
                    key={index}
                    variant={selectedFolderIcon === icon ? "default" : "outline"}
                    size="sm"
                    className="h-12 w-12 p-0"
                    onClick={() => {
                      setSelectedFolderIcon(icon);
                      setUploadedIcon(null);
                    }}
                  >
                    <img src={icon} alt={`Icon ${index + 1}`} className="w-6 h-6" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Upload Custom Icon */}
            <div className="space-y-2">
              <Label>Upload Custom Icon (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="flex-1"
                />
                {uploadedIcon && (
                  <div className="w-8 h-8 rounded border overflow-hidden">
                    <img
                      src={URL.createObjectURL(uploadedIcon)}
                      alt="Uploaded icon"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                  setSelectedFolderIcon('');
                  setUploadedIcon(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => {
              setEditingFolder(contextMenu.folderPath);
              setEditingFolderName(contextMenu.folderPath.split('/').pop() || '');
              setContextMenu(null);
            }}
          >
            <Pencil className="w-4 h-4" />
            Rename
          </button>
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
    </div>
  );
}
