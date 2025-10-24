import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import VaultSelector from "@/components/VaultSelector";
import { config } from "@/config/config";
import { RootState } from "@/store/store";
// Pintura Editor imports
import { getEditorDefaults } from "@pqina/pintura";
import "@pqina/pintura/pintura.css";
import { PinturaEditor } from "@pqina/react-pintura";
import {
  ChevronRight,
  Download,
  Edit,
  Edit3,
  Eraser,
  Eye,
  FileText,
  FolderDown,
  FolderOpen,
  Image,
  Lightbulb,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface SelectedImage {
  id: string;
  url: string;
  name: string;
  type: "library" | "upload";
  referenceName?: string; // User-defined reference name like "room", "coke", etc.
}

interface ImageData {
  id: string;
  system_filename: string;
  user_filename: string | null;
  file_path: string;
  user_notes?: string;
  user_tags?: string[];
  rating?: number;
  favorite?: boolean;
  created_at: string;
  file_size_bytes: number;
  image_format: string;
  file_type: string;
  originalUrl?: string;
}

export default function Composer() {
  const userData = useSelector((state: RootState) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  // State management
  const [canvasImage, setCanvasImage] = useState<string | null>(null);
  const [canvasImageName, setCanvasImageName] =
    useState<string>("Canvas Image");
  const [referenceImages, setReferenceImages] = useState<
    (SelectedImage | null)[]
  >(Array(5).fill(null));
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(
    null
  );
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [editingReferenceName, setEditingReferenceName] = useState<
    number | null
  >(null);

  // Canvas resizing state
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [showLibrary, setShowLibrary] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showInspirationHubModal, setShowInspirationHubModal] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<SelectedImage | null>(null);

  // Pintura Editor state
  const [showProfessionalEditor, setShowProfessionalEditor] = useState(false);
  const [editorImageSrc, setEditorImageSrc] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const editorRef = useRef<any>(null);

  // Editor defaults
  const editorDefaults = getEditorDefaults();

  // Prompt and generation states
  const [prompt, setPrompt] = useState("");
  const [editingModel, setEditingModel] = useState("Gemini Flash 2.5");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGeneratedImageDialog, setShowGeneratedImageDialog] =
    useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );

  // Library states (removed - now handled by VaultSelector)

  // Cleanup blob URLs on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup canvas blob URL
      if (canvasImage && canvasImage.startsWith("blob:")) {
        URL.revokeObjectURL(canvasImage);
        console.log(
          "🧹 CLEANUP: Revoked canvas blob URL on unmount:",
          canvasImage
        );
      }
      // Cleanup reference blob URLs
      referenceImages.forEach((refImage, index) => {
        if (refImage && refImage.url.startsWith("blob:")) {
          URL.revokeObjectURL(refImage.url);
          console.log(
            `🧹 CLEANUP: Revoked reference blob URL ${index} on unmount:`,
            refImage.url
          );
        }
      });
      // Cleanup editor image source
      if (editorImageSrc && editorImageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(editorImageSrc);
        console.log(
          "🧹 CLEANUP: Revoked editor image source blob URL on unmount:",
          editorImageSrc
        );
      }
    };
  }, [canvasImage, referenceImages, editorImageSrc]);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setIsLoadingImage(true);
      const loadingToast = toast.loading(
        "Uploading image to secure library...",
        {
          description: "Please wait while we upload your image",
          duration: Infinity,
        }
      );

      try {
        console.log("📤 DEBUG: Starting file upload to vault:", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });

        // Upload the file to vault first
        const vaultUrl = await uploadImageToVault(
          file,
          file.name.replace(/[^a-zA-Z0-9]/g, "_"),
          "composer_upload"
        );

        console.log("✅ DEBUG: File uploaded to vault successfully:", vaultUrl);

        const newImage: SelectedImage = {
          id: `upload-${Date.now()}`,
          url: vaultUrl,
          name: file.name,
          type: "upload",
        };

        if (currentImageIndex !== null) {
          // Add to reference images
          const updatedImages = [...referenceImages];
          updatedImages[currentImageIndex] = newImage;
          setReferenceImages(updatedImages);
          console.log(
            "📝 DEBUG: Added to reference images at index:",
            currentImageIndex
          );
        } else {
          // Set as canvas image
          setCanvasImage(vaultUrl);
          setCanvasImageName(file.name);
          console.log("🎨 DEBUG: Set as canvas image:", file.name);
        }

        toast.dismiss(loadingToast);
        toast.success("Image uploaded to vault successfully");
      } catch (error) {
        console.error("Error uploading image to vault:", error);
        toast.dismiss(loadingToast);
        toast.error(
          `Failed to upload image: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsLoadingImage(false);
        setShowUpload(false); // Auto-close upload dialog
        setCurrentImageIndex(null);

        // Reset file input to allow re-uploading the same file if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        console.log("🔄 DEBUG: Upload states and file input reset");
      }
    },
    [currentImageIndex, referenceImages]
  );

  // Drag state for visual feedback
  const [isDragging, setIsDragging] = useState(false);

  // Handle drag and drop
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    // Only set dragging to false if we're leaving the canvas area completely
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Handle actions
  const handleAction = (action: string) => {
    switch (action) {
      case "new":
        // Clean up existing canvas blob URL
        if (canvasImage && canvasImage.startsWith("blob:")) {
          URL.revokeObjectURL(canvasImage);
          console.log("🧹 DEBUG: Revoked canvas blob URL:", canvasImage);
        }
        // Clean up all reference blob URLs
        referenceImages.forEach((refImage, index) => {
          if (refImage && refImage.url.startsWith("blob:")) {
            URL.revokeObjectURL(refImage.url);
            console.log(
              `🧹 DEBUG: Revoked reference blob URL ${index}:`,
              refImage.url
            );
          }
        });
        setCanvasImage(null);
        setCanvasImageName("Canvas Image");
        setReferenceImages(Array(5).fill(null));
        console.log("🆕 DEBUG: All images cleared and blob URLs revoked");
        toast.success("Canvas cleared");
        break;
      case "wipe":
        // Clean up existing canvas blob URL
        if (canvasImage && canvasImage.startsWith("blob:")) {
          URL.revokeObjectURL(canvasImage);
          console.log("🧹 DEBUG: Revoked canvas blob URL:", canvasImage);
        }
        setCanvasImage(null);
        setCanvasImageName("Canvas Image");
        console.log("🗑️ DEBUG: Canvas wiped and blob URL revoked");
        toast.success("Canvas wiped");
        break;
      case "load":
        setCurrentImageIndex(null);
        setShowLoadDialog(true);
        break;
      case "save":
        if (canvasImage) {
          toast.success("Canvas image saved to reference");
        } else {
          toast.error("No canvas image to save");
        }
        break;
      default:
        break;
    }
  };

  // Handle reference image click
  const handleReferenceImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowLoadDialog(true);
  };

  // Remove reference image
  const removeReferenceImage = (index: number) => {
    const updatedImages = [...referenceImages];
    const imageToRemove = updatedImages[index];

    // Clean up blob URL to prevent memory leaks
    if (imageToRemove && imageToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.url);
      console.log(
        "🧹 DEBUG: Revoked blob URL for removed reference image:",
        imageToRemove.url
      );
    }

    updatedImages[index] = null;
    setReferenceImages(updatedImages);

    console.log(
      `🗑️ DEBUG: Removed reference image at index ${index}:`,
      imageToRemove?.name || "unknown"
    );
  };

  // Handle replacing canvas with generated image
  const handleReplaceCanvas = () => {
    if (generatedImageUrl) {
      setCanvasImage(generatedImageUrl);
      setCanvasImageName("Generated Composition");
      setShowGeneratedImageDialog(false);
      setGeneratedImageUrl(null);
      toast.success("Canvas replaced with generated image!");
    }
  };

  // Handle cancelling generated image
  const handleCancelGenerated = () => {
    setShowGeneratedImageDialog(false);
    setGeneratedImageUrl(null);
  };

  // Handle generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("Generating composition...", {
      description: "Creating your AI composition",
      duration: Infinity,
    });

    try {
      // Get user ID
      const useridResponse = await fetch(
        `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
        }
      );
      const useridData = await useridResponse.json();

      // Process prompt and prepare images based on selected model
      let processedPrompt = prompt;
      let referenceUrls: string[] = [];
      let referenceTags: string[] = [];

      // Model-specific image handling with detailed debugging
      console.log(
        "🔍 DEBUG: Model-specific image selection for:",
        editingModel
      );
      console.log("🔍 DEBUG: Canvas image:", canvasImage);
      console.log("🔍 DEBUG: Reference images:", referenceImages);

      if (editingModel === "Gemini Flash 2.5") {
        // Gemini Flash 2.5: Include ALL images (Canvas + all reference images)
        console.log("🔍 DEBUG: Gemini Flash 2.5 - Including ALL images");
        if (canvasImage) {
          console.log("🔍 DEBUG: Adding canvas image URL:", canvasImage);
          referenceUrls.push(canvasImage);
          referenceTags.push("canvas");
        }
        // Add all reference images (exclude blob URLs from uploads)
        referenceImages.forEach((refImage, index) => {
          if (refImage) {
            console.log(`🔍 DEBUG: Processing reference image ${index + 1}:`, {
              url: refImage.url,
              type: refImage.type,
              name: refImage.name,
              referenceName: refImage.referenceName,
            });

            // Skip blob URLs (uploaded files not yet saved to backend)
            if (refImage.url.startsWith("blob:")) {
              console.warn(
                `⚠️ WARNING: Skipping blob URL for reference image ${
                  index + 1
                } (${refImage.name}) - upload to library first`
              );
              toast.warning(
                `Reference image "${refImage.name}" is a local upload and will be skipped. Save to library first.`
              );
            } else {
              referenceUrls.push(refImage.url);
              referenceTags.push(refImage.referenceName || `ref${index + 1}`);
            }
          }
        });
      } else if (editingModel === "Bytedance Seedit v3") {
        // Bytedance Seedit: Only Canvas image
        console.log("🔍 DEBUG: Bytedance Seedit v3 - Only Canvas image");
        if (canvasImage) {
          if (canvasImage.startsWith("blob:")) {
            console.warn(
              "⚠️ WARNING: Canvas image is a blob URL - save to library first"
            );
            toast.warning(
              "Canvas image is a local upload and cannot be processed. Save to library first."
            );
          } else {
            console.log("🔍 DEBUG: Adding canvas image URL:", canvasImage);
            referenceUrls.push(canvasImage);
            referenceTags.push("canvas");
          }
        }
      } else if (editingModel === "Runway Gen4") {
        // Runway: Maximum 3 images (Canvas + up to 2 reference images)
        console.log("🔍 DEBUG: Runway Gen4 - Maximum 3 images");
        if (canvasImage) {
          if (canvasImage.startsWith("blob:")) {
            console.warn(
              "⚠️ WARNING: Canvas image is a blob URL - save to library first"
            );
            toast.warning(
              "Canvas image is a local upload and cannot be processed. Save to library first."
            );
          } else {
            console.log("🔍 DEBUG: Adding canvas image URL:", canvasImage);
            referenceUrls.push(canvasImage);
            referenceTags.push("canvas");
          }
        }
        // Add up to 2 reference images (excluding blob URLs)
        let imageCount =
          canvasImage && !canvasImage.startsWith("blob:") ? 1 : 0;
        for (const refImage of referenceImages) {
          if (refImage && imageCount < 3) {
            console.log(
              `🔍 DEBUG: Processing reference image (count: ${imageCount}):`,
              {
                url: refImage.url,
                type: refImage.type,
                name: refImage.name,
                referenceName: refImage.referenceName,
              }
            );

            // Skip blob URLs (uploaded files not yet saved to backend)
            if (refImage.url.startsWith("blob:")) {
              console.warn(
                `⚠️ WARNING: Skipping blob URL for reference image (${refImage.name}) - upload to library first`
              );
              toast.warning(
                `Reference image "${refImage.name}" is a local upload and will be skipped. Save to library first.`
              );
            } else {
              referenceUrls.push(refImage.url);
              referenceTags.push(refImage.referenceName || `ref${imageCount}`);
              imageCount++;
            }
          }
        }
      }

      console.log(
        "🔍 DEBUG: Final reference URLs being sent to backend:",
        referenceUrls
      );
      console.log(
        "🔍 DEBUG: Final reference tags being sent to backend:",
        referenceTags
      );

      // Additional validation: check for any blob URLs in the final list
      referenceUrls.forEach((url, index) => {
        if (url.startsWith("blob:")) {
          console.error(
            `❌ ERROR: Blob URL detected in referenceUrls[${index}]:`,
            url
          );
        } else if (url.startsWith("http")) {
          console.log(`✅ VALID: HTTP URL at index ${index}:`, url);
        } else {
          console.warn(`⚠️ UNKNOWN: Non-HTTP URL at index ${index}:`, url);
        }
      });

      // Handle @canvas reference in prompt
      if (prompt.includes("@canvas")) {
        if (canvasImage) {
          processedPrompt = processedPrompt.replace(/@canvas/g, "canvas image");
        } else {
          processedPrompt = processedPrompt.replace(/@canvas/g, "");
          toast.warning(
            "Canvas image not available, @canvas reference removed from prompt"
          );
        }
      }

      // Handle @reference names in prompt
      referenceImages.forEach((refImage, index) => {
        if (refImage && refImage.referenceName) {
          const refPattern = new RegExp(`@${refImage.referenceName}`, "g");
          if (prompt.includes(`@${refImage.referenceName}`)) {
            processedPrompt = processedPrompt.replace(
              refPattern,
              `${refImage.referenceName} image`
            );
          }
        }
      });

      // Prepare synthesis payload with additional fields
      const synthesisPayload = {
        prompt: processedPrompt,
        aspect_ratio: aspectRatio,
        reference_tags: referenceTags,
        reference_images: referenceUrls,
        edit_using: editingModel,
        aspect_ratio_setting: aspectRatio,
      };

      console.log("Synthesis payload:", synthesisPayload);

      // Create synthesis task (exact URL format from working Compose.tsx)
      const taskResponse = await fetch(
        `${config.backend_url}/createtask?userid=${useridData[0].userid}&type=synthesize_image`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer WeInfl3nc3withAI",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(synthesisPayload),
        }
      );

      if (!taskResponse.ok) {
        const errorText = await taskResponse.text();
        console.error("❌ Task creation failed:", {
          status: taskResponse.status,
          statusText: taskResponse.statusText,
          errorText,
        });
        throw new Error(
          `Failed to create synthesis task: ${taskResponse.status} ${taskResponse.statusText} - ${errorText}`
        );
      }

      const taskResult = await taskResponse.json();
      console.log("✅ Synthesis task created successfully:", taskResult);

      // Validate task result
      if (!taskResult.id) {
        console.error("❌ Task result missing ID:", taskResult);
        throw new Error("Invalid task response - missing task ID");
      }

      // Poll for task completion (exact format from working Compose.tsx)
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes with 5-second intervals

      const pollForCompletion = async (): Promise<any> => {
        attempts++;

        try {
          // Check generated_images table for the result using task_id
          const imagesResponse = await fetch(
            `${config.supabase_server_url}/generated_images?task_id=eq.${taskResult.id}`,
            {
              headers: {
                Authorization: "Bearer WeInfl3nc3withAI",
              },
            }
          );

          if (!imagesResponse.ok) {
            console.error(`❌ Polling failed at attempt ${attempts}:`, {
              status: imagesResponse.status,
              statusText: imagesResponse.statusText,
            });
            throw new Error(
              `Failed to check generated images: ${imagesResponse.status} ${imagesResponse.statusText}`
            );
          }

          const imagesData = await imagesResponse.json();
          console.log(
            `🔄 Polling attempt ${attempts}/${maxAttempts} - Generated images data:`,
            imagesData
          );

          // Analyze response and handle different states
          if (imagesData.length === 0) {
            console.log(
              `⏳ No task data yet (attempt ${attempts}/${maxAttempts})`
            );
            if (attempts >= maxAttempts) {
              console.error(
                "❌ Timeout: No task found in database after maximum attempts"
              );
              toast.dismiss(loadingToast);
              toast.error(
                "Generation timeout: Task not found in database. Please try again."
              );
              return;
            }
          } else {
            const taskData = imagesData[0];
            console.log(
              `📊 Task status: ${taskData.generation_status} (attempt ${attempts}/${maxAttempts})`
            );

            if (
              taskData.generation_status === "completed" &&
              taskData.file_path
            ) {
              // ✅ SUCCESS
              const imageUrl = `${config.data_url}/${taskData.file_path}`;
              console.log("✅ Generation completed successfully:", {
                taskId: taskResult.id,
                imageUrl,
                filePath: taskData.file_path,
              });

              toast.dismiss(loadingToast);
              setGeneratedImageUrl(imageUrl);
              setShowGeneratedImageDialog(true);

              return {
                image_url: imageUrl,
                result_url: imageUrl,
                task_id: taskResult.id,
                generated_image: taskData,
              };
            } else if (taskData.generation_status === "failed") {
              // ❌ FAILED
              const errorMsg =
                taskData.error_message ||
                "AI generation failed without specific error";
              console.error("❌ Generation failed:", {
                taskId: taskResult.id,
                errorMessage: errorMsg,
                fullTaskData: taskData,
              });

              toast.dismiss(loadingToast);
              toast.error(`Generation failed: ${errorMsg}`, {
                description:
                  "Please check your prompt and images, then try again.",
                duration: 8000,
              });
              return;
            } else if (taskData.generation_status === "processing") {
              // ⏳ PROCESSING
              console.log(
                `⏳ Still processing (attempt ${attempts}/${maxAttempts})`
              );
              if (attempts >= maxAttempts) {
                console.error(
                  "❌ Timeout: Task still processing after maximum attempts"
                );
                toast.dismiss(loadingToast);
                toast.error(
                  "Generation timeout: Task is still processing. Please check again later."
                );
                return;
              }
            } else if (taskData.generation_status === "pending") {
              // 🕐 PENDING
              console.log(
                `🕐 Task pending (attempt ${attempts}/${maxAttempts})`
              );
              if (attempts >= maxAttempts) {
                console.error(
                  "❌ Timeout: Task still pending after maximum attempts"
                );
                toast.dismiss(loadingToast);
                toast.error(
                  "Generation timeout: Task is still in queue. Please try again later."
                );
                return;
              }
            } else {
              // ❓ UNKNOWN STATUS
              console.warn(
                `❓ Unknown generation status: ${taskData.generation_status}`,
                taskData
              );
              if (attempts >= maxAttempts) {
                console.error(
                  "❌ Timeout: Unknown task status after maximum attempts"
                );
                toast.dismiss(loadingToast);
                toast.error(
                  `Unexpected task status: ${taskData.generation_status}. Please contact support.`
                );
                return;
              }
            }
          }

          // Wait 5 seconds before next poll
          await new Promise((resolve) => setTimeout(resolve, 5000));
          return pollForCompletion();
        } catch (error) {
          console.error(
            `❌ Polling error at attempt ${attempts}/${maxAttempts}:`,
            error
          );

          if (attempts >= maxAttempts) {
            toast.dismiss(loadingToast);
            toast.error(
              "Network error: Unable to check generation status. Please try again.",
              {
                description:
                  error instanceof Error
                    ? error.message
                    : "Unknown network error",
                duration: 8000,
              }
            );
            return;
          }

          console.log(`🔄 Retrying after polling error in 5 seconds...`);
          // Wait 5 seconds before next poll
          await new Promise((resolve) => setTimeout(resolve, 5000));
          return pollForCompletion();
        }
      };

      // Start polling
      await pollForCompletion();
    } catch (error) {
      console.error("❌ Error in synthesis generation:", {
        error,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        prompt: prompt,
        model: editingModel,
        aspectRatio,
      });

      toast.dismiss(loadingToast);

      if (error instanceof Error) {
        if (error.message.includes("Failed to create synthesis task")) {
          toast.error("Backend error: Unable to create generation task", {
            description: "Please check your internet connection and try again.",
            duration: 8000,
          });
        } else if (error.message.includes("Invalid task response")) {
          toast.error(
            "Server error: Invalid response from generation service",
            {
              description:
                "Please try again or contact support if this persists.",
              duration: 8000,
            }
          );
        } else {
          toast.error("Generation error: " + error.message, {
            description: "Please check your inputs and try again.",
            duration: 8000,
          });
        }
      } else {
        toast.error("Unexpected error occurred during generation", {
          description: "Please try again. If this persists, contact support.",
          duration: 8000,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle inspiration hub
  const handleInspirationHub = () => {
    setShowInspirationHubModal(true);
  };

  // Handle professional editor
  const handleEditAction = async () => {
    if (!canvasImage) {
      toast.error("Please load an image first to edit");
      return;
    }

    let loadingToast: any;
    try {
      setIsLoadingImage(true);
      loadingToast = toast.loading("Loading image...", {
        description: "Preparing image for professional editing",
        duration: Infinity,
      });

      console.log("Loading image for professional editor:", canvasImage);
      console.log("Image name:", canvasImageName);

      let imageSrc = canvasImage;

      // If it's a blob URL, we can use it directly
      if (canvasImage.startsWith("blob:")) {
        imageSrc = canvasImage;
        setEditorImageSrc(imageSrc);
        setShowProfessionalEditor(true);
        setIsEditing(true);
        toast.dismiss(loadingToast);
        toast.success("Professional editor activated");
        return;
      }

      // If it's an HTTP URL, download through backend to avoid CORS
      if (canvasImage.startsWith("http")) {
        // Extract the filename from the URL
        const urlParts = canvasImage.split("/");
        const filename = urlParts[urlParts.length - 1];

        // For regular images, use output/filename format
        const filePath = `output/${filename}`;

        console.log("File path for download:", filePath);

        // Download the image file from backend to avoid CORS
        const response = await fetch(`${config.backend_url}/downloadfile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify({
            user: userData.id,
            filename: filePath,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to download image: ${response.status} ${response.statusText}`
          );
        }

        // Get the blob from the response
        const blob = await response.blob();
        imageSrc = URL.createObjectURL(blob);
      }

      setEditorImageSrc(imageSrc);
      setShowProfessionalEditor(true);
      setIsEditing(true);
      toast.dismiss(loadingToast);
      toast.success("Professional editor activated");
    } catch (error) {
      console.error("Error preparing image for editor:", error);

      // Fallback to original URL if download fails
      try {
        console.log("Trying fallback with original URL:", canvasImage);
        setEditorImageSrc(canvasImage);
        setShowProfessionalEditor(true);
        setIsEditing(true);
        toast.dismiss(loadingToast);
        toast.success("Professional editor activated with fallback method");
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        toast.dismiss(loadingToast);
        toast.error("Failed to load image for editing");
      }
    } finally {
      setIsLoadingImage(false);
    }
  };

  // Upload image to vault function
  const uploadImageToVault = useCallback(
    async (
      blob: Blob,
      filename: string,
      prefix: string = "composer"
    ): Promise<string> => {
      try {
        console.log("uploadImageToVault called with:", {
          filename,
          prefix,
          blobSize: blob.size,
          blobType: blob.type,
        });

        // Validate blob
        if (!blob || blob.size === 0) {
          throw new Error("Invalid blob: empty or null");
        }

        if (blob.size > 50 * 1024 * 1024) {
          // 50MB limit
          throw new Error("File too large (max 50MB)");
        }

        if (!blob.type.startsWith("image/")) {
          throw new Error("Invalid file type: not an image");
        }

        // Generate a unique filename for the image
        const timestamp = Date.now();
        const finalFilename = `${prefix}_${filename}_${timestamp}.jpg`;

        console.log("Generated filename:", finalFilename);

        // Get existing files to check for duplicates
        const getFilesResponse = await fetch(
          `${config.backend_url}/getfilenames`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer WeInfl3nc3withAI",
            },
            body: JSON.stringify({
              user: userData.id,
              folder: `output`,
            }),
          }
        );

        let uniqueFilename = finalFilename;

        if (getFilesResponse.ok) {
          const files = await getFilesResponse.json();
          if (files && files.length > 0 && files[0].Key) {
            const existingFilenames = files.map((file: any) => {
              const fileKey = file.Key;
              const re = new RegExp(`^.*?output/`);
              const fileName = fileKey.replace(re, "");
              return fileName;
            });

            // Generate unique filename if needed
            if (existingFilenames.includes(finalFilename)) {
              const baseName = finalFilename.substring(
                0,
                finalFilename.lastIndexOf(".")
              );
              const extension = finalFilename.substring(
                finalFilename.lastIndexOf(".")
              );
              let counter = 1;
              let testFilename = finalFilename;

              while (existingFilenames.includes(testFilename)) {
                testFilename = `${baseName}(${counter})${extension}`;
                counter++;
              }
              uniqueFilename = testFilename;
            }
          }
        }

        console.log("Final unique filename:", uniqueFilename);

        // Create a file from the blob
        const file = new File([blob], uniqueFilename, { type: "image/jpeg" });
        console.log("Created file:", file.name, file.size, file.type);

        // Upload file to API
        const uploadResponse = await fetch(
          `${config.backend_url}/uploadfile?user=${userData.id}&filename=output/${uniqueFilename}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
              Authorization: "Bearer WeInfl3nc3withAI",
            },
            body: file,
          }
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error(
            "Upload response not ok:",
            uploadResponse.status,
            uploadResponse.statusText,
            errorText
          );
          throw new Error(
            `Failed to upload image: ${uploadResponse.status} ${uploadResponse.statusText}`
          );
        }

        // Return the URL of the uploaded image
        const finalUrl = `${config.data_url}/${userData.id}/output/${uniqueFilename}`;
        console.log("Generated vault URL:", finalUrl);
        return finalUrl;
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error(
          `Failed to upload image to Image Library: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    [userData?.id]
  );

  // Handle save button click in professional editor
  const handleSaveToVault = useCallback(async () => {
    if (!editedImageUrl) {
      toast.error("No edited image to save");
      return;
    }

    try {
      setIsUploading(true);
      const loadingToast = toast.loading("Saving to Image Library...", {
        description: "Uploading edited image to Image Library",
        duration: Infinity,
      });

      console.log("Starting save to vault, editedImageUrl:", editedImageUrl);

      // Fetch the edited image as a blob
      const response = await fetch(editedImageUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch edited image: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      console.log("Fetched blob:", blob.size, blob.type);

      // Upload to vault
      const vaultUrl = await uploadImageToVault(
        blob,
        canvasImageName.replace(/[^a-zA-Z0-9]/g, "_"),
        "professional_edit"
      );

      // Clean up previous canvas blob URL if it exists
      if (canvasImage && canvasImage.startsWith("blob:")) {
        URL.revokeObjectURL(canvasImage);
        console.log("Cleaned up previous canvas blob URL");
      }

      // Clean up edited image blob URL
      URL.revokeObjectURL(editedImageUrl);
      console.log("Cleaned up edited image blob URL");

      // Update canvas with vault URL
      setCanvasImage(vaultUrl);
      setCanvasImageName(`${canvasImageName}_edited`);
      setEditedImageUrl(null);

      toast.dismiss(loadingToast);
      toast.success("Image saved to Image Library and canvas updated!");

      console.log("Saved to vault:", vaultUrl);
      console.log("Set as new canvas image:", vaultUrl);
    } catch (error) {
      console.error("Error saving to vault:", error);
      toast.error(
        `Failed to save image to Image Library: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploading(false);
    }
  }, [editedImageUrl, canvasImageName, canvasImage, uploadImageToVault]);

  // Handle editor process
  const handleEditorProcess = useCallback(async (imageState: any) => {
    try {
      console.log("Editor process called with imageState:", imageState);

      // Create blob URL for the edited image
      const editedURL = URL.createObjectURL(imageState.dest);
      console.log("Created edited URL:", editedURL);

      // Update edited image URL (don't update canvas yet)
      setEditedImageUrl(editedURL);

      // Show success toast
      toast.success(
        "Image edited successfully! Click Save to upload to Image Library."
      );

      // Don't close the editor - let user decide to save or continue editing
    } catch (error) {
      console.error("Error in editor process:", error);
      toast.error("Failed to process edited image");
    }
  }, []);

  // Handle reference name editing
  const handleReferenceNameChange = (index: number, newName: string) => {
    if (!referenceImages[index]) return;

    const updatedImages = [...referenceImages];
    if (updatedImages[index]) {
      updatedImages[index] = {
        ...updatedImages[index]!,
        referenceName: newName,
      };
      setReferenceImages(updatedImages);
    }
  };

  const handleReferenceNameSubmit = (index: number) => {
    setEditingReferenceName(null);
    toast.success("Reference name updated");
  };

  // Handle badge insertion into prompt
  const insertBadgeAtCursor = (badgeText: string) => {
    const textarea = promptTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = prompt;

    const newText =
      currentText.substring(0, start) + badgeText + currentText.substring(end);
    setPrompt(newText);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + badgeText.length,
        start + badgeText.length
      );
    }, 0);
  };

  // Generate available badges
  const getAvailableBadges = () => {
    const badges = [];

    // Always include @canvas
    badges.push({
      text: "@canvas",
      available: !!canvasImage,
    });

    // Add reference images with custom names
    referenceImages.forEach((refImage, index) => {
      if (refImage && refImage.referenceName) {
        badges.push({
          text: `@${refImage.referenceName}`,
          available: true,
        });
      }
    });

    return badges;
  };

  // Handle library image selection using VaultSelector
  const handleLibraryImageSelect = (imageData: any) => {
    console.log("📚 DEBUG: Selected image data from library:", imageData);
    console.log("📚 DEBUG: imageData structure:", {
      id: imageData.id,
      system_filename: imageData.system_filename,
      user_filename: imageData.user_filename,
      hasUrl: !!imageData.url,
      urlType: imageData.url
        ? imageData.url.startsWith("blob:")
          ? "blob"
          : imageData.url.startsWith("http")
          ? "http"
          : "other"
        : "none",
    });

    // Generate the correct URL using the same logic as VaultSelector's getImageUrl
    const imageUrl = `${config.data_url}/${userData.id}/${
      imageData.user_filename === "" || imageData.user_filename === null
        ? "output"
        : "vault/" + imageData.user_filename
    }/${imageData.system_filename}`;

    console.log("🔧 DEBUG: Generated image URL components:");
    console.log("  - config.data_url:", config.data_url);
    console.log("  - userData.id:", userData.id);
    console.log("  - imageData.user_filename:", imageData.user_filename);
    console.log("  - imageData.system_filename:", imageData.system_filename);
    console.log("✅ DEBUG: Final generated URL:", imageUrl);

    // Validation: ensure we're not accidentally creating blob URLs
    if (imageUrl.includes("blob:")) {
      console.error(
        "❌ ERROR: Generated URL contains blob - this should not happen!"
      );
      toast.error("URL generation failed - invalid blob URL detected");
      return;
    }

    const selectedImage: SelectedImage = {
      id: imageData.id,
      url: imageUrl,
      name: imageData.user_filename || imageData.system_filename || "Unknown",
      type: "library",
      referenceName: `ref${
        currentImageIndex !== null ? currentImageIndex + 1 : 1
      }`, // Default reference name
    };

    console.log("✅ DEBUG: Created selectedImage object:", selectedImage);

    if (currentImageIndex !== null) {
      // Add to reference images
      const updatedImages = [...referenceImages];
      updatedImages[currentImageIndex] = selectedImage;
      setReferenceImages(updatedImages);
      console.log(
        "📝 DEBUG: Added to reference images at index:",
        currentImageIndex
      );
      console.log("📝 DEBUG: Updated reference images array:", updatedImages);
    } else {
      // Set as canvas image
      setCanvasImage(imageUrl);
      setCanvasImageName(selectedImage.name);
      console.log("🎨 DEBUG: Set as canvas image:", selectedImage.name);
      console.log("🎨 DEBUG: Canvas image URL:", imageUrl);
    }

    // Clean up states
    setShowLibrary(false);
    setCurrentImageIndex(null);
    setIsLoadingImage(false);
    toast.success("Image loaded successfully");
  };

  // Handle canvas resize
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !canvasContainerRef.current) return;

      const rect = canvasContainerRef.current.getBoundingClientRect();
      const newHeight = Math.max(
        300,
        Math.min(1200, e.clientY - rect.top - 100)
      );
      setCanvasHeight(newHeight);
    },
    [isResizing]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Cleanup editor image source when modal is closed
  useEffect(() => {
    if (
      !showProfessionalEditor &&
      editorImageSrc &&
      editorImageSrc.startsWith("blob:")
    ) {
      URL.revokeObjectURL(editorImageSrc);
      console.log(
        "🧹 CLEANUP: Revoked editor image source blob URL when modal closed"
      );
      setEditorImageSrc(null);
    }

    // Cleanup edited image URL when modal is closed
    if (
      !showProfessionalEditor &&
      editedImageUrl &&
      editedImageUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(editedImageUrl);
      console.log(
        "🧹 CLEANUP: Revoked edited image URL blob URL when modal closed"
      );
      setEditedImageUrl(null);
    }
  }, [showProfessionalEditor, editorImageSrc, editedImageUrl]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-border/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 space-y-4 sm:space-y-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Composer
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Create stunning compositions with AI-powered editing tools
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
            {/* New Action */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction("new")}
              className="h-8 w-8 p-0 rounded-md transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              title="New - Clear everything"
            >
              <FileText className="h-4 w-4" />
            </Button>

            {/* Wipe Action */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction("wipe")}
              className="h-8 w-8 p-0 rounded-md transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Wipe - Clear canvas only"
            >
              <Eraser className="h-4 w-4" />
            </Button>

            {/* Load Action */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction("load")}
              className="h-8 w-8 p-0 rounded-md transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Load - From library or upload"
            >
              <FolderDown className="h-4 w-4" />
            </Button>

            {/* Save Action */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction("save")}
              className="h-8 w-8 p-0 rounded-md transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Save - Canvas image to reference"
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Edit Action */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditAction}
              disabled={!canvasImage}
              className="h-8 w-8 p-0 rounded-md transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Edit - Professional editor"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div
          className="flex-1 p-4 sm:p-6 overflow-auto"
          ref={canvasContainerRef}
        >
          <div className="h-full">
            {/* Resizable Canvas Container - Full width, adjustable height */}
            <div
              className={`relative bg-white dark:bg-slate-800 border-2 shadow-lg rounded-lg overflow-hidden transition-all duration-200 ${
                isDragging
                  ? "border-blue-500 shadow-blue-200 dark:shadow-blue-800"
                  : "border-slate-300 dark:border-slate-600"
              }`}
              style={{
                width: "100%",
                height: `${canvasHeight}px`,
                minWidth: "400px",
              }}
            >
              {/* Canvas Background Pattern */}
              <div
                className="absolute inset-0 opacity-10 dark:opacity-5"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3e%3cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%23666' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)' /%3e%3c/svg%3e")`,
                }}
              ></div>

              {/* Canvas Content */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                {canvasImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={canvasImage}
                      alt={canvasImageName}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      style={{
                        maxWidth: "calc(100% - 32px)",
                        maxHeight: "calc(100% - 32px)",
                        width: "auto",
                        height: "auto",
                      }}
                    />
                  </div>
                ) : (
                  /* Drop Zone Overlay */
                  <div
                    className={`absolute inset-4 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/50 scale-105"
                        : "border-slate-400 dark:border-slate-500 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/30"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => handleAction("load")}
                  >
                    <div className="text-center space-y-4">
                      <div
                        className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-200 ${
                          isDragging
                            ? "bg-blue-200 dark:bg-blue-800"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      >
                        <Image
                          className={`w-8 h-8 transition-all duration-200 ${
                            isDragging
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-semibold mb-2 transition-all duration-200 ${
                            isDragging
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {isDragging
                            ? "Release to drop image"
                            : "Drop image here"}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          or click to browse files
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Canvas Info Bar */}
              {canvasImage && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate">{canvasImageName}</span>
                    <span className="text-slate-300 ml-2">
                      Canvas:{" "}
                      {Math.round(canvasContainerRef.current?.offsetWidth || 0)}{" "}
                      × {canvasHeight}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Resize Handle */}
            <div
              className={`w-full h-2 cursor-ns-resize flex items-center justify-center transition-all duration-200 ${
                isResizing
                  ? "bg-blue-500/20"
                  : "hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
              onMouseDown={handleMouseDown}
            >
              <div
                className={`w-12 h-1 rounded transition-all duration-200 ${
                  isResizing ? "bg-blue-500" : "bg-slate-400 dark:bg-slate-600"
                }`}
              ></div>
            </div>

            {/* Prompt and Options Section */}
            <div className="mt-6 border-t border-border/50 pt-6">
              <Card className="bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-900/50 dark:to-blue-950/50 border border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Prompt Area (2/3 width) */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <Label
                          htmlFor="prompt"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block"
                        >
                          Prompt
                        </Label>
                        <Textarea
                          ref={promptTextareaRef}
                          id="prompt"
                          placeholder="Describe what you want to create or how you want to edit the image..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-[120px] text-base resize-none border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-blue-500"
                          rows={5}
                        />

                        {/* Reference Badges */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {getAvailableBadges().map((badge, index) => (
                            <button
                              key={index}
                              onClick={() => insertBadgeAtCursor(badge.text)}
                              disabled={!badge.available}
                              className={`px-3 py-1 text-sm rounded-full border transition-all duration-200 ${
                                badge.available
                                  ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer"
                                  : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                              }`}
                              title={
                                badge.available
                                  ? `Click to insert ${badge.text}`
                                  : `${badge.text} not available`
                              }
                            >
                              {badge.text}
                            </button>
                          ))}
                          {getAvailableBadges().length === 1 && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 py-1">
                              Add reference images with names to see more badges
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Options Area (1/3 width) */}
                    <div className="w-80 space-y-4">
                      <div>
                        <Label
                          htmlFor="edit-model"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block"
                        >
                          Edit using
                        </Label>
                        <Select
                          value={editingModel}
                          onValueChange={setEditingModel}
                        >
                          <SelectTrigger className="w-full border-slate-300 dark:border-slate-600">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Gemini Flash 2.5">
                              Gemini Flash 2.5
                            </SelectItem>
                            <SelectItem value="Runway Gen4">
                              Runway Gen4
                            </SelectItem>
                            <SelectItem value="Bytedance Seedit v3">
                              Bytedance Seedit v3
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label
                          htmlFor="aspect-ratio"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block"
                        >
                          Aspect Ratio
                        </Label>
                        <Select
                          value={aspectRatio}
                          onValueChange={setAspectRatio}
                        >
                          <SelectTrigger className="w-full border-slate-300 dark:border-slate-600">
                            <SelectValue placeholder="Select ratio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16:9">
                              16:9 (Widescreen)
                            </SelectItem>
                            <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                            <SelectItem value="1:1">1:1 (Square)</SelectItem>
                            <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
                            <SelectItem value="9:16">9:16 (Mobile)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <Button
                      variant="outline"
                      onClick={handleInspirationHub}
                      className="flex items-center gap-2 px-6 py-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:shadow-md"
                      title="Inspiration Hub - Browse creative prompts and ideas"
                    >
                      <Lightbulb className="w-4 h-4" />
                      Inspiration Hub
                    </Button>

                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="flex items-center gap-2 px-8 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
                      title={
                        isGenerating
                          ? "Generating your image..."
                          : "Generate - Create AI image from prompt"
                      }
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Reference Images Panel */}
        <div className="w-80 border-l border-border/50 p-4 bg-gradient-to-b from-slate-50/80 to-slate-100/40 dark:from-slate-900/80 dark:to-slate-800/40 backdrop-blur-sm">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Reference Images
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Add up to 5 reference images with custom names like @room,
                  @coke
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {referenceImages.map((image, index) => (
              <Card
                key={index}
                className="group relative h-full bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-600 cursor-pointer transition-all duration-300 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:via-blue-50 hover:to-indigo-50 dark:hover:from-purple-950/20 dark:hover:via-blue-950/20 dark:hover:to-indigo-950/20 hover:shadow-lg hover:shadow-purple-200/50 dark:hover:shadow-purple-800/20"
                onClick={() => handleReferenceImageClick(index)}
                style={{ minHeight: "170px" }}
                title={
                  image
                    ? `Click to replace reference image ${index + 1}`
                    : `Add reference image ${index + 1}`
                }
              >
                <CardContent className="h-full flex flex-col justify-center items-center p-4">
                  {image ? (
                    <div className="flex flex-col h-full">
                      {/* Image container with enhanced styling */}
                      <div className="relative flex-1 mb-4">
                        <div className="relative w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 group-hover:border-purple-300 dark:group-hover:border-purple-500 transition-all duration-300">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-contain p-2"
                          />
                          {/* Hover overlay with actions */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setZoomedImage(image);
                                  setShowZoomModal(true);
                                }}
                                title="Zoom - View image in full size"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingReferenceName(index);
                                }}
                                title="Edit reference name"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced remove button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 w-7 h-7 p-0 rounded-full bg-red-500/90 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/50 transition-all duration-200 hover:scale-110"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeReferenceImage(index);
                          }}
                          title="Remove reference image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Enhanced reference name section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                            {image.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              @
                            </span>
                          </div>
                          {editingReferenceName === index ? (
                            <input
                              type="text"
                              value={image.referenceName || ""}
                              onChange={(e) =>
                                handleReferenceNameChange(index, e.target.value)
                              }
                              onBlur={() => handleReferenceNameSubmit(index)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  handleReferenceNameSubmit(index);
                                }
                              }}
                              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                              placeholder="room, coke, etc"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div
                              className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 border border-slate-300 dark:border-slate-600 rounded-lg cursor-text hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all duration-200 hover:shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingReferenceName(index);
                              }}
                            >
                              {image.referenceName || "Enter reference name..."}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                          <Plus className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-indigo-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Reference {index + 1}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Click to add image
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file);
          }
        }}
      />

      {/* Load Dialog */}
      <Dialog
        open={showLoadDialog}
        onOpenChange={(open) => {
          setShowLoadDialog(open);
          if (!open) {
            setCurrentImageIndex(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderDown className="w-5 h-5 text-blue-500" />
              Load Image
            </DialogTitle>
            <DialogDescription>
              Choose how to load content to your canvas or reference slots
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div
              className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20"
              onClick={() => {
                setShowLoadDialog(false);
                setShowLibrary(true);
              }}
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FolderOpen className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      From Library
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Load an image from your existing collection
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/20 dark:hover:to-emerald-950/20"
              onClick={() => {
                setShowLoadDialog(false);
                setShowUpload(true);
              }}
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      Upload New
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Upload a new image from your device
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>
              Upload an image from your device to use in the composer
            </DialogDescription>
          </DialogHeader>
          <div
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-medium mb-2">Drop image here</p>
            <p className="text-sm text-muted-foreground">
              or click to browse files
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Library Selector using VaultSelector */}
      <VaultSelector
        open={showLibrary}
        onOpenChange={setShowLibrary}
        onImageSelect={handleLibraryImageSelect}
        title="Select from Library"
        description="Choose an image from your library to use in the composer"
      />

      {/* Generated Image Confirmation Dialog */}
      <Dialog
        open={showGeneratedImageDialog}
        onOpenChange={setShowGeneratedImageDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Generated Image Ready
            </DialogTitle>
            <DialogDescription>
              Your AI composition has been generated successfully. Would you
              like to replace the canvas with this image?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Generated Image Preview */}
            {generatedImageUrl && (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={generatedImageUrl}
                  alt="Generated composition"
                  className="w-full h-auto max-h-96 object-contain bg-gray-50 dark:bg-gray-900"
                  data-testid="img-generated-preview"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelGenerated}
                data-testid="button-cancel-generated"
                className="transition-all duration-200 hover:shadow-md"
                title="Keep Current Canvas - Discard generated image"
              >
                Keep Current Canvas
              </Button>
              <Button
                onClick={handleReplaceCanvas}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
                data-testid="button-replace-canvas"
                title="Replace Canvas - Use generated image as new canvas"
              >
                <Image className="w-4 h-4 mr-2" />
                Replace Canvas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inspiration Hub Modal */}
      <Dialog
        open={showInspirationHubModal}
        onOpenChange={setShowInspirationHubModal}
      >
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-auto">
          <div className="relative">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-pink-950/20 rounded-t-lg" />

            {/* Header */}
            <div className="relative p-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Inspiration Hub
                    </DialogTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Discover creative templates and prompts to spark your
                      imagination
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="relative p-8">
              <div className="text-center space-y-8">
                {/* Main Illustration */}
                <div className="relative mx-auto w-32 h-32">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800/30 dark:to-pink-800/30 rounded-full blur-3xl opacity-50 animate-pulse" />
                  <div className="relative bg-white dark:bg-gray-800 rounded-full w-full h-full flex items-center justify-center shadow-2xl border-8 border-white dark:border-gray-700">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <Lightbulb className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Preview */}
                <div className="max-w-2xl mx-auto space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    What's Coming to Inspiration Hub
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Creative Templates
                        </h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Pre-designed prompts and compositions for every style
                        and occasion
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                          <Image className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Style Gallery
                        </h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Browse curated collections of artistic styles and visual
                        themes
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Community Showcase
                        </h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Get inspired by amazing creations from the Nymia
                        community
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Prompt Library
                        </h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Access thousands of proven prompts for consistent
                        results
                      </p>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <Button
                    onClick={() => setShowInspirationHubModal(false)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Got it, thanks!
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Professional Editor Modal */}
      <Dialog
        open={showProfessionalEditor}
        onOpenChange={setShowProfessionalEditor}
      >
        <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <div className="relative h-full">
            {/* Header */}
            <div className="relative p-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Edit3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Professional Editor
                    </DialogTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Advanced image editing with professional tools and filters
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editedImageUrl && (
                    <Button
                      onClick={handleSaveToVault}
                      disabled={isUploading}
                      className="bg-gradient-to-r mr-4 from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={
                        isUploading
                          ? "Saving edited image to library..."
                          : "Save to Library - Upload edited image to your Library"
                      }
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save to Library
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Editor Content */}
            <div className="relative h-[calc(95vh-120px)]">
              {editorImageSrc && (
                <PinturaEditor
                  ref={editorRef}
                  {...editorDefaults}
                  src={editorImageSrc}
                  onProcess={handleEditorProcess}
                  utils={[
                    "crop",
                    "sticker",
                    "finetune",
                    "filter",
                    "annotate",
                    "frame",
                    "fill",
                    "redact",
                    "resize",
                  ]}
                  stickers={[
                    ["social", []],
                    [
                      "emojis",
                      [
                        "😀",
                        "😁",
                        "😆",
                        "😅",
                        "🤣",
                        "🙃",
                        "😉",
                        "😊",
                        "😇",
                        "🥳",
                        "😕",
                        "😮",
                        "😧",
                        "😰",
                        "😭",
                        "😱",
                        "😓",
                        "😫",
                        "👍",
                        "👎",
                      ],
                    ],
                    [
                      "hearts",
                      ["💘", "💝", "💖", "💓", "💞", "💕", "💔", "💋", "💯"],
                    ],
                    [
                      "default",
                      [
                        "🏆",
                        "🏅",
                        "🥇",
                        "🥈",
                        "🥉",
                        "🎉",
                        "🍕",
                        "🖌️",
                        "🌤",
                        "🌥",
                      ],
                    ],
                  ]}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Zoom Modal */}
      <Dialog open={showZoomModal} onOpenChange={setShowZoomModal}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-y-auto">
          <div className="relative">
            {/* Header */}
            <div className="relative p-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Reference Image Viewer
                    </DialogTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {zoomedImage?.referenceName
                        ? `@${zoomedImage.referenceName}`
                        : zoomedImage?.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Content */}
            <div className="relative p-6">
              {zoomedImage && (
                <div className="flex flex-col items-center space-y-6">
                  {/* Main Image */}
                  <div className="relative w-full max-w-3xl">
                    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-lg">
                      <img
                        src={zoomedImage.url}
                        alt={zoomedImage.name}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
