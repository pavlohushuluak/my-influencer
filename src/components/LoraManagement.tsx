import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RootState } from "@/store/store";
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  Edit,
  FileImage,
  Folder,
  Image,
  Plus,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import { CreditConfirmationModal } from "@/components/CreditConfirmationModal";
import VaultSelector from "@/components/VaultSelector";
import config from "@/config/config";

// Interface for file data from getfilenames API
interface FileData {
  Key: string;
  Size: string;
  LastModified: string;
  ETag: string;
  StorageClass: string;
}

// Interface for folder data from getfoldernames API
interface FolderData {
  Key: string;
}

// Interface for LoRA training file
interface LoraFile {
  id: string;
  key: string;
  filename: string;
  size: string;
  lastModified: string;
  url: string;
  type: "image" | "model" | "config" | "other";
  status: "training" | "completed" | "error";
}

// Interface for LoRA status from database
interface LoraStatus {
  lora_id: string;
  user_uuid: string;
  model_id: string;
  description: string;
  lastjobid: string;
  status: string;
}

// Interface for generated image data from vault
interface GeneratedImageData {
  id: string;
  task_id: string;
  image_sequence_number: number;
  system_filename: string;
  user_filename: string | null;
  user_notes: string | null;
  user_tags: string[] | null;
  file_path: string;
  file_size_bytes: number;
  image_format: string;
  seed: number;
  guidance: number;
  steps: number;
  nsfw_strength: number;
  lora_strength: number;
  model_version: string;
  t5xxl_prompt: string;
  clip_l_prompt: string;
  negative_prompt: string;
  generation_status: string;
  generation_started_at: string;
  generation_completed_at: string;
  generation_time_seconds: number;
  error_message: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
  actual_seed_used: number;
  prompt_file_used: string;
  quality_setting: string;
  rating: number;
  favorite: boolean;
  file_type: string;
}

interface LoraManagementProps {
  influencerId: string;
  influencerName: string;
  onClose: () => void;
}

export default function LoraManagement({
  influencerId,
  influencerName,
  onClose,
}: LoraManagementProps) {
  const userData = useSelector((state: RootState) => state.user);

  // State management
  const [files, setFiles] = useState<LoraFile[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedFile, setSelectedFile] = useState<LoraFile | null>(null);

  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(
    new Set()
  );
  const [movingFiles, setMovingFiles] = useState<Set<string>>(new Set());
  const [isInTrash, setIsInTrash] = useState(false);
  const [trashFiles, setTrashFiles] = useState<LoraFile[]>([]);
  const [isStartingTraining, setIsStartingTraining] = useState(false);

  // LoRA status state
  const [loraStatus, setLoraStatus] = useState<LoraStatus | null>(null);
  const [isLoadingLoraStatus, setIsLoadingLoraStatus] = useState(true);

  // Credit checking state for LoRA training
  const [showRestartGemWarning, setShowRestartGemWarning] = useState(false);
  const [restartGemCostData, setRestartGemCostData] = useState<{
    id: number;
    item: string;
    description: string;
    gems: number;
  } | null>(null);
  const [isCheckingGems, setIsCheckingGems] = useState(false);

  // Upload state
  const [uploadModal, setUploadModal] = useState<{ open: boolean }>({
    open: false,
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragOverUpload, setDragOverUpload] = useState(false);

  // Vault selector state
  const [showVaultSelector, setShowVaultSelector] = useState(false);

  // Create image state
  const [showCreateImageModal, setShowCreateImageModal] = useState(false);
  const [selectedImageForCreation, setSelectedImageForCreation] =
    useState<LoraFile | null>(null);
  const [isCreatingImage, setIsCreatingImage] = useState(false);

  // Credit checking state for create image
  const [showCreateImageGemWarning, setShowCreateImageGemWarning] =
    useState(false);
  const [createImageGemCostData, setCreateImageGemCostData] = useState<{
    id: number;
    item: string;
    description: string;
    gems: number;
  } | null>(null);

  // Reference image generation state
  const [isGeneratingReferenceImages, setIsGeneratingReferenceImages] =
    useState(false);
  const [showReferenceImageGemWarning, setShowReferenceImageGemWarning] =
    useState(false);
  const [referenceImageGemCostData, setReferenceImageGemCostData] = useState<{
    id: number;
    item: string;
    description: string;
    gems: number;
  } | null>(null);

  // Auto-refresh state for reference image generation
  const [autoRefreshInterval, setAutoRefreshInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Reset training state modal
  const [showResetTrainingModal, setShowResetTrainingModal] = useState(false);
  const [isResettingTraining, setIsResettingTraining] = useState(false);

  // Fetch LoRA status from database (check both loras table and influencer.lorastatus)
  const fetchLoraStatus = useCallback(async () => {
    try {
      setIsLoadingLoraStatus(true);

      // First check the influencer table for lorastatus
      const influencerResponse = await fetch(
        `${config.supabase_server_url}/influencer?id=eq.${influencerId}&select=lorastatus`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );

      if (influencerResponse.ok) {
        const influencerData = await influencerResponse.json();
        if (
          influencerData &&
          influencerData.length > 0 &&
          influencerData[0].lorastatus === 0
        ) {
          // If influencer lorastatus is 0, consider it as "not started"
          setLoraStatus(null);
          return;
        }
      }

      // Otherwise check the loras table as before
      const response = await fetch(
        `${config.supabase_server_url}/loras?user_uuid=eq.${userData.id}&model_id=eq.${influencerId}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch LoRA status");
      }

      const loraData: LoraStatus[] = await response.json();

      // Set the first (and should be only) LoRA record for this model
      if (loraData && loraData.length > 0) {
        // If status is "generation_reset", treat it as "not started"
        if (loraData[0].status === "generation_reset") {
          setLoraStatus(null);
        } else {
          setLoraStatus(loraData[0]);
        }
      } else {
        setLoraStatus(null);
      }
    } catch (error) {
      console.error("Error fetching LoRA status:", error);
      setLoraStatus(null);
    } finally {
      setIsLoadingLoraStatus(false);
    }
  }, [userData.id, influencerId]);

  // Fetch files from LoRA training folder
  const fetchLoraFiles = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get files from the loratraining folder
      const filesResponse = await fetch(`${config.backend_url}/getfilenames`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `models/${influencerId}/loratraining`,
        }),
      });

      if (!filesResponse.ok) {
        throw new Error("Failed to fetch LoRA files");
      }

      const filesData: FileData[] = await filesResponse.json();

      // Transform files data to LoraFile format
      const transformedFiles: LoraFile[] = filesData
        .filter((file: FileData) => file.Key && typeof file.Key === "string") // Filter out files with invalid keys
        .map((file: FileData) => {
          const filename = file.Key.split("/").pop() || "";
          const fileExtension = filename.split(".").pop()?.toLowerCase() || "";

          // Determine file type
          let type: LoraFile["type"] = "other";
          if (["png", "jpg", "jpeg", "webp"].includes(fileExtension)) {
            type = "image";
          } else if (["safetensors", "ckpt", "pt"].includes(fileExtension)) {
            type = "model";
          } else if (["json", "yaml", "yml"].includes(fileExtension)) {
            type = "config";
          }

          // Determine status based on filename patterns
          let status: LoraFile["status"] = "completed";
          if (filename.includes("training") || filename.includes("temp")) {
            status = "training";
          } else if (
            filename.includes("error") ||
            filename.includes("failed")
          ) {
            status = "error";
          }

          return {
            id: file.Key,
            key: file.Key,
            filename: filename,
            size: file.Size || "0",
            lastModified: file.LastModified || new Date().toISOString(),
            url: `${config.data_url}/${userData.id}/models/${influencerId}/loratraining/${filename}`,
            type,
            status,
          };
        });

      setFiles(transformedFiles);

      // Get folders from the loratraining folder
      const foldersResponse = await fetch(
        `${config.backend_url}/getfoldernames`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify({
            user: userData.id,
            folder: `models/${influencerId}/loratraining`,
          }),
        }
      );

      if (foldersResponse.ok) {
        const foldersData: FolderData[] = await foldersResponse.json();
        setFolders(foldersData);

        console.log(foldersData);

        // If no folders exist, create Trash folder
        if (foldersData.length === 0 || foldersData[0].Key !== "Trash") {
          await createTrashFolder();
        }
      } else {
        // If getfoldernames fails, create Trash folder
        await createTrashFolder();
      }
    } catch (error) {
      console.error("Error fetching AI consistency training files:", error);
      toast.error("Failed to load AI consistency training files");
    } finally {
      setIsLoading(false);
    }
  }, [userData.id, influencerId]);

  // Create Trash folder
  const createTrashFolder = async () => {
    try {
      const response = await fetch(`${config.backend_url}/createfolder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `models/${influencerId}/loratraining/Trash`,
        }),
      });

      if (response.ok) {
        // Refresh folders
        const foldersResponse = await fetch(
          `${config.backend_url}/getfoldernames`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer WeInfl3nc3withAI",
            },
            body: JSON.stringify({
              user: userData.id,
              folder: `models/${influencerId}/loratraining`,
            }),
          }
        );

        if (foldersResponse.ok) {
          const foldersData: FolderData[] = await foldersResponse.json();
          setFolders(foldersData);
        }
      }
    } catch (error) {
      console.error("Error creating Trash folder:", error);
    }
  };

  // Download file
  const handleDownload = async (file: LoraFile) => {
    try {
      setDownloadingFiles((prev) => new Set(prev).add(file.id));

      console.log(file.key);
      const result = file.key.match(/(models\/[^\s]+)/);

      if (!result || result.length === 0) {
        throw new Error("Failed to extract file path");
      }
      console.log(result[0]);

      const response = await fetch(`${config.backend_url}/downloadfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          filename: result[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      toast.success("Download completed successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  // Move file to Trash
  const handleMoveToTrash = async (file: LoraFile) => {
    try {
      setMovingFiles((prev) => new Set(prev).add(file.id));
      console.log(file);

      // Copy file to Trash folder
      const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `models/${influencerId}/loratraining/${file.filename}`,
          destinationfilename: `models/${influencerId}/loratraining/Trash/${file.filename}`,
        }),
      });

      if (!copyResponse.ok) {
        throw new Error("Failed to copy file to Trash");
      }

      // Delete file from original location
      const deleteResponse = await fetch(`${config.backend_url}/deletefile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `models/${influencerId}/loratraining/${file.filename}`,
        }),
      });

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete original file");
      }

      // Remove from current list
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast.success("File moved to Trash");
    } catch (error) {
      console.error("Move to trash error:", error);
      toast.error("Failed to move file to Trash");
    } finally {
      setMovingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  // Restore file from Trash
  const handleRestoreFromTrash = async (file: LoraFile) => {
    try {
      setMovingFiles((prev) => new Set(prev).add(file.id));

      // Copy file back to main folder
      const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `models/${influencerId}/loratraining/Trash/${file.filename}`,
          destinationfilename: `models/${influencerId}/loratraining/${file.filename}`,
        }),
      });

      if (!copyResponse.ok) {
        throw new Error("Failed to restore file");
      }

      // Delete file from Trash
      const deleteResponse = await fetch(`${config.backend_url}/deletefile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          filename: `models/${influencerId}/loratraining/Trash/${file.filename}`,
        }),
      });

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete file from Trash");
      }

      // Remove from trash list and add to main files
      setTrashFiles((prev) => prev.filter((f) => f.id !== file.id));
      const restoredFile = {
        ...file,
        key: `models/${influencerId}/loratraining/${file.filename}`,
      };
      setFiles((prev) => [...prev, restoredFile]);
      toast.success("File restored from Trash");
    } catch (error) {
      console.error("Restore error:", error);
      toast.error("Failed to restore file");
    } finally {
      setMovingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  // Fetch trash files
  const fetchTrashFiles = async () => {
    try {
      const filesResponse = await fetch(`${config.backend_url}/getfilenames`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          folder: `models/${influencerId}/loratraining/Trash`,
        }),
      });

      if (!filesResponse.ok) {
        throw new Error("Failed to fetch trash files");
      }

      const filesData: FileData[] = await filesResponse.json();

      const transformedFiles: LoraFile[] = filesData
        .filter((file: FileData) => file.Key && typeof file.Key === "string") // Filter out files with invalid keys
        .map((file: FileData) => {
          const filename = file.Key.split("/").pop() || "";
          const fileExtension = filename.split(".").pop()?.toLowerCase() || "";

          let type: LoraFile["type"] = "other";
          if (["png", "jpg", "jpeg", "webp"].includes(fileExtension)) {
            type = "image";
          } else if (["safetensors", "ckpt", "pt"].includes(fileExtension)) {
            type = "model";
          } else if (["json", "yaml", "yml"].includes(fileExtension)) {
            type = "config";
          }

          let status: LoraFile["status"] = "completed";
          if (filename.includes("training") || filename.includes("temp")) {
            status = "training";
          } else if (
            filename.includes("error") ||
            filename.includes("failed")
          ) {
            status = "error";
          }

          return {
            id: file.Key,
            key: file.Key,
            filename: filename,
            size: file.Size || "0",
            lastModified: file.LastModified || new Date().toISOString(),
            url: `${config.data_url}/${userData.id}/models/${influencerId}/loratraining/Trash/${filename}`,
            type,
            status,
          };
        });

      setTrashFiles(transformedFiles);
    } catch (error) {
      console.error("Error fetching trash files:", error);
      toast.error("Failed to load trash files");
    }
  };

  // Handle trash folder double click
  const handleTrashFolderClick = async () => {
    if (!isInTrash) {
      try {
        setIsInTrash(true);
        await fetchTrashFiles();
      } catch (error) {
        console.error("Error switching to trash view:", error);
        setIsInTrash(false); // Revert the state if there's an error
        toast.error("Failed to load trash folder");
      }
    }
  };

  // Handle back from trash
  const handleBackFromTrash = () => {
    setIsInTrash(false);
    setTrashFiles([]);
  };

  // Start LoRA training
  const handleStartLoraTraining = async (isFast: boolean = false) => {
    try {
      setIsStartingTraining(true);

      const response = await fetch(`${config.backend_url}/startloratraining`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          influencer_id: influencerId,
          fast_training: isFast,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start AI consistency training");
      }

      toast.success(
        `AI consistency ${isFast ? "fast " : ""}training started successfully`
      );

      // Refresh files to show new training files
      await fetchLoraFiles();
    } catch (error) {
      console.error("Training error:", error);
      toast.error("Failed to start AI consistency training");
    } finally {
      setIsStartingTraining(false);
    }
  };

  // View full size image
  const handleViewFullSize = (file: LoraFile) => {
    if (file.type === "image") {
      console.log("Opening full size image:", file.url);
      setFullSizeImage(file.url);
    }
  };

  // Filter and sort files
  const currentFiles = isInTrash ? trashFiles : files;
  const filteredFiles = currentFiles.filter((file) => {
    const matchesSearch =
      searchTerm === "" ||
      file.filename.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "newest":
        comparison =
          new Date(b.lastModified).getTime() -
          new Date(a.lastModified).getTime();
        break;
      case "oldest":
        comparison =
          new Date(a.lastModified).getTime() -
          new Date(b.lastModified).getTime();
        break;
      case "name":
        comparison = a.filename.localeCompare(b.filename);
        break;
      case "size":
        comparison = parseInt(a.size) - parseInt(b.size);
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
      default:
        comparison = 0;
    }

    return sortOrder === "desc" ? comparison : -comparison;
  });

  // Get file type icon
  const getFileTypeIcon = (type: LoraFile["type"]) => {
    switch (type) {
      case "image":
        return <FileImage className="w-4 h-4" />;
      case "model":
        return <Brain className="w-4 h-4" />;
      case "config":
        return <Edit className="w-4 h-4" />;
      default:
        return <FileImage className="w-4 h-4" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle file upload
  // Function to handle vault image selection and copy to LoRA training
  const handleVaultImageSelect = async (image: GeneratedImageData) => {
    try {
      setIsUploading(true);

      // Determine the source path based on user_filename
      const sourcePath =
        image.user_filename === "" || image.user_filename === null
          ? "output"
          : `vault/${image.user_filename}`;

      // Use copyfile API to copy the image from vault to LoRA training folder
      const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `${sourcePath}/${image.system_filename}`,
          destinationfilename: `models/${influencerId}/loratraining/${image.system_filename}`,
        }),
      });

      if (!copyResponse.ok) {
        throw new Error("Failed to copy image from library");
      }

      toast.success(
        "Image copied to AI consistency training folder successfully"
      );
      setShowVaultSelector(false);

      // Refresh the files list
      fetchLoraFiles();
    } catch (error) {
      console.error("Error copying image from library:", error);
      toast.error("Failed to copy image from library");
    } finally {
      setIsUploading(false);
    }
  };

  // Function to check gem cost for reference image generation
  const checkReferenceImageGemCost = async () => {
    try {
      setIsGeneratingReferenceImages(true);
      const response = await fetch("https://api.nymia.ai/v1/getgems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          item: "lora_image_regen",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch gem cost: ${response.status}`);
      }

      const gemData = await response.json();
      return gemData;
    } catch (error) {
      console.error("Error checking gem cost:", error);
      toast.error("Failed to check gem cost. Please try again.");
      return null;
    } finally {
      setIsGeneratingReferenceImages(false);
    }
  };

  // Function to handle reference image generation
  const handleGenerateReferenceImages = async () => {
    // Check gem cost first
    const gemData = await checkReferenceImageGemCost();
    if (gemData) {
      setReferenceImageGemCostData(gemData);

      // Check if user has enough gems
      if (userData.credits < gemData.gems) {
        setShowReferenceImageGemWarning(true);
        return;
      } else {
        // Show confirmation for gem cost
        setShowReferenceImageGemWarning(true);
        return;
      }
    }

    toast.error("Unable to verify gem cost for reference image generation");
  };

  // Function to proceed with reference image generation after confirmation
  const proceedWithReferenceImageGeneration = async () => {
    try {
      setShowReferenceImageGemWarning(false);
      setIsGeneratingReferenceImages(true);

      console.log(
        "Starting reference image generation for influencer:",
        influencerId
      );

      // Get influencer data first
      const influencerResponse = await fetch(
        `${config.supabase_server_url}/influencer?id=eq.${influencerId}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );

      const influencerData = await influencerResponse.json();

      if (!influencerData || influencerData.length === 0) {
        throw new Error("Influencer data not found");
      }

      // Get user ID from database
      const useridResponse = await fetch(
        `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );

      const useridData = await useridResponse.json();

      if (!useridData || useridData.length === 0) {
        throw new Error("User not found");
      }

      // Create the request data structure similar to ContentCreateImage
      const requestData = {
        task: "createloraimages",
        lora: true,
        noAI: false,
        prompt: "reference images for AI consistency model",
        negative_prompt: "",
        nsfw_strength: 0,
        lora_strength: 1.0,
        quality: "high",
        seed: -1,
        guidance: 7.5,
        number_of_images: 4,
        format: "1024x1024",
        engine: "flux",
        usePromptOnly: false,
        regenerated_from: "12345678-1111-2222-3333-caffebabe0123",
        model: {
          id: influencerData[0].id,
          influencer_type: influencerData[0].influencer_type,
          sex: influencerData[0].sex,
          cultural_background: influencerData[0].cultural_background,
          hair_length: influencerData[0].hair_length,
          hair_color: influencerData[0].hair_color,
          hair_style: influencerData[0].hair_style,
          eye_color: influencerData[0].eye_color,
          lip_style: influencerData[0].lip_style,
          nose_style: influencerData[0].nose_style,
          face_shape: influencerData[0].face_shape,
          facial_features: influencerData[0].facial_features,
          skin_tone: influencerData[0].skin_tone,
          bust: influencerData[0].bust_size,
          body_type: influencerData[0].body_type,
          color_palette: influencerData[0].color_palette || [],
          clothing_style_everyday: influencerData[0].clothing_style_everyday,
          eyebrow_style: influencerData[0].eyebrow_style,
          makeup_style: influencerData[0].makeup_style,
          name_first: influencerData[0].name_first,
          name_last: influencerData[0].name_last,
          visual_only: influencerData[0].visual_only,
          age: influencerData[0].age,
          lifestyle: influencerData[0].lifestyle,
        },
        scene: {
          framing: "medium_shot",
          rotation: "front",
          lighting_preset: "natural",
          scene_setting: "studio",
          pose: "standing",
          clothes: "casual",
        },
      };

      console.log("Request data:", requestData);

      // Create the task for reference image generation
      const response = await fetch(
        `${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createloraimages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(
          `Failed to create reference image generation task: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);
      toast.success(
        "Reference image generation started! Images will appear in your library when ready."
      );

      // Start auto-refresh every 60 seconds
      const interval = setInterval(() => {
        fetchLoraFiles();
      }, 60000);
      setAutoRefreshInterval(interval);

      // Stop auto-refresh after 10 minutes (600 seconds)
      setTimeout(() => {
        if (interval) {
          clearInterval(interval);
          setAutoRefreshInterval(null);
        }
      }, 600000);

      // Refresh files list to show any immediate changes
      fetchLoraFiles();
    } catch (error) {
      console.error("Error generating reference images:", error);
      toast.error(
        "Failed to start reference image generation. Please try again."
      );
    } finally {
      setIsGeneratingReferenceImages(false);
    }
  };

  // Clean up auto-refresh on component unmount
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [autoRefreshInterval]);

  // Function to reset training status
  const handleResetTrainingStatus = async () => {
    try {
      setIsResettingTraining(true);

      console.log("Resetting training status for influencer:", influencerId);

      // Update influencer's lorastatus to 0
      const influencerResponse = await fetch(
        `${config.supabase_server_url}/influencer?id=eq.${influencerId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify({
            lorastatus: 0,
          }),
        }
      );

      if (!influencerResponse.ok) {
        const errorText = await influencerResponse.text();
        console.error("Reset influencer lorastatus error:", errorText);
        throw new Error(
          `Failed to reset influencer lorastatus: ${influencerResponse.status}`
        );
      }

      // Update loras table status to "generation_reset"
      const lorasResponse = await fetch(
        `${config.supabase_server_url}/loras?user_uuid=eq.${userData.id}&model_id=eq.${influencerId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify({
            status: "generation_reset",
          }),
        }
      );

      if (!lorasResponse.ok) {
        const errorText = await lorasResponse.text();
        console.error("Reset loras status error:", errorText);
        // Don't throw error here as influencer update was successful
        console.warn(
          "Loras table update failed, but influencer status was reset successfully"
        );
      }

      console.log("Training status reset successfully");
      toast.success("Training status has been reset successfully");
      setShowResetTrainingModal(false);

      // Force loraStatus to null since we reset it
      setLoraStatus(null);

      // Refresh LoRA status to ensure UI is updated
      await fetchLoraStatus();
    } catch (error) {
      console.error("Error resetting training status:", error);
      toast.error("Failed to reset training status. Please try again.");
    } finally {
      setIsResettingTraining(false);
    }
  };

  const handleUploadFile = async () => {
    if (!uploadedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!uploadFileName.trim()) {
      toast.error("Please enter a filename");
      return;
    }

    setIsUploading(true);

    try {
      // Check if file already exists
      const fileExists = files.some((file) => file.filename === uploadFileName);
      if (fileExists) {
        toast.error("A file with this name already exists");
        setIsUploading(false);
        return;
      }

      // Upload file
      const uploadResponse = await fetch(
        `${config.backend_url}/uploadfile?user=${userData.id}&filename=models/${influencerId}/loratraining/${uploadFileName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: uploadedFile,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // Refresh files list
      await fetchLoraFiles();

      // Reset form
      setUploadedFile(null);
      setUploadFileName("");
      setUploadModal({ open: false });

      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Function to check gem cost for restart LoRA training
  const checkRestartLoraGemCost = async () => {
    try {
      setIsCheckingGems(true);
      const response = await fetch("https://api.nymia.ai/v1/getgems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          item: "loratrainer_only",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch gem cost: ${response.status}`);
      }

      const gemData = await response.json();
      return gemData;
    } catch (error) {
      console.error("Error checking gem cost:", error);
      toast.error("Failed to check gem cost. Please try again.");
      return null;
    } finally {
      setIsCheckingGems(false);
    }
  };

  // Function to proceed with restart LoRA training after credit confirmation
  const proceedWithRestartLoraTraining = async () => {
    try {
      setShowRestartGemWarning(false);
      await executeRestartLoraTraining();
    } catch (error) {
      console.error("Error in proceedWithRestartLoraTraining:", error);
      toast.error(
        "Failed to restart AI consistency training. Please try again."
      );
      setIsStartingTraining(false);
    }
  };

  // Separated restart LoRA training execution function
  const executeRestartLoraTraining = async () => {
    try {
      setIsStartingTraining(true);

      // Get userid from database
      const useridResponse = await fetch(
        `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );

      const useridData = await useridResponse.json();

      if (!useridData || useridData.length === 0) {
        throw new Error("User not found");
      }

      // Get influencer data to get the latest image number
      const influencerResponse = await fetch(
        `${config.supabase_server_url}/influencer?user_id=eq.${userData.id}&id=eq.${influencerId}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );

      const influencerData = await influencerResponse.json();

      if (!influencerData || influencerData.length === 0) {
        throw new Error("Influencer not found");
      }

      // Calculate latest image number
      let latestImageNum = influencerData[0].image_num - 1;
      if (latestImageNum === -1) {
        latestImageNum = 0;
      }

      await fetch(
        `${config.backend_url}/createtask?userid=${useridData[0].userid}&type=restartloratraining`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify({
            task: "restartloratraining",
            fromsingleimage: true,
            modelid: influencerId,
            inputimage: `/models/${influencerId}/profilepic/profilepic${latestImageNum}.png`,
          }),
        }
      );

      toast.success("AI consistency training restarted successfully");

      // Refresh files to show new training files
      await fetchLoraFiles();
    } catch (error) {
      console.error("Restart training error:", error);
      toast.error("Failed to restart AI consistency training.");
    } finally {
      setIsStartingTraining(false);
    }
  };

  // Main restart LoRA training function with credit checking
  const handleRestartLoraTraining = async () => {
    // Check gem cost before proceeding
    const gemData = await checkRestartLoraGemCost();
    if (gemData) {
      setRestartGemCostData(gemData);

      // Check if user has enough gems
      if (userData.credits < gemData.gems) {
        setShowRestartGemWarning(true);
        return;
      } else {
        // Show confirmation for gem cost
        setShowRestartGemWarning(true);
        return;
      }
    }

    // If no gem checking needed or failed, show error and don't proceed
    toast.error("Unable to verify gem cost. Please try again.");
    return;
  };

  // Function to check gem cost for create image from LoRA training
  const checkCreateImageGemCost = async () => {
    try {
      setIsCheckingGems(true);
      const response = await fetch("https://api.nymia.ai/v1/getgems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          item: "lora_image_regen",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch gem cost: ${response.status}`);
      }

      const gemData = await response.json();
      return gemData;
    } catch (error) {
      console.error("Error checking create image gem cost:", error);
      toast.error("Failed to check create image cost. Please try again.");
      return null;
    } finally {
      setIsCheckingGems(false);
    }
  };

  useEffect(() => {
    fetchLoraStatus();
  }, [fetchLoraStatus]);

  useEffect(() => {
    fetchLoraFiles();
  }, [fetchLoraFiles]);

  // Helper functions for LoRA status
  const getLoraStatusBadge = () => {
    if (isLoadingLoraStatus) {
      return (
        <Badge variant="secondary" className="animate-pulse">
          <RefreshCcw className="w-3 h-3 mr-1 animate-spin" />
          Loading...
        </Badge>
      );
    }

    if (!loraStatus) {
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-600">
          <Clock className="w-3 h-3 mr-1" />
          Not Started
        </Badge>
      );
    }

    if (loraStatus.status === "lora_provisioned") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Ready
        </Badge>
      );
    }

    // Any other status
    return (
      <Badge
        variant="secondary"
        className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
      >
        <Clock className="w-3 h-3 mr-1" />
        {loraStatus.status || "Processing"}
      </Badge>
    );
  };

  const getTrainingButtonState = () => {
    if (isLoadingLoraStatus) {
      return {
        text: "Loading...",
        disabled: true,
        onClick: () => {},
        variant: "outline" as const,
      };
    }

    if (!loraStatus) {
      return {
        text: "Start AI consistency Training",
        disabled: isStartingTraining,
        onClick: handleRestartLoraTraining,
        variant: "default" as const,
      };
    }

    if (loraStatus.status === "lora_provisioned") {
      return {
        text: "Restart AI consistency Training",
        disabled: isStartingTraining,
        onClick: handleRestartLoraTraining,
        variant: "default" as const,
      };
    }

    // Any other status - training in progress, allow reset
    return {
      text: "Training in Progress",
      disabled: false,
      onClick: () => setShowResetTrainingModal(true),
      variant: "outline" as const,
    };
  };

  // Handle create image from LoRA training image
  const handleCreateImage = async (file: LoraFile) => {
    if (file.type !== "image") {
      toast.error("Only image files can be used to create new images");
      return;
    }

    // Store the selected file for later use
    setSelectedImageForCreation(file);

    // Check gem cost before proceeding
    const gemData = await checkCreateImageGemCost();
    if (gemData) {
      setCreateImageGemCostData(gemData);

      // Check if user has enough gems
      if (userData.credits < gemData.gems) {
        setShowCreateImageGemWarning(true);
        return;
      } else {
        // Show confirmation for gem cost
        setShowCreateImageGemWarning(true);
        return;
      }
    }

    // If no gem checking needed or failed, show error and don't proceed
    toast.error("Unable to verify gem cost. Please try again.");
    return;
  };

  // Function to proceed with create image after gem confirmation
  const proceedWithCreateImage = async () => {
    try {
      setShowCreateImageGemWarning(false);
      setShowCreateImageModal(true);
    } catch (error) {
      console.error("Error in proceedWithCreateImage:", error);
      toast.error("Failed to proceed with image creation. Please try again.");
    }
  };

  // Execute create image task
  const executeCreateImage = async () => {
    if (!selectedImageForCreation) return;

    try {
      setIsCreatingImage(true);

      // Get user ID from database
      const useridResponse = await fetch(
        `${config.supabase_server_url}/user?uuid=eq.${userData.id}&select=userid`,
        {
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );

      if (!useridResponse.ok) {
        throw new Error("Failed to get user ID");
      }

      const useridData = await useridResponse.json();
      if (!useridData || useridData.length === 0) {
        throw new Error("User ID not found");
      }

      // Create the createloraimages task
      const createTaskResponse = await fetch(
        `${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createloraimages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify({
            task: "createloraimages",
            fromsingleimage: false,
            modelid: influencerId,
            inputimage: `/models/${influencerId}/loratraining/${selectedImageForCreation.filename}`,
          }),
        }
      );

      if (!createTaskResponse.ok) {
        throw new Error("Failed to create image generation task");
      }

      const taskData = await createTaskResponse.json();
      console.log("Create image task created:", taskData);

      toast.success("Image generation task started successfully!");
      setShowCreateImageModal(false);
      setSelectedImageForCreation(null);
    } catch (error) {
      console.error("Error creating image:", error);
      toast.error("Failed to start image generation task");
    } finally {
      setIsCreatingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-8 h-8 animate-spin text-ai-purple-500" />
          <p className="text-muted-foreground">
            Loading AI consistency training files...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">{getLoraStatusBadge()}</div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="min-w-[140px] sm:min-w-[160px] justify-between h-10 sm:h-11 px-3 sm:px-4 text-sm font-medium border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="hidden sm:inline">
                  {sortBy === "newest" && "Newest First"}
                  {sortBy === "oldest" && "Oldest First"}
                  {sortBy === "name" && "Sort by Name"}
                  {sortBy === "size" && "Sort by Size"}
                  {sortBy === "type" && "Sort by Type"}
                </span>
                <span className="sm:hidden">
                  {sortBy === "newest" && "Newest"}
                  {sortBy === "oldest" && "Oldest"}
                  {sortBy === "name" && "Name"}
                  {sortBy === "size" && "Size"}
                  {sortBy === "type" && "Type"}
                </span>
                <ChevronDown className="w-4 h-4 opacity-60 transition-transform duration-200 group-hover:opacity-100" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0 border-2 shadow-xl" align="end">
              <div className="grid">
                <button
                  onClick={() => setSortBy("newest")}
                  className={`flex items-center px-4 py-3 text-sm font-medium hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30 dark:hover:text-purple-300 transition-all duration-200 ${
                    sortBy === "newest"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-r-2 border-purple-500"
                      : ""
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-3 opacity-60" />
                  Newest First
                </button>
                <button
                  onClick={() => setSortBy("oldest")}
                  className={`flex items-center px-4 py-3 text-sm font-medium hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30 dark:hover:text-purple-300 transition-all duration-200 ${
                    sortBy === "oldest"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-r-2 border-purple-500"
                      : ""
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-3 opacity-60" />
                  Oldest First
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`flex items-center px-4 py-3 text-sm font-medium hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30 dark:hover:text-purple-300 transition-all duration-200 ${
                    sortBy === "name"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-r-2 border-purple-500"
                      : ""
                  }`}
                >
                  <FileImage className="w-4 h-4 mr-3 opacity-60" />
                  Sort by Name
                </button>
                <button
                  onClick={() => setSortBy("size")}
                  className={`flex items-center px-4 py-3 text-sm font-medium hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30 dark:hover:text-purple-300 transition-all duration-200 ${
                    sortBy === "size"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-r-2 border-purple-500"
                      : ""
                  }`}
                >
                  <FileImage className="w-4 h-4 mr-3 opacity-60" />
                  Sort by Size
                </button>
                <button
                  onClick={() => setSortBy("type")}
                  className={`flex items-center px-4 py-3 text-sm font-medium hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/30 dark:hover:text-purple-300 transition-all duration-200 ${
                    sortBy === "type"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-r-2 border-purple-500"
                      : ""
                  }`}
                >
                  <FileImage className="w-4 h-4 mr-3 opacity-60" />
                  Sort by Type
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="h-10 sm:h-11 px-3 sm:px-4 border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 shadow-sm hover:shadow-md group"
          >
            {sortOrder === "desc" ? (
              <SortDesc className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            ) : (
              <SortAsc className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            )}
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLoraFiles}
            disabled={isLoading}
            className="h-10 sm:h-11 px-3 sm:px-4 border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 shadow-sm hover:shadow-md group"
            title="Refresh directory"
          >
            <RotateCcw
              className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Trash Folder and Training Buttons */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Trash Folder */}
        <Card
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            isInTrash
              ? "border-red-500 bg-red-50 dark:bg-red-950/20"
              : "border-border/50 hover:border-red-300"
          }`}
          onDoubleClick={handleTrashFolderClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg transition-colors ${
                  isInTrash
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <Trash2
                  className={`w-6 h-6 ${
                    isInTrash
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
              </div>
              <div>
                <h3
                  className={`font-semibold ${
                    isInTrash
                      ? "text-red-700 dark:text-red-300"
                      : "text-foreground"
                  }`}
                >
                  Trash Folder
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isInTrash
                    ? "Currently viewing trash"
                    : "Double-click to view"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={getTrainingButtonState().onClick}
            disabled={getTrainingButtonState().disabled || isCheckingGems}
            variant={getTrainingButtonState().variant}
            size="lg"
            className={`relative overflow-hidden transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
              getTrainingButtonState().variant === "default"
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white border-0"
                : "border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950/20 dark:hover:border-orange-500"
            } min-w-[200px] sm:min-w-[220px] h-12 sm:h-14 px-4 sm:px-6 text-sm sm:text-base font-semibold`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isStartingTraining || isCheckingGems ? (
              <RefreshCcw className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 animate-spin" />
            ) : (
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 transition-transform duration-300 group-hover:rotate-180" />
            )}
            <span className="relative z-10">
              {isCheckingGems
                ? "Checking Cost..."
                : getTrainingButtonState().text}
            </span>
          </Button>

          <Button
            onClick={handleGenerateReferenceImages}
            disabled={isGeneratingReferenceImages}
            variant="outline"
            size="lg"
            className="relative overflow-hidden border-2 border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950/20 dark:hover:border-green-500 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl min-w-[200px] sm:min-w-[240px] h-12 sm:h-14 px-4 sm:px-6 text-sm sm:text-base font-semibold"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isGeneratingReferenceImages ? (
              <RefreshCcw className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 animate-spin" />
            ) : (
              <Image className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 transition-transform duration-300 group-hover:scale-110" />
            )}
            <span className="relative z-10">
              {isGeneratingReferenceImages
                ? "Generating..."
                : "Generate Reference Images"}
            </span>
          </Button>
        </div>
      </div>

      {/* Back from Trash Button */}
      {isInTrash && (
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBackFromTrash}
            size="lg"
            className="relative overflow-hidden border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/0 via-gray-500/5 to-gray-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="relative z-10">Back to Main Files</span>
          </Button>
        </div>
      )}

      {/* Files Grid */}
      {sortedFiles.length === 0 ? (
        <div className="space-y-6">
          {/* Show upload card when no files and not in trash */}
          {!isInTrash && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              <Card
                className={`group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-purple-500/30 backdrop-blur-sm bg-gradient-to-br from-purple-50/20 to-pink-50/20 dark:from-purple-950/5 dark:to-pink-950/5 cursor-pointer ${
                  dragOverUpload
                    ? "ring-4 ring-purple-500 ring-opacity-70 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 scale-105 shadow-lg"
                    : ""
                }`}
                onClick={() => setUploadModal({ open: true })}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "copy";
                  setDragOverUpload(true);
                }}
                onDragLeave={() => setDragOverUpload(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverUpload(false);
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    const file = files[0];
                    setUploadedFile(file);
                    setUploadFileName(file.name);
                    setUploadModal({ open: true });
                  }
                }}
              >
                <CardContent className="p-6 h-full">
                  <div className="flex flex-col justify-between h-full space-y-4">
                    {/* Upload Area */}
                    <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                      <div
                        className={`flex flex-col w-full h-full items-center justify-center max-h-48 min-h-40 transition-all duration-200 ${
                          dragOverUpload ? "scale-105" : ""
                        }`}
                      >
                        <Upload
                          className={`w-8 h-8 mb-2 transition-colors ${
                            dragOverUpload
                              ? "text-purple-500 dark:text-purple-400"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        />
                        <p
                          className={`text-sm font-medium transition-colors ${
                            dragOverUpload
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {dragOverUpload
                            ? "Drop file here!"
                            : "Click to upload"}
                        </p>
                        <p
                          className={`text-xs transition-colors ${
                            dragOverUpload
                              ? "text-purple-500 dark:text-purple-400"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          or drag & drop
                        </p>
                      </div>
                    </div>

                    {/* Upload Info */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          Upload File
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Add training images
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadModal({ open: true });
                            }}
                          >
                            <Upload className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowVaultSelector(true);
                            }}
                          >
                            <Folder className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Brain className="w-12 h-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  No AI consistency training files found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search"
                    : isInTrash
                    ? "No files in trash"
                    : "Upload files above or start training to see AI consistency files here"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {/* Upload Card - Only show when not in trash */}
          {!isInTrash && (
            <Card
              className={`group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-purple-500/30 backdrop-blur-sm bg-gradient-to-br from-purple-50/20 to-pink-50/20 dark:from-purple-950/5 dark:to-pink-950/5 cursor-pointer ${
                dragOverUpload
                  ? "ring-4 ring-purple-500 ring-opacity-70 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 scale-105 shadow-lg"
                  : ""
              }`}
              onClick={() => setUploadModal({ open: true })}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
                setDragOverUpload(true);
              }}
              onDragLeave={() => setDragOverUpload(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverUpload(false);
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                  const file = files[0];
                  setUploadedFile(file);
                  setUploadFileName(file.name);
                  setUploadModal({ open: true });
                }
              }}
            >
              <CardContent className="p-6 h-full">
                <div className="flex flex-col justify-between h-full space-y-4">
                  {/* Upload Area */}
                  <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                    <div
                      className={`flex flex-col w-full h-full items-center justify-center max-h-48 min-h-40 transition-all duration-200 ${
                        dragOverUpload ? "scale-105" : ""
                      }`}
                    >
                      <Upload
                        className={`w-8 h-8 mb-2 transition-colors ${
                          dragOverUpload
                            ? "text-purple-500 dark:text-purple-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <p
                        className={`text-sm font-medium transition-colors ${
                          dragOverUpload
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {dragOverUpload ? "Drop file here!" : "Click to upload"}
                      </p>
                      <p
                        className={`text-xs transition-colors ${
                          dragOverUpload
                            ? "text-purple-500 dark:text-purple-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        or drag & drop
                      </p>
                    </div>
                  </div>

                  {/* Upload Info */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg group-hover:text-purple-500 transition-colors">
                        Upload File
                      </h3>
                    </div>

                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileImage className="w-3 h-3" />
                        Add new content
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadModal({ open: true });
                        }}
                        className="relative overflow-hidden border-2 border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:border-blue-500 dark:hover:bg-blue-950/20 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        <Upload className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowVaultSelector(true);
                        }}
                        className="relative overflow-hidden border-2 border-purple-300 text-purple-600 hover:border-purple-400 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:border-purple-500 dark:hover:bg-purple-950/20 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md flex-1 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        <Folder className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                        <span className="relative z-10">Library</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {sortedFiles.map((file) => (
            <Card
              key={file.id}
              className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-ai-purple-500/20"
            >
              <CardContent className="p-6 h-full">
                <div className="flex flex-col justify-between h-full space-y-4">
                  {/* File Preview */}
                  <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                    {file.type === "image" ? (
                      <div className="relative w-full h-full group">
                        <img
                          src={file.url}
                          alt={file.filename}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => handleViewFullSize(file)}
                        />
                        <div
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
                          onClick={() => handleViewFullSize(file)}
                        >
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-black/90 rounded-full p-2 shadow-lg">
                            <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col w-full h-full items-center justify-center max-h-48 min-h-40">
                        {getFileTypeIcon(file.type)}
                        <p className="text-sm text-muted-foreground mt-2">
                          {file.type}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg group-hover:text-ai-purple-500 transition-colors truncate">
                        {file.filename}
                      </h3>
                    </div>

                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(file.lastModified)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileImage className="w-3 h-3" />
                        {formatFileSize(file.size)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(file)}
                        disabled={downloadingFiles.has(file.id)}
                        className="relative overflow-hidden border-2 border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:border-green-500 dark:hover:bg-green-950/20 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md flex-1 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {downloadingFiles.has(file.id) ? (
                          <RefreshCcw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        )}
                      </Button>
                      {file.type === "image" && !isInTrash && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateImage(file)}
                          className="relative overflow-hidden border-2 border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:border-blue-500 dark:hover:bg-blue-950/20 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          <Plus className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </Button>
                      )}
                      {isInTrash ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreFromTrash(file)}
                          disabled={movingFiles.has(file.id)}
                          className="relative overflow-hidden border-2 border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:border-green-500 dark:hover:bg-green-950/20 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          {movingFiles.has(file.id) ? (
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCw className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveToTrash(file)}
                          disabled={movingFiles.has(file.id)}
                          className="relative overflow-hidden border-2 border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:border-red-500 dark:hover:bg-red-950/20 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          {movingFiles.has(file.id) ? (
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full Size Image Modal */}
      <Dialog
        open={!!fullSizeImage}
        onOpenChange={() => setFullSizeImage(null)}
      >
        <DialogContent className="p-0 overflow-hidden bg-transparent border-none shadow-none">
          {fullSizeImage && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={fullSizeImage}
                alt="Full size preview"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <Dialog
        open={uploadModal.open}
        onOpenChange={(open) => setUploadModal({ open })}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-500" />
              Upload File to AI consistency training
            </DialogTitle>
            <DialogDescription>
              Upload a file or select from your library to add to AI consistency
              training folder for {influencerName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Selection Options */}
            <div className="grid grid-cols-2 gap-4">
              {/* Upload from Device */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-400"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept =
                    "image/*,video/*,.safetensors,.ckpt,.pt,.json,.yaml,.yml";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setUploadedFile(file);
                      setUploadFileName(file.name);
                    }
                  };
                  input.click();
                }}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Upload from Device
                    </h3>
                    <p className="text-sm text-gray-500">
                      Choose files from your computer
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Browse Library */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-400"
                onClick={() => {
                  setUploadModal({ open: false });
                  setShowVaultSelector(true);
                }}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Folder className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Browse Library
                    </h3>
                    <p className="text-sm text-gray-500">
                      Select from your image library
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* File Preview and Details */}
            {uploadedFile && (
              <div className="space-y-4 border-t pt-4">
                <Label className="text-sm font-medium">Selected File</Label>
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    {uploadedFile.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(uploadedFile)}
                        alt={uploadedFile.name}
                        className="w-full h-full object-cover rounded-md shadow-sm"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-md flex items-center justify-center">
                        <FileImage className="w-6 h-6 text-purple-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null);
                      setUploadFileName("");
                    }}
                    className="text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Filename Input */}
                <div className="space-y-2">
                  <Label htmlFor="filename" className="text-sm font-medium">
                    Filename
                  </Label>
                  <Input
                    id="filename"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    placeholder="Enter filename"
                    className="border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadedFile(null);
                  setUploadFileName("");
                  setUploadModal({ open: false });
                }}
                className="flex-1"
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadFile}
                disabled={
                  !uploadedFile || !uploadFileName.trim() || isUploading
                }
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  "Upload File"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restart LoRA Training Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showRestartGemWarning}
        onClose={() => setShowRestartGemWarning(false)}
        onConfirm={proceedWithRestartLoraTraining}
        gemCostData={restartGemCostData}
        userCredits={userData.credits}
        userId={userData.id}
        isProcessing={isStartingTraining}
        processingText="Restarting Training..."
        title="Restart AI consistency Training Cost"
        confirmButtonText={
          restartGemCostData
            ? `Confirm & Use ${restartGemCostData.gems} Gems`
            : "Confirm"
        }
      />

      {/* Create Image Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showCreateImageGemWarning}
        onClose={() => setShowCreateImageGemWarning(false)}
        onConfirm={proceedWithCreateImage}
        gemCostData={createImageGemCostData}
        userCredits={userData.credits}
        userId={userData.id}
        isProcessing={false}
        processingText=""
        title="Create Image from AI consistency Training Cost"
        confirmButtonText={
          createImageGemCostData
            ? `Confirm & Use ${createImageGemCostData.gems} Gems`
            : "Confirm"
        }
      />

      {/* Create Image Confirmation Modal */}
      <Dialog
        open={showCreateImageModal}
        onOpenChange={setShowCreateImageModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" />
              Create Image from AI consistency training
            </DialogTitle>
            <DialogDescription>
              This will create new images using the selected training image as
              input. The generated images will be added to your library.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedImageForCreation && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <img
                  src={selectedImageForCreation.url}
                  alt={selectedImageForCreation.filename}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p className="font-medium text-sm">
                    {selectedImageForCreation.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedImageForCreation.size)}
                  </p>
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>
                • The selected image will be used as input for image generation
              </p>
              <p>• Generated images will be saved to your library</p>
              <p>• This process may take some time to complete</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCreateImageModal(false)}
              disabled={isCreatingImage}
              size="lg"
              className="relative overflow-hidden border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex-1 h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500/0 via-gray-500/5 to-gray-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Cancel</span>
            </Button>
            <Button
              onClick={executeCreateImage}
              disabled={isCreatingImage}
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white border-0 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex-1 h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isCreatingImage ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white mr-2 sm:mr-3"></div>
                  <span className="relative z-10">Creating...</span>
                </>
              ) : (
                <span className="relative z-10">Create Images</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reference Image Generation Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showReferenceImageGemWarning}
        onClose={() => setShowReferenceImageGemWarning(false)}
        onConfirm={proceedWithReferenceImageGeneration}
        gemCostData={referenceImageGemCostData}
        userCredits={userData.credits}
        userId={userData.id}
        isProcessing={isGeneratingReferenceImages}
        processingText="Generating Reference Images..."
        title="Reference Image Generation Cost"
        confirmButtonText={
          referenceImageGemCostData
            ? `Confirm & Use ${referenceImageGemCostData.gems} Gems`
            : "Confirm"
        }
      />

      {/* Standard Vault Selector Modal */}
      {showVaultSelector && (
        <VaultSelector
          open={showVaultSelector}
          onOpenChange={setShowVaultSelector}
          onImageSelect={handleVaultImageSelect}
          title="Select Image from Library"
          description="Browse your library and select an image to copy to AI consistency training folder. Only completed images are shown."
        />
      )}

      {/* Reset Training Status Modal */}
      <Dialog
        open={showResetTrainingModal}
        onOpenChange={setShowResetTrainingModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Reset Training State
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Are you sure you want to reset the training status of the system?
              Only execute this, when creation is already taking more than 4
              hours.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Warning</span>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                This action will reset the training status to initial state.
                This should only be used if the training process has been stuck
                for more than 4 hours.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowResetTrainingModal(false)}
              disabled={isResettingTraining}
              size="lg"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetTrainingStatus}
              disabled={isResettingTraining}
              size="lg"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isResettingTraining ? (
                <>
                  <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Status
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

