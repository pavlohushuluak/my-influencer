import { CreditConfirmationModal } from "@/components/CreditConfirmationModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VaultSelector from "@/components/VaultSelector";
import config from "@/config/config";
import { RootState } from "@/store/store";
import {
  Download,
  ExternalLink,
  Eye,
  Folder,
  Image as ImageIcon,
  Upload,
  Users,
  Wand2,
  X,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

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
  created_at: string;
  imageUrl?: string;
}

export default function FaceSwap() {
  const userData = useSelector((state: RootState) => state.user);

  // Source Image State
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [sourceImageFromVault, setSourceImageFromVault] =
    useState<GeneratedImageData | null>(null);
  const sourceFileInputRef = useRef<HTMLInputElement>(null);

  // Target Face State
  const [targetImage, setTargetImage] = useState<File | null>(null);
  const [targetImageUrl, setTargetImageUrl] = useState<string | null>(null);
  const [targetImageFromVault, setTargetImageFromVault] =
    useState<GeneratedImageData | null>(null);
  const targetFileInputRef = useRef<HTMLInputElement>(null);

  // Vault Selector State
  const [showVaultSelector, setShowVaultSelector] = useState(false);
  const [vaultSelectorMode, setVaultSelectorMode] = useState<
    "source" | "target"
  >("source");

  // View Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewResult, setViewResult] = useState<FaceSwapResult | null>(null);

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);

  // Upload States
  const [isUploadingSource, setIsUploadingSource] = useState(false);
  const [isUploadingTarget, setIsUploadingTarget] = useState(false);

  // Results State
  const [faceSwapResults, setFaceSwapResults] = useState<FaceSwapResult[]>([]);

  // Drag and Drop States
  const [dragOverSource, setDragOverSource] = useState(false);
  const [dragOverTarget, setDragOverTarget] = useState(false);

  // Credit Logic States
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [gemCostData, setGemCostData] = useState<any>(null);
  const [isCheckingCredits, setIsCheckingCredits] = useState(false);

  // Face Swap Result Interface
  interface FaceSwapResult {
    id: string;
    sourceUrl: string;
    targetUrl: string;
    resultUrl: string;
    status: "processing" | "completed" | "failed";
    progress: number;
    createdAt: Date;
    // Add fields for download API
    systemFilename?: string;
    userFilename?: string | null;
  }

  // Handle file upload for source image
  const handleSourceFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setIsUploadingSource(true);
        try {
          // Upload to vault and get the URL
          const uploadedUrl = await uploadImageToVault(file);
          if (uploadedUrl) {
            setSourceImage(file);
            setSourceImageUrl(uploadedUrl); // Use the uploaded URL instead of local object URL
            setSourceImageFromVault(null);
            toast.success("Source image uploaded successfully");
          }
        } finally {
          setIsUploadingSource(false);
        }
      } else {
        toast.error("Please select a valid image file");
      }
    }
  };

  // Handle file upload for target image
  const handleTargetFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setIsUploadingTarget(true);
        try {
          // Upload to vault and get the URL
          const uploadedUrl = await uploadImageToVault(file);
          if (uploadedUrl) {
            setTargetImage(file);
            setTargetImageUrl(uploadedUrl); // Use the uploaded URL instead of local object URL
            setTargetImageFromVault(null);
            toast.success("Target face uploaded successfully");
          }
        } finally {
          setIsUploadingTarget(false);
        }
      } else {
        toast.error("Please select a valid image file");
      }
    }
  };

  // Handle drag and drop for source
  const handleSourceDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setDragOverSource(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setIsUploadingSource(true);
        try {
          // Upload to vault and get the URL
          const uploadedUrl = await uploadImageToVault(file);
          if (uploadedUrl) {
            setSourceImage(file);
            setSourceImageUrl(uploadedUrl); // Use the uploaded URL instead of local object URL
            setSourceImageFromVault(null);
            toast.success("Source image uploaded successfully");
          }
        } finally {
          setIsUploadingSource(false);
        }
      } else {
        toast.error("Please drop a valid image file");
      }
    }
  };

  // Handle drag and drop for target
  const handleTargetDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setDragOverTarget(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        setIsUploadingTarget(true);
        try {
          // Upload to vault and get the URL
          const uploadedUrl = await uploadImageToVault(file);
          if (uploadedUrl) {
            setTargetImage(file);
            setTargetImageUrl(uploadedUrl); // Use the uploaded URL instead of local object URL
            setTargetImageFromVault(null);
            toast.success("Target face uploaded successfully");
          }
        } finally {
          setIsUploadingTarget(false);
        }
      } else {
        toast.error("Please drop a valid image file");
      }
    }
  };

  // Handle vault image selection
  const handleVaultImageSelect = (image: GeneratedImageData) => {
    if (vaultSelectorMode === "source") {
      setSourceImageFromVault(image);
      setSourceImage(null);
      setSourceImageUrl(null);
      toast.success("Source image selected from library");
    } else {
      setTargetImageFromVault(image);
      setTargetImage(null);
      setTargetImageUrl(null);
      toast.success("Target face selected from library");
    }
    setShowVaultSelector(false);
  };

  // Open vault selector
  const openVaultSelector = (mode: "source" | "target") => {
    setVaultSelectorMode(mode);
    setShowVaultSelector(true);
  };

  // Handle image download using the correct API
  const handleDownloadImage = async (result: FaceSwapResult) => {
    try {
      if (!result.systemFilename) {
        toast.error("Unable to download: file information not available");
        return;
      }

      const folder =
        result.userFilename === "" || result.userFilename === null
          ? "output"
          : `vault/${result.userFilename}`;
      const filename = `${folder}/${result.systemFilename}`;

      const response = await fetch(`${config.backend_url}/downloadfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          filename: filename,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `faceswap_${result.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      toast.success("Download completed successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  // Handle view image
  const handleViewImage = (result: FaceSwapResult) => {
    setViewResult(result);
    setShowViewModal(true);
  };

  // Upload image to vault
  const uploadImageToVault = async (file: File): Promise<string | null> => {
    if (!userData.id) {
      toast.error("User not authenticated");
      return null;
    }

    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop() || "jpg";
      const filename = `upload_${timestamp}.${fileExtension}`;

      // Upload file using the correct API
      const uploadResponse = await fetch(
        `${config.backend_url}/uploadfile?user=${userData.id}&filename=upload/${filename}`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: file,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      // Return the uploaded image URL
      const imageUrl = `${config.data_url}/${userData.id}/upload/${filename}`;
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  // Clear source image
  const clearSourceImage = () => {
    // No need to revoke URL since we're using server URLs now
    setSourceImage(null);
    setSourceImageUrl(null);
    setSourceImageFromVault(null);
    if (sourceFileInputRef.current) {
      sourceFileInputRef.current.value = "";
    }
  };

  // Clear target image
  const clearTargetImage = () => {
    // No need to revoke URL since we're using server URLs now
    setTargetImage(null);
    setTargetImageUrl(null);
    setTargetImageFromVault(null);
    if (targetFileInputRef.current) {
      targetFileInputRef.current.value = "";
    }
  };

  // Get display URL for source image
  const getSourceDisplayUrl = () => {
    if (sourceImageUrl) return sourceImageUrl;
    if (sourceImageFromVault) {
      const folder =
        sourceImageFromVault.user_filename === "" ||
        sourceImageFromVault.user_filename === null
          ? "output"
          : `vault/${sourceImageFromVault.user_filename}`;
      return `${config.data_url}/${userData.id}/${folder}/${sourceImageFromVault.system_filename}`;
    }
    return null;
  };

  // Get display URL for target image
  const getTargetDisplayUrl = () => {
    if (targetImageUrl) return targetImageUrl;
    if (targetImageFromVault) {
      const folder =
        targetImageFromVault.user_filename === "" ||
        targetImageFromVault.user_filename === null
          ? "output"
          : `vault/${targetImageFromVault.user_filename}`;
      return `${config.data_url}/${userData.id}/${folder}/${targetImageFromVault.system_filename}`;
    }
    return null;
  };

  // Poll for face swap results
  const pollForFaceSwapResult = async (
    taskId: string,
    result: FaceSwapResult
  ) => {
    const pollInterval = setInterval(async () => {
      try {
        const imagesResponse = await fetch(
          `${config.supabase_server_url}/generated_images?task_id=eq.${taskId}`,
          {
            headers: {
              Authorization: "Bearer WeInfl3nc3withAI",
            },
          }
        );

        const imagesData = await imagesResponse.json();

        if (
          imagesData.length > 0 &&
          imagesData[0].generation_status === "completed" &&
          imagesData[0].system_filename
        ) {
          const completedImage = imagesData[0];
          const resultUrl = `${config.data_url}/${userData.id}/${
            completedImage.user_filename === "" ||
            completedImage.user_filename === null
              ? "output"
              : "vault/" + completedImage.user_filename
          }/${completedImage.system_filename}`;

          // Update the result
          setFaceSwapResults((prev) =>
            prev.map((r) =>
              r.id === taskId
                ? {
                    ...r,
                    status: "completed",
                    progress: 100,
                    resultUrl,
                    systemFilename: completedImage.system_filename,
                    userFilename: completedImage.user_filename,
                  }
                : r
            )
          );

          clearInterval(pollInterval);
          setIsProcessing(false);
          toast.success("Face swap completed successfully!");
        } else if (
          imagesData.length > 0 &&
          imagesData[0].generation_status === "failed"
        ) {
          // Handle failure
          setFaceSwapResults((prev) =>
            prev.map((r) =>
              r.id === taskId
                ? {
                    ...r,
                    status: "failed",
                    progress: 0,
                  }
                : r
            )
          );

          clearInterval(pollInterval);
          setIsProcessing(false);
          toast.error("Face swap failed. Please try again.");
        } else {
          // Update progress (simulate based on time elapsed)
          const elapsed = Date.now() - result.createdAt.getTime();
          const estimatedProgress = Math.min((elapsed / 30000) * 100, 95); // Assume 30 seconds total

          setFaceSwapResults((prev) =>
            prev.map((r) =>
              r.id === taskId ? { ...r, progress: estimatedProgress } : r
            )
          );
        }
      } catch (error) {
        console.error("Error polling for face swap result:", error);
        clearInterval(pollInterval);
        setIsProcessing(false);
        toast.error("Failed to check face swap status");
      }
    }, 1000); // Poll every 1 second
  };

  // Handle face swap processing
  const checkGemCost = async () => {
    try {
      const response = await fetch(`${config.backend_url}/getgems`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          item: "faceswap",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch credit cost");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking credit cost:", error);
      throw error;
    }
  };

  const proceedWithFaceSwap = async () => {
    setIsProcessing(true);
    try {
      // Get userid for API request
      const useridResponse = await fetch(
        `${config.supabase_server_url}/user?uuid=eq.${userData.id}&select=userid`,
        {
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
            "Content-Type": "application/json",
          },
        }
      );

      const useridData = await useridResponse.json();
      if (!useridData || useridData.length === 0) {
        throw new Error("User ID not found");
      }

      // Prepare request data
      const requestData = {
        task: "faceswap",
        reference_image: getSourceDisplayUrl()!,
        face_image: getTargetDisplayUrl()!,
      };

      // Create face swap task
      const response = await fetch(
        `${config.backend_url}/createtask?userid=${useridData[0].userid}&type=faceswap`,
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const taskId = result.id;

      // Add new face swap job to results
      const newResult: FaceSwapResult = {
        id: taskId,
        sourceUrl: getSourceDisplayUrl()!,
        targetUrl: getTargetDisplayUrl()!,
        resultUrl: "",
        status: "processing",
        progress: 0,
        createdAt: new Date(),
      };

      setFaceSwapResults((prev) => [newResult, ...prev]);

      // Start polling for results
      pollForFaceSwapResult(taskId, newResult);

      toast.success("Face swap initiated successfully!");
    } catch (error) {
      console.error("Error processing face swap:", error);
      toast.error("Failed to process face swap");
      setIsProcessing(false);
    }
  };

  const handleFaceSwap = async () => {
    if (!getSourceDisplayUrl() || !getTargetDisplayUrl()) {
      toast.error("Please select both source image and target face");
      return;
    }

    setIsCheckingCredits(true);
    try {
      const costData = await checkGemCost();
      setGemCostData(costData);
      setShowCreditModal(true);
    } catch (error) {
      console.error("Error checking credit cost:", error);
      toast.error("Unable to verify credit cost. Please try again.");
    } finally {
      setIsCheckingCredits(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-border/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Face Swap Studio
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Seamlessly swap faces between images with our advanced AI technology
          </p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Source Image Upload */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-dashed border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="flex items-center justify-center gap-2 text-xl font-semibold text-purple-700 dark:text-purple-300">
                    <ImageIcon className="w-6 h-6" />
                    Source Image
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    The main image where the face will be replaced
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 cursor-pointer hover:border-purple-400 ${
                      dragOverSource
                        ? "border-purple-500 bg-purple-100/50 dark:bg-purple-900/30 scale-105"
                        : "border-purple-300 dark:border-purple-700 hover:bg-purple-50/30 dark:hover:bg-purple-900/20"
                    }`}
                    onClick={() => sourceFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverSource(true);
                    }}
                    onDragLeave={() => setDragOverSource(false)}
                    onDrop={handleSourceDrop}
                  >
                    {isUploadingSource ? (
                      <div className="w-full h-48 flex items-center justify-center bg-purple-100/50 dark:bg-purple-900/30 rounded-lg">
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-purple-600 dark:text-purple-400 font-medium">
                            Uploading...
                          </p>
                        </div>
                      </div>
                    ) : getSourceDisplayUrl() ? (
                      <div className="relative group">
                        <img
                          src={getSourceDisplayUrl()!}
                          alt="Source"
                          className="w-full h-full object-cover rounded-lg shadow-md"
                          onError={(e) => {
                            // Fallback for files that might not be accessible via CDN
                            const target = e.target as HTMLImageElement;
                            if (
                              sourceImageFromVault &&
                              !target.src.includes("gpustack-images")
                            ) {
                              // Try original storage URL as fallback
                              const folder =
                                sourceImageFromVault.user_filename === "" ||
                                sourceImageFromVault.user_filename === null
                                  ? "output"
                                  : `vault/${sourceImageFromVault.user_filename}`;
                              target.src = `https://storage.googleapis.com/gpustack-images/${userData.id}/${folder}/${sourceImageFromVault.system_filename}`;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearSourceImage();
                            }}
                            className="bg-white/90 hover:bg-white text-black"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-base sm:text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">
                            Drop your source image here
                          </p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse files
                          </p>
                        </div>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={sourceFileInputRef}
                      onChange={handleSourceFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => openVaultSelector("source")}
                      className="flex-1 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      Import from Library
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Target Face Upload */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="flex items-center justify-center gap-2 text-xl font-semibold text-blue-700 dark:text-blue-300">
                    <Users className="w-6 h-6" />
                    Target Face
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    The face that will be swapped into the source image
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 cursor-pointer hover:border-blue-400 ${
                      dragOverTarget
                        ? "border-blue-500 bg-blue-100/50 dark:bg-blue-900/30 scale-105"
                        : "border-blue-300 dark:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/20"
                    }`}
                    onClick={() => targetFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverTarget(true);
                    }}
                    onDragLeave={() => setDragOverTarget(false)}
                    onDrop={handleTargetDrop}
                  >
                    {isUploadingTarget ? (
                      <div className="w-full h-48 flex items-center justify-center bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-blue-600 dark:text-blue-400 font-medium">
                            Uploading...
                          </p>
                        </div>
                      </div>
                    ) : getTargetDisplayUrl() ? (
                      <div className="relative group">
                        <img
                          src={getTargetDisplayUrl()!}
                          alt="Target"
                          className="w-full h-full object-cover rounded-lg shadow-md"
                          onError={(e) => {
                            // Fallback for files that might not be accessible via CDN
                            const target = e.target as HTMLImageElement;
                            if (
                              targetImageFromVault &&
                              !target.src.includes("gpustack-images")
                            ) {
                              // Try original storage URL as fallback
                              const folder =
                                targetImageFromVault.user_filename === "" ||
                                targetImageFromVault.user_filename === null
                                  ? "output"
                                  : `vault/${targetImageFromVault.user_filename}`;
                              target.src = `https://storage.googleapis.com/gpustack-images/${userData.id}/${folder}/${targetImageFromVault.system_filename}`;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearTargetImage();
                            }}
                            className="bg-white/90 hover:bg-white text-black"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-base sm:text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">
                            Drop your target face here
                          </p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse files
                          </p>
                        </div>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={targetFileInputRef}
                      onChange={handleTargetFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => openVaultSelector("target")}
                      className="flex-1 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      Import from Library
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Process Button */}
            <div className="mt-8 text-center px-4">
              <Button
                onClick={handleFaceSwap}
                disabled={
                  !getSourceDisplayUrl() ||
                  !getTargetDisplayUrl() ||
                  isProcessing ||
                  isCheckingCredits
                }
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing || isCheckingCredits ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    <span className="hidden sm:inline">
                      {isCheckingCredits
                        ? "Checking Credits..."
                        : "Processing Face Swap..."}
                    </span>
                    <span className="sm:hidden">
                      {isCheckingCredits ? "Checking..." : "Processing..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    <span className="hidden sm:inline">Create Face Swap</span>
                    <span className="sm:hidden">Create</span>
                  </>
                )}
              </Button>

              {(!getSourceDisplayUrl() || !getTargetDisplayUrl()) && (
                <p className="text-sm text-muted-foreground mt-3 px-4">
                  Please upload both source image and target face to proceed
                </p>
              )}
            </div>

            {/* Results Section */}
            {faceSwapResults.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent px-4">
                  Face Swap Results
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {faceSwapResults.map((result) => (
                    <Card
                      key={result.id}
                      className="overflow-hidden group hover:shadow-xl transition-all duration-300"
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-square">
                          {result.status === "completed" && result.resultUrl ? (
                            <img
                              src={result.resultUrl}
                              alt="Face swap result"
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                              onClick={() => handleViewImage(result)}
                            />
                          ) : result.status === "failed" ? (
                            <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center">
                              <div className="text-center">
                                <X className="w-12 h-12 text-red-500 mx-auto mb-2" />
                                <p className="text-red-600 dark:text-red-400 font-medium">
                                  Failed
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">
                                  Processing
                                </p>
                                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-auto">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${result.progress}%` }}
                                  />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {Math.round(result.progress)}%
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="absolute top-3 right-3">
                            <Badge
                              variant={
                                result.status === "completed"
                                  ? "default"
                                  : result.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="shadow-lg"
                            >
                              {result.status === "completed"
                                ? "Completed"
                                : result.status === "failed"
                                ? "Failed"
                                : "Processing"}
                            </Badge>
                          </div>
                        </div>

                        {/* Preview Section */}
                        <div className="p-4">
                          <div className="flex flex-col sm:items-center sm:justify-between gap-3 mb-3">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Created: {result.createdAt.toLocaleTimeString()}
                            </span>
                            {result.status === "completed" && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewImage(result)}
                                  className="flex-1 sm:flex-none hover:bg-purple-50 dark:hover:bg-purple-900/30"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadImage(result)}
                                  className="flex-1 sm:flex-none hover:bg-purple-50 dark:hover:bg-purple-900/30"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Source and Target Preview */}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Source
                              </p>
                              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                                <img
                                  src={result.sourceUrl}
                                  alt="Source"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="flex items-center px-1">
                              <Wand2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Target
                              </p>
                              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                                <img
                                  src={result.targetUrl}
                                  alt="Target"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vault Selector Modal */}
      <VaultSelector
        open={showVaultSelector}
        onOpenChange={setShowVaultSelector}
        onImageSelect={handleVaultImageSelect}
        title={`Select ${
          vaultSelectorMode === "source" ? "Source Image" : "Target Face"
        } from Library`}
        description={`Choose an image from your library to use as the ${
          vaultSelectorMode === "source" ? "source image" : "target face"
        }`}
      />

      {/* View Image Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              Face Swap Result
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              {viewResult && (
                <img
                  src={viewResult.resultUrl}
                  alt="Face swap result"
                  className="w-full h-auto max-h-[60vh] sm:max-h-[70vh] object-contain"
                  onError={(e) => {
                    // Fallback for CDN issues
                    const target = e.target as HTMLImageElement;
                    console.error(
                      "Failed to load image:",
                      viewResult.resultUrl
                    );
                    toast.error("Failed to load image");
                  }}
                />
              )}

              {/* Action buttons overlay */}
              {viewResult && (
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownloadImage(viewResult)}
                    className="bg-white/90 hover:bg-white text-black shadow-lg text-xs sm:text-sm"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">Save</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(viewResult.resultUrl, "_blank")}
                    className="bg-white/90 hover:bg-white text-black shadow-lg text-xs sm:text-sm"
                  >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Open in New Tab</span>
                    <span className="sm:hidden">Open</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        onConfirm={() => {
          proceedWithFaceSwap();
          setShowCreditModal(false);
        }}
        gemCostData={gemCostData}
        userCredits={userData.credits}
        userId={userData.id}
        isProcessing={isCheckingCredits}
        processingText="Checking credit cost..."
        confirmButtonText="Create Face Swap"
        title="Face Swap Credit Check"
        numberOfItems={1}
        itemType="face swap"
      />
    </div>
  );
}
