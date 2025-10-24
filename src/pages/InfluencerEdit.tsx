import { CreditConfirmationModal } from "@/components/CreditConfirmationModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import VaultSelector from "@/components/VaultSelector";
import { config } from "@/config/config";
import {
  addInfluencer,
  updateInfluencer,
} from "@/store/slices/influencersSlice";
import { setUser } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";
import {
  ArrowLeft,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Crown,
  Eye,
  EyeOff,
  Folder,
  Image,
  Loader2,
  Palette,
  RotateCcw,
  Save,
  Settings,
  Sparkles,
  Target,
  Trash2,
  Upload,
  User,
  Wand2,
  X,
  Zap,
  ZoomIn,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Option {
  label: string;
  image: string;
  description?: string;
}

interface GeneratedImageData {
  id: string;
  task_id: string;
  system_filename: string;
  user_filename: string | null;
}

interface FacialTemplateDetail {
  template_id: string;
  template_name: string;
  category: string;
  description: string;
  base_prompt: string;
  implied_face_shape: string;
  implied_nose_style: string;
  implied_lip_style: string;
  implied_eye_color: string;
  implied_eye_shape: string;
  implied_eyebrow_style: string;
  implied_skin_tone: string;
  weight_without_lora: number;
  weight_with_lora: number;
  is_active: boolean;
  created_at: string;
  implied_hair_color: string;
  implied_hair_length: string;
  implied_hair_style: string;
  sortid: number;
  implied_cultural_background: string;
  id: number;
  prompt_mapping_ref_id: number;
}

const INFLUENCER_TYPES = ["Lifestyle", "Educational"];

// Enhanced Mode Toggle Component
const EnhancedModeToggle = ({
  isAdvanced,
  onToggle,
}: {
  isAdvanced: boolean;
  onToggle: (advanced: boolean) => void;
}) => (
  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900 rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
        {isAdvanced ? (
          <Crown className="w-4 h-4 text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>
      <div>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {isAdvanced ? "Advanced Mode" : "Simple Mode"}
        </span>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span
        className={`text-xs ${
          !isAdvanced ? "text-gray-900 dark:text-gray-100" : "text-gray-500"
        }`}
      >
        Simple
      </span>
      <Switch
        checked={isAdvanced}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-blue-500"
      />
      <span
        className={`text-xs ${
          isAdvanced ? "text-gray-900 dark:text-gray-100" : "text-gray-500"
        }`}
      >
        Advanced
      </span>
    </div>
  </div>
);

// Enhanced Live Preview Component
const EnhancedLivePreview = ({
  influencerData,
  isGenerating,
  isCheckingPreviewCredits,
  onGenerate,
  onSetAsProfile,
  previewImage,
  onOpenAIPersonality,
  onOpenIntegrations,
  onOpenWardrobe,
  onOpenExamplePictures,
  handlePreviewGenerationWithCreditCheck,
}: {
  influencerData: any;
  isGenerating: boolean;
  isCheckingPreviewCredits: boolean;
  onGenerate: () => void;
  onSetAsProfile: () => void;
  previewImage: string | null;
  onOpenAIPersonality: () => void;
  onOpenIntegrations: () => void;
  onOpenWardrobe: () => void;
  onOpenExamplePictures: () => void;
  handlePreviewGenerationWithCreditCheck: () => void;
}) => (
  <div className="sticky top-6 space-y-6">
    {/* Main Preview Card */}
    <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-950/10 dark:to-purple-950/10 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-500" />
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview Image Area */}
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 relative group">
          {isGenerating ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                  <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse mx-auto"></div>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Generating preview...
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ~30 seconds
                </p>
              </div>
            </div>
          ) : previewImage || influencerData.image_url ? (
            <>
              <img
                src={previewImage || influencerData.image_url}
                alt="Preview"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {previewImage && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Button
                    onClick={onSetAsProfile}
                    className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Set as Profile Picture
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Image className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  No preview available
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Generate to see preview
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <Button
          onClick={handlePreviewGenerationWithCreditCheck}
          disabled={isGenerating || isCheckingPreviewCredits}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isGenerating || isCheckingPreviewCredits ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {isCheckingPreviewCredits ? "Checking Cost..." : "Generating..."}
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Apply Changes & Generate Preview
            </>
          )}
        </Button>
      </CardContent>
    </Card>

    {/* Quick Actions */}
    <Card className="bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-950/10 dark:to-emerald-950/10 border-green-200/50 dark:border-green-800/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-green-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onOpenAIPersonality}
        >
          <Brain className="w-4 h-4 mr-2" />
          AI Personality
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onOpenIntegrations}
        >
          <Settings className="w-4 h-4 mr-2" />
          Integrations
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onOpenExamplePictures}
        >
          <Image className="w-4 h-4 mr-2" />
          Example Pictures
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onOpenWardrobe}
        >
          <Palette className="w-4 h-4 mr-2" />
          Wardrobe
        </Button>
      </CardContent>
    </Card>
  </div>
);

// Enhanced Accordion Section Component
const EnhancedAccordionSection = ({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
  isRequired = false,
  description = null,
}: {
  title: string;
  icon: any;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isRequired?: boolean;
  description?: string | null;
}) => (
  <Collapsible open={isExpanded} onOpenChange={onToggle}>
    <Card
      className={`border-2 transition-all duration-300 ${
        isExpanded
          ? "border-purple-300 dark:border-purple-600 shadow-lg"
          : "border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700"
      }`}
    >
      <CollapsibleTrigger asChild>
        <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isExpanded
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg"
                    : "bg-gradient-to-r from-gray-400 to-gray-500"
                }`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {title}
                  {isRequired && (
                    <span className="text-red-500 text-sm">*</span>
                  )}
                </CardTitle>
                {description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-purple-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>
        </CardHeader>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="pt-0">
          <Separator className="mb-6" />
          {children}
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>
);

// Option Card with Image Component
const OptionCard = ({
  option,
  onSelect,
  onImageClick,
  onClear,
  placeholder = "Select option",
}: {
  option: Option | undefined;
  onSelect: () => void;
  onImageClick: () => void;
  onClear: () => void;
  placeholder?: string;
}) => {
  if (!option?.image) {
    return (
      <Card
        className="relative w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer"
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div
            className="relative w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-md"
            style={{ paddingBottom: "100%" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">{placeholder}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative w-full group hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div
          className="relative w-full group/image cursor-pointer"
          style={{ paddingBottom: "100%" }}
        >
          <img
            src={`${config.data_url}/wizard/mappings400/${option.image}`}
            alt={option.label}
            className="absolute inset-0 w-full h-full object-cover rounded-md transition-transform duration-200 group-hover:scale-105"
            onClick={onImageClick}
          />
          {/* Trash icon positioned at bottom right */}
          <div
            className="absolute bottom-2 right-2 bg-red-500/80 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            <Trash2 className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="text-sm text-center font-medium mt-2">{option.label}</p>
        {option.description && (
          <p className="text-xs text-center text-muted-foreground mt-1 line-clamp-2">
            {option.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Image Preview Dialog Component
const ImagePreviewDialog = ({
  imageUrl,
  onClose,
}: {
  imageUrl: string;
  onClose: () => void;
}) => (
  <Dialog open={true} onOpenChange={onClose}>
    <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
      <div className="relative h-full">
        <img src={imageUrl} alt="Preview" className="h-full object-contain" />
      </div>
    </DialogContent>
  </Dialog>
);

// Option Selector Dialog Component
const OptionSelector = ({
  options,
  onSelect,
  onClose,
  title,
}: {
  options: Option[];
  onSelect: (label: string) => void;
  onClose: () => void;
  title: string;
}) => {
  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {options.map((option, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => {
                  onSelect(option.label);
                  onClose();
                }}
              >
                <CardContent className="p-4">
                  <div
                    className="relative w-full group"
                    style={{ paddingBottom: "100%" }}
                  >
                    <img
                      src={`${config.data_url}/wizard/mappings400/${option.image}`}
                      alt={option.label}
                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <p className="text-sm text-center font-medium mt-2">
                    {option.label}
                  </p>
                  {option.description && (
                    <p className="text-xs text-center text-muted-foreground mt-1 line-clamp-2">
                      {option.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// AI Personality Modal Component
const AIPersonalityModal = ({
  isOpen,
  onClose,
  influencerData,
  onUpdate,
  options,
}: {
  isOpen: boolean;
  onClose: () => void;
  influencerData: any;
  onUpdate: (field: string, value: any) => void;
  options: any;
}) => {
  const handleAddTag = (field: string, value: string) => {
    const currentValues = influencerData[field] || [];

    // Check if value is already selected
    if (currentValues.includes(value)) {
      return; // Don't add duplicate
    }

    // Get max limit for the field
    const maxLimits: Record<string, number> = {
      content_focus: 4,
      hobbies: 5,
      strengths: 3,
      weaknesses: 2,
      speech_style: 3,
      humor: 3,
      core_values: 3,
      current_goals: 3,
      background_elements: 3,
      content_focus_areas: 3,
    };

    const maxLimit = maxLimits[field];

    // Check if adding would exceed the limit
    if (maxLimit && currentValues.length >= maxLimit) {
      // Show toast or alert about limit reached
      toast.error(
        `Maximum ${maxLimit} items allowed for ${field.replace("_", " ")}`
      );
      return;
    }

    onUpdate(field, [...currentValues, value]);
  };

  const handleRemoveTag = (field: string, tag: string) => {
    const currentValues = influencerData[field] || [];
    onUpdate(
      field,
      currentValues.filter((t: string) => t !== tag)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            AI Personality Settings
          </DialogTitle>
          <DialogDescription>
            Configure your influencer's personality traits and background
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Content Focus */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              Content Focus (Max 4)
              <span
                className={`text-sm font-normal ${
                  (influencerData.content_focus?.length || 0) >= 4
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}
              >
                {influencerData.content_focus?.length || 0}/4
              </span>
            </Label>
            <Select
              onValueChange={(value) => handleAddTag("content_focus", value)}
              disabled={(influencerData.content_focus?.length || 0) >= 4}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    (influencerData.content_focus?.length || 0) >= 4
                      ? "Maximum reached"
                      : "Add content focus"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.contentFocusOptions?.map(
                  (option: Option, index: number) => (
                    <SelectItem key={index} value={option.label}>
                      {option.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {(influencerData.content_focus || []).map(
                (focus: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {focus}
                    <button
                      onClick={() => handleRemoveTag("content_focus", focus)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* Job Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Area</Label>
              <Select
                value={influencerData.job_area || ""}
                onValueChange={(value) => onUpdate("job_area", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job area" />
                </SelectTrigger>
                <SelectContent>
                  {options.jobAreaOptions?.map(
                    (option: Option, index: number) => (
                      <SelectItem key={index} value={option.label}>
                        {option.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={influencerData.job_title || ""}
                onChange={(e) => onUpdate("job_title", e.target.value)}
                placeholder="Enter job title"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Job Vibe</Label>
            <Input
              value={influencerData.job_vibe || ""}
              onChange={(e) => onUpdate("job_vibe", e.target.value)}
              placeholder="Enter job vibe"
            />
          </div>

          <div className="space-y-2">
            <Label>Current Residence</Label>
            <Input
              value={influencerData.origin_residence || ""}
              onChange={(e) => onUpdate("origin_residence", e.target.value)}
              placeholder="e.g., Los Angeles, USA"
            />
          </div>

          {/* Hobbies */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              Hobbies (Max 5)
              <span
                className={`text-sm font-normal ${
                  (influencerData.hobbies?.length || 0) >= 5
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}
              >
                {influencerData.hobbies?.length || 0}/5
              </span>
            </Label>
            <Select
              onValueChange={(value) => handleAddTag("hobbies", value)}
              disabled={(influencerData.hobbies?.length || 0) >= 5}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    (influencerData.hobbies?.length || 0) >= 5
                      ? "Maximum reached"
                      : "Add hobby"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.hobbyOptions?.map((option: Option, index: number) => (
                  <SelectItem key={index} value={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {(influencerData.hobbies || []).map(
                (hobby: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {hobby}
                    <button
                      onClick={() => handleRemoveTag("hobbies", hobby)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              Strengths (Max 3)
              <span
                className={`text-sm font-normal ${
                  (influencerData.strengths?.length || 0) >= 3
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}
              >
                {influencerData.strengths?.length || 0}/3
              </span>
            </Label>
            <Select
              onValueChange={(value) => handleAddTag("strengths", value)}
              disabled={(influencerData.strengths?.length || 0) >= 3}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    (influencerData.strengths?.length || 0) >= 3
                      ? "Maximum reached"
                      : "Add strength"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.strengthOptions?.map(
                  (option: Option, index: number) => (
                    <SelectItem key={index} value={option.label}>
                      {option.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {(influencerData.strengths || []).map(
                (strength: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {strength}
                    <button
                      onClick={() => handleRemoveTag("strengths", strength)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              Weaknesses (Max 2)
              <span
                className={`text-sm font-normal ${
                  (influencerData.weaknesses?.length || 0) >= 2
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}
              >
                {influencerData.weaknesses?.length || 0}/2
              </span>
            </Label>
            <Select
              onValueChange={(value) => handleAddTag("weaknesses", value)}
              disabled={(influencerData.weaknesses?.length || 0) >= 2}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    (influencerData.weaknesses?.length || 0) >= 2
                      ? "Maximum reached"
                      : "Add weakness"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.weaknessOptions?.map(
                  (option: Option, index: number) => (
                    <SelectItem key={index} value={option.label}>
                      {option.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {(influencerData.weaknesses || []).map(
                (weakness: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {weakness}
                    <button
                      onClick={() => handleRemoveTag("weaknesses", weakness)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Social Circle</Label>
            <Input
              value={influencerData.social_circle || ""}
              onChange={(e) => onUpdate("social_circle", e.target.value)}
              placeholder="Describe social circle"
            />
          </div>

          {/* Speech Style */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              Speech Style (Max 3)
              <span
                className={`text-sm font-normal ${
                  (influencerData.speech_style?.length || 0) >= 3
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}
              >
                {influencerData.speech_style?.length || 0}/3
              </span>
            </Label>
            <Select
              onValueChange={(value) => handleAddTag("speech_style", value)}
              disabled={(influencerData.speech_style?.length || 0) >= 3}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    (influencerData.speech_style?.length || 0) >= 3
                      ? "Maximum reached"
                      : "Add speech style"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.speechOptions?.map((option: Option, index: number) => (
                  <SelectItem key={index} value={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {(influencerData.speech_style || []).map(
                (style: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {style}
                    <button
                      onClick={() => handleRemoveTag("speech_style", style)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* Humor */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              Humor (Max 3)
              <span
                className={`text-sm font-normal ${
                  (influencerData.humor?.length || 0) >= 3
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}
              >
                {influencerData.humor?.length || 0}/3
              </span>
            </Label>
            <Select
              onValueChange={(value) => handleAddTag("humor", value)}
              disabled={(influencerData.humor?.length || 0) >= 3}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    (influencerData.humor?.length || 0) >= 3
                      ? "Maximum reached"
                      : "Add humor style"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.humorOptions?.map((option: Option, index: number) => (
                  <SelectItem key={index} value={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {(influencerData.humor || []).map(
                (humor: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {humor}
                    <button
                      onClick={() => handleRemoveTag("humor", humor)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* Core Values */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              Core Values (Max 3)
              <span
                className={`text-sm font-normal ${
                  (influencerData.core_values?.length || 0) >= 3
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}
              >
                {influencerData.core_values?.length || 0}/3
              </span>
            </Label>
            <Select
              onValueChange={(value) => handleAddTag("core_values", value)}
              disabled={(influencerData.core_values?.length || 0) >= 3}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    (influencerData.core_values?.length || 0) >= 3
                      ? "Maximum reached"
                      : "Add core value"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.coreValuesOptions?.map(
                  (option: Option, index: number) => (
                    <SelectItem key={index} value={option.label}>
                      {option.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {(influencerData.core_values || []).map(
                (value: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {value}
                    <button
                      onClick={() => handleRemoveTag("core_values", value)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* Current Goals */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              Current Goals (Max 3)
              <span
                className={`text-sm font-normal ${
                  (influencerData.current_goals?.length || 0) >= 3
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}
              >
                {influencerData.current_goals?.length || 0}/3
              </span>
            </Label>
            <Select
              onValueChange={(value) => handleAddTag("current_goals", value)}
              disabled={(influencerData.current_goals?.length || 0) >= 3}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    (influencerData.current_goals?.length || 0) >= 3
                      ? "Maximum reached"
                      : "Add current goal"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.goalsOptions?.map((option: Option, index: number) => (
                  <SelectItem key={index} value={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {(influencerData.current_goals || []).map(
                (goal: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {goal}
                    <button
                      onClick={() => handleRemoveTag("current_goals", goal)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* Background Elements */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              Background Elements (Max 3)
              <span
                className={`text-sm font-normal ${
                  (influencerData.background_elements?.length || 0) >= 3
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}
              >
                {influencerData.background_elements?.length || 0}/3
              </span>
            </Label>
            <Select
              onValueChange={(value) =>
                handleAddTag("background_elements", value)
              }
              disabled={(influencerData.background_elements?.length || 0) >= 3}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    (influencerData.background_elements?.length || 0) >= 3
                      ? "Maximum reached"
                      : "Add background element"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.backgroundOptions?.map(
                  (option: Option, index: number) => (
                    <SelectItem key={index} value={option.label}>
                      {option.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {(influencerData.background_elements || []).map(
                (element: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {element}
                    <button
                      onClick={() =>
                        handleRemoveTag("background_elements", element)
                      }
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* Content Focus Areas */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              Content Focus Areas (Max 3)
              <span
                className={`text-sm font-normal ${
                  (influencerData.content_focus_areas?.length || 0) >= 3
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}
              >
                {influencerData.content_focus_areas?.length || 0}/3
              </span>
            </Label>
            <Select
              onValueChange={(value) =>
                handleAddTag("content_focus_areas", value)
              }
              disabled={(influencerData.content_focus_areas?.length || 0) >= 3}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    (influencerData.content_focus_areas?.length || 0) >= 3
                      ? "Maximum reached"
                      : "Add content focus area"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.contentFocusAreasOptions?.map(
                  (option: Option, index: number) => (
                    <SelectItem key={index} value={option.label}>
                      {option.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {(influencerData.content_focus_areas || []).map(
                (area: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {area}
                    <button
                      onClick={() =>
                        handleRemoveTag("content_focus_areas", area)
                      }
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Integrations Modal Component
const IntegrationsModal = ({
  isOpen,
  onClose,
  influencerData,
  onUpdate,
  onDispatch,
}: {
  isOpen: boolean;
  onClose: () => void;
  influencerData: any;
  onUpdate: (field: string, value: any) => void;
  onDispatch: (action: any) => void;
}) => {
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false);
  const [showFanvueKey, setShowFanvueKey] = useState(false);
  const [copiedElevenLabs, setCopiedElevenLabs] = useState(false);
  const [copiedFanvue, setCopiedFanvue] = useState(false);
  const [copiedVoiceId, setCopiedVoiceId] = useState(false);
  const [isSavingDashboard, setIsSavingDashboard] = useState(false);

  const copyToClipboard = async (
    text: string,
    type: "elevenlabs" | "fanvue" | "voiceid"
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "elevenlabs") {
        setCopiedElevenLabs(true);
        setTimeout(() => setCopiedElevenLabs(false), 2000);
      } else if (type === "fanvue") {
        setCopiedFanvue(true);
        setTimeout(() => setCopiedFanvue(false), 2000);
      } else if (type === "voiceid") {
        setCopiedVoiceId(true);
        setTimeout(() => setCopiedVoiceId(false), 2000);
      }
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Save show_on_dashboard field immediately to database
  const handleDashboardToggle = async (checked: boolean) => {
    if (!influencerData.id) {
      toast.error("Influencer ID not found");
      return;
    }

    setIsSavingDashboard(true);
    try {
      // Update local state first
      onUpdate("show_on_dashboard", checked);

      // Save to database immediately
      const response = await fetch(
        `${config.supabase_server_url}/influencer?id=eq.${influencerData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify({
            show_on_dashboard: checked,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      console.log(response);

      if (response.ok) {
        // Update Redux store
        // onDispatch(
        //   updateInfluencer({
        //     ...influencerData,
        //     show_on_dashboard: checked,
        //     updated_at: new Date().toISOString(),
        //   })
        // );
        toast.success(
          `Influencer ${checked ? "added to" : "removed from"} dashboard`
        );
      } else {
        // Revert local state if save failed
        onUpdate("show_on_dashboard", !checked);
        toast.error("Failed to update dashboard setting");
      }
    } catch (error) {
      console.error("Error saving dashboard setting:", error);
      // Revert local state if save failed
      onUpdate("show_on_dashboard", !checked);
      toast.error("Failed to update dashboard setting");
    } finally {
      setIsSavingDashboard(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            Platform Integrations
          </DialogTitle>
          <DialogDescription>
            Configure API keys and platform connections
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Show On Dashboard Setting */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="show_on_dashboard">Show On Dashboard</Label>
              <p className="text-xs text-muted-foreground">
                Display this influencer on your main dashboard
              </p>
            </div>
            <Switch
              id="show_on_dashboard"
              checked={influencerData.show_on_dashboard || false}
              onCheckedChange={handleDashboardToggle}
              disabled={isSavingDashboard}
            />
            {isSavingDashboard && (
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
            )}
          </div>

          <Separator />
          {/* ElevenLabs Integration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">11</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">ElevenLabs</h3>
                <p className="text-sm text-muted-foreground">
                  Voice generation API integration
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="elevenlabs_apikey">API Key</Label>
                <div className="relative">
                  <Input
                    id="elevenlabs_apikey"
                    type={showElevenLabsKey ? "text" : "password"}
                    value={influencerData.elevenlabs_apikey || ""}
                    onChange={(e) =>
                      onUpdate("elevenlabs_apikey", e.target.value)
                    }
                    placeholder="Enter your ElevenLabs API key"
                    className="font-mono text-sm pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowElevenLabsKey(!showElevenLabsKey)}
                      className="h-8 w-8 p-0"
                    >
                      {showElevenLabsKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    {influencerData.elevenlabs_apikey && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            influencerData.elevenlabs_apikey,
                            "elevenlabs"
                          )
                        }
                        className="h-8 w-8 p-0"
                      >
                        {copiedElevenLabs ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="elevenlabs_voiceid">Voice ID</Label>
                <div className="relative">
                  <Input
                    id="elevenlabs_voiceid"
                    value={influencerData.elevenlabs_voiceid || ""}
                    onChange={(e) =>
                      onUpdate("elevenlabs_voiceid", e.target.value)
                    }
                    placeholder="Enter voice ID"
                    className="pr-12"
                  />
                  {influencerData.elevenlabs_voiceid && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            influencerData.elevenlabs_voiceid,
                            "voiceid"
                          )
                        }
                        className="h-8 w-8 p-0"
                      >
                        {copiedVoiceId ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Fanvue Integration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-600 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FV</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Fanvue</h3>
                <p className="text-sm text-muted-foreground">
                  Platform integration and analytics
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="use_fanvue_api">Connect to Fanvue</Label>
                <p className="text-xs text-muted-foreground">
                  Enable Fanvue integration for this influencer
                </p>
              </div>
              <Switch
                id="use_fanvue_api"
                checked={influencerData.use_fanvue_api || false}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    onUpdate("use_fanvue_api", false);
                    onUpdate("fanvue_api_key", "");
                  } else {
                    onUpdate("use_fanvue_api", true);
                  }
                }}
              />
            </div>

            {influencerData.use_fanvue_api && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fanvue_api_key">API Key</Label>
                  <div className="relative">
                    <Input
                      id="fanvue_api_key"
                      type={showFanvueKey ? "text" : "password"}
                      value={influencerData.fanvue_api_key || ""}
                      onChange={(e) =>
                        onUpdate("fanvue_api_key", e.target.value)
                      }
                      placeholder="Enter your Fanvue API key"
                      className="font-mono text-sm pr-20"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFanvueKey(!showFanvueKey)}
                        className="h-8 w-8 p-0"
                      >
                        {showFanvueKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      {influencerData.fanvue_api_key && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              influencerData.fanvue_api_key,
                              "fanvue"
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          {copiedFanvue ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
export default function InfluencerEditRedesign() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user);
  const influencers = useSelector(
    (state: RootState) => state.influencers.influencers
  );

  // State Management
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal States
  const [showAIPersonalityModal, setShowAIPersonalityModal] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showWardrobeModal, setShowWardrobeModal] = useState(false);
  const [showExamplePicturesModal, setShowExamplePicturesModal] =
    useState(false);
  const [showVaultSelector, setShowVaultSelector] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isGeneratingExamples, setIsGeneratingExamples] = useState(false);
  const [isGeneratingIndividual, setIsGeneratingIndividual] = useState<{
    [key: number]: boolean;
  }>({});
  const [isCheckingCredits, setIsCheckingCredits] = useState(false);
  const [isCheckingIndividualCredits, setIsCheckingIndividualCredits] =
    useState<{ [key: number]: boolean }>({});
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [showIndividualCreditWarning, setShowIndividualCreditWarning] =
    useState<{ [key: number]: boolean }>({});
  const [creditCostData, setCreditCostData] = useState<any>(null);
  const [individualCreditCostData, setIndividualCreditCostData] = useState<{
    [key: number]: any;
  }>({});

  // Credit state for preview generation
  const [showPreviewCreditWarning, setShowPreviewCreditWarning] =
    useState(false);
  const [previewCreditCostData, setPreviewCreditCostData] = useState<any>(null);
  const [isCheckingPreviewCredits, setIsCheckingPreviewCredits] =
    useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accordion States
  const [expandedSections, setExpandedSections] = useState({
    basicInformation: true,
    defineLook: false,
    detailedFeatures: false,
    personalInformation: false,
    contentGeneration: false,
  });

  // Form Data - Complete influencer data structure
  const [influencerData, setInfluencerData] = useState({
    id: "",
    user_id: "", // Add missing user_id field
    visual_only: false,
    name_first: "",
    name_last: "",
    influencer_type: "Lifestyle",
    sex: "Female",
    age: "",
    age_lifestyle: "", // Add missing age_lifestyle field to match interface
    cultural_background: "",
    lifestyle: "",
    origin_birth: "",
    origin_residence: "",
    notes: "",
    // Appearance fields
    skin_tone: "",
    hair_color: "",
    hair_style: "",
    eye_color: "",
    body_type: "",
    face_shape: "",
    bust_size: "",
    // Advanced appearance fields
    hair_length: "",
    eye_shape: "",
    lip_style: "",
    nose_style: "",
    eyebrow_style: "",
    facial_features: "",
    // Personality fields (for AI Personality modal)
    content_focus: [] as string[],
    content_focus_areas: [] as string[],
    job_area: "",
    job_title: "",
    job_vibe: "",
    hobbies: [] as string[],
    social_circle: "",
    strengths: [] as string[],
    weaknesses: [] as string[],
    speech_style: [] as string[],
    humor: [] as string[],
    core_values: [] as string[],
    current_goals: [] as string[],
    background_elements: [] as string[],
    // Integration fields
    elevenlabs_apikey: "",
    elevenlabs_voiceid: "",
    use_fanvue_api: false,
    fanvue_api_key: "",
    show_on_dashboard: false,
    // System fields
    image_url: "",
    image_num: 0,
    lorastatus: 0,
    template_pro: false,
    prompt: "",
    // Style fields (removed as per requirements - will be handled by Wardrobe)
    color_palette: [] as string[],
    clothing_style_everyday: "",
    clothing_style_occasional: "",
    clothing_style_home: "",
    clothing_style_sports: "",
    clothing_style_sexy_dress: "",
    home_environment: "",
    // Example pictures
    example_pic1: "",
    example_pic2: "",
    example_pic3: "",
    // Add missing timestamp fields
    created_at: "",
    updated_at: "",
    // Bio field for template influencers
    bio: null as any,
  });

  // Database Options - All field options
  const [skinOptions, setSkinOptions] = useState<Option[]>([]);
  const [hairColorOptions, setHairColorOptions] = useState<Option[]>([]);
  const [hairStyleOptions, setHairStyleOptions] = useState<Option[]>([]);
  const [eyeColorOptions, setEyeColorOptions] = useState<Option[]>([]);
  const [bodyTypeOptions, setBodyTypeOptions] = useState<Option[]>([]);
  const [faceShapeOptions, setFaceShapeOptions] = useState<Option[]>([]);
  const [bustOptions, setBustOptions] = useState<Option[]>([]);
  const [culturalBackgroundOptions, setCulturalBackgroundOptions] = useState<
    Option[]
  >([]);
  const [sexOptions, setSexOptions] = useState<Option[]>([]);
  const [ageOptions, setAgeOptions] = useState<Option[]>([]);
  const [lifestyleOptions, setLifestyleOptions] = useState<Option[]>([]);

  // Advanced options
  const [hairLengthOptions, setHairLengthOptions] = useState<Option[]>([]);
  const [eyeShapeOptions, setEyeShapeOptions] = useState<Option[]>([]);
  const [lipOptions, setLipOptions] = useState<Option[]>([]);
  const [noseOptions, setNoseOptions] = useState<Option[]>([]);
  const [eyebrowOptions, setEyebrowOptions] = useState<Option[]>([]);
  const [facialFeaturesOptions, setFacialFeaturesOptions] = useState<Option[]>(
    []
  );

  // AI Personality options
  const [contentFocusOptions, setContentFocusOptions] = useState<Option[]>([]);
  const [jobAreaOptions, setJobAreaOptions] = useState<Option[]>([]);
  const [hobbyOptions, setHobbyOptions] = useState<Option[]>([]);
  const [strengthOptions, setStrengthOptions] = useState<Option[]>([]);
  const [weaknessOptions, setWeaknessOptions] = useState<Option[]>([]);

  // Loading States
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);

  // Selector States
  const [showSkinSelector, setShowSkinSelector] = useState(false);
  const [showHairColorSelector, setShowHairColorSelector] = useState(false);
  const [showHairStyleSelector, setShowHairStyleSelector] = useState(false);
  const [showEyeColorSelector, setShowEyeColorSelector] = useState(false);
  const [showBodyTypeSelector, setShowBodyTypeSelector] = useState(false);
  const [showFaceShapeSelector, setShowFaceShapeSelector] = useState(false);
  const [showBustSelector, setShowBustSelector] = useState(false);
  const [showCulturalBackgroundSelector, setShowCulturalBackgroundSelector] =
    useState(false);
  const [showSexSelector, setShowSexSelector] = useState(false);
  const [showAgeSelector, setShowAgeSelector] = useState(false);
  const [showLifestyleSelector, setShowLifestyleSelector] = useState(false);

  // Advanced selectors
  const [showHairLengthSelector, setShowHairLengthSelector] = useState(false);
  const [showEyeShapeSelector, setShowEyeShapeSelector] = useState(false);
  const [showLipSelector, setShowLipSelector] = useState(false);
  const [showNoseSelector, setShowNoseSelector] = useState(false);
  const [showEyebrowSelector, setShowEyebrowSelector] = useState(false);
  const [showFacialFeaturesSelector, setShowFacialFeaturesSelector] =
    useState(false);

  // Validation
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Additional state variables from InfluencerProfiles
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showLoraPrompt, setShowLoraPrompt] = useState(false);
  const [generatedImageData, setGeneratedImageData] = useState<{
    image_id: string;
    system_filename: string;
  } | null>(null);
  const [previewImages, setPreviewImages] = useState<
    Array<{
      imageUrl: string;
      negativePrompt: string;
      isRecommended?: boolean;
      isLoading?: boolean;
      taskId?: string;
      systemFilename?: string;
    }>
  >([]);

  // Additional option states
  const [humorOptions, setHumorOptions] = useState<Option[]>([]);
  const [goalsOptions, setGoalsOptions] = useState<Option[]>([]);
  const [coreValuesOptions, setCoreValuesOptions] = useState<Option[]>([]);
  const [contentFocusAreasOptions, setContentFocusAreasOptions] = useState<
    Option[]
  >([]);
  const [personaOptions, setPersonaOptions] = useState<Option[]>([]);
  const [speechOptions, setSpeechOptions] = useState<Option[]>([]);
  const [backgroundOptions, setBackgroundOptions] = useState<Option[]>([]);

  // Wardrobe/Clothing Style Options
  const [clothingEverydayOptions, setClothingEverydayOptions] = useState<
    Option[]
  >([]);
  const [clothingOccasionalOptions, setClothingOccasionalOptions] = useState<
    Option[]
  >([]);
  const [clothingHomewearOptions, setClothingHomewearOptions] = useState<
    Option[]
  >([]);
  const [clothingSportsOptions, setClothingSportsOptions] = useState<Option[]>(
    []
  );
  const [clothingSexyOptions, setClothingSexyOptions] = useState<Option[]>([]);
  const [homeEnvironmentOptions, setHomeEnvironmentOptions] = useState<
    Option[]
  >([]);
  const [colorPaletteOptions, setColorPaletteOptions] = useState<Option[]>([]);

  // Additional selector states
  const [showHumorSelector, setShowHumorSelector] = useState(false);
  const [showGoalsSelector, setShowGoalsSelector] = useState(false);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showJobAreaSelector, setShowJobAreaSelector] = useState(false);
  const [showCoreValuesSelector, setShowCoreValuesSelector] = useState(false);
  const [showContentFocusAreasSelector, setShowContentFocusAreasSelector] =
    useState(false);

  // Wardrobe selector states
  const [showEverydayStyleSelector, setShowEverydayStyleSelector] =
    useState(false);
  const [showOccasionalStyleSelector, setShowOccasionalStyleSelector] =
    useState(false);
  const [showHomeStyleSelector, setShowHomeStyleSelector] = useState(false);
  const [showSportsStyleSelector, setShowSportsStyleSelector] = useState(false);
  const [showSexyStyleSelector, setShowSexyStyleSelector] = useState(false);
  const [showHomeEnvironmentSelector, setShowHomeEnvironmentSelector] =
    useState(false);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [showSpeechSelector, setShowSpeechSelector] = useState(false);

  // Image and file handling states
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [detailedImages, setDetailedImages] = useState<GeneratedImageData[]>(
    []
  );
  const [loadingVaultImages, setLoadingVaultImages] = useState(false);
  const [profileImageId, setProfileImageId] = useState<string | null>(null);

  // Color picker states
  const [showHairColorPicker, setShowHairColorPicker] = useState(false);
  const [showEyeColorPicker, setShowEyeColorPicker] = useState(false);
  const [selectedHairColor, setSelectedHairColor] = useState<string>("");
  const [selectedEyeColor, setSelectedEyeColor] = useState<string>("");

  // Facial template states
  const [selectedFacialTemplate, setSelectedFacialTemplate] =
    useState<FacialTemplateDetail | null>(null);
  const [showFacialTemplateDetails, setShowFacialTemplateDetails] =
    useState(false);
  const [showFacialTemplateConfirm, setShowFacialTemplateConfirm] =
    useState(false);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);

  // LoRA Training states
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isCopyingImage, setIsCopyingImage] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("basic");

  // Ensure user_id is always set when userData is available
  useEffect(() => {
    if (userData.id && !influencerData.user_id) {
      setInfluencerData((prev) => ({
        ...prev,
        user_id: userData.id,
      }));
    }
  }, [userData.id, influencerData.user_id]);

  // Debug bio field changes
  useEffect(() => {
    console.log("Bio field changed:", influencerData.bio);
  }, [influencerData.bio]);

  // Load existing influencer data if editing
  useEffect(() => {
    if (location.state?.influencerData) {
      const existingData = location.state.influencerData;
      console.log("Loading influencer data:", existingData); // Debug log

      // Check if this is template data
      const isFromTemplate = location.state?.fromTemplate;
      if (isFromTemplate) {
        // For template data, ensure we have proper defaults and user_id
        setInfluencerData({
          ...influencerData,
          ...existingData,
          user_id: userData.id, // Set user_id for template influencers
          id: "", // Clear ID for new influencer creation
          age_lifestyle: existingData.age || existingData.lifestyle || "", // Map age/lifestyle to age_lifestyle
          created_at: new Date().toISOString(), // Set current timestamp
          updated_at: new Date().toISOString(), // Set current timestamp
          // Ensure arrays are properly initialized
          content_focus: Array.isArray(existingData.content_focus)
            ? existingData.content_focus
            : [],
          content_focus_areas: Array.isArray(existingData.content_focus_areas)
            ? existingData.content_focus_areas
            : [],
          hobbies: Array.isArray(existingData.hobbies)
            ? existingData.hobbies
            : [],
          strengths: Array.isArray(existingData.strengths)
            ? existingData.strengths
            : [],
          weaknesses: Array.isArray(existingData.weaknesses)
            ? existingData.weaknesses
            : [],
          speech_style: Array.isArray(existingData.speech_style)
            ? existingData.speech_style
            : [],
          humor: Array.isArray(existingData.humor) ? existingData.humor : [],
          core_values: Array.isArray(existingData.core_values)
            ? existingData.core_values
            : [],
          current_goals: Array.isArray(existingData.current_goals)
            ? existingData.current_goals
            : [],
          background_elements: Array.isArray(existingData.background_elements)
            ? existingData.background_elements
            : [],
          color_palette: Array.isArray(existingData.color_palette)
            ? existingData.color_palette
            : [],
          // Handle bio field for template influencers
          bio: existingData.bio || null,
        });
      } else {
        // For existing influencer data
        setInfluencerData({
          ...influencerData,
          ...existingData,
          user_id: existingData.user_id || userData.id, // Ensure user_id is set
          age_lifestyle:
            existingData.age_lifestyle ||
            existingData.age ||
            existingData.lifestyle ||
            "", // Map age/lifestyle to age_lifestyle
          // Ensure arrays are properly initialized
          content_focus: Array.isArray(existingData.content_focus)
            ? existingData.content_focus
            : [],
          content_focus_areas: Array.isArray(existingData.content_focus_areas)
            ? existingData.content_focus_areas
            : [],
          hobbies: Array.isArray(existingData.hobbies)
            ? existingData.hobbies
            : [],
          strengths: Array.isArray(existingData.strengths)
            ? existingData.strengths
            : [],
          weaknesses: Array.isArray(existingData.weaknesses)
            ? existingData.weaknesses
            : [],
          speech_style: Array.isArray(existingData.speech_style)
            ? existingData.speech_style
            : [],
          humor: Array.isArray(existingData.humor) ? existingData.humor : [],
          core_values: Array.isArray(existingData.core_values)
            ? existingData.core_values
            : [],
          current_goals: Array.isArray(existingData.current_goals)
            ? existingData.current_goals
            : [],
          background_elements: Array.isArray(existingData.background_elements)
            ? existingData.background_elements
            : [],
          color_palette: Array.isArray(existingData.color_palette)
            ? existingData.color_palette
            : [],
          // Handle bio field for existing influencers
          bio: existingData.bio || null,
        });
      }
      setOriginalData({ ...existingData });

      if (isFromTemplate) {
        console.log(
          "Template data loaded successfully - ready for customization"
        );
        console.log("Template bio field:", existingData.bio);
        toast.success(
          `Template "${existingData.name_first} ${existingData.name_last}" loaded. You can now customize it.`
        );
      } else {
        console.log("Influencer data loaded successfully");
      }
    } else if (!location.state?.create) {
      // If not creating new and no data provided, try to fetch from URL params
      const urlParams = new URLSearchParams(location.search);
      const influencerId = urlParams.get("id");

      if (influencerId) {
        console.log("Trying to find influencer with ID:", influencerId); // Debug log
        // Find influencer in Redux store
        const existingInfluencer = influencers.find(
          (inf) => inf.id === influencerId
        );
        if (existingInfluencer) {
          console.log("Found influencer in Redux store:", existingInfluencer); // Debug log
          console.log("Redux store bio field:", existingInfluencer.bio); // Debug log
          setInfluencerData({
            ...influencerData,
            ...existingInfluencer,
            user_id: existingInfluencer.user_id || userData.id, // Ensure user_id is set
            age_lifestyle:
              existingInfluencer.age_lifestyle ||
              existingInfluencer.age ||
              existingInfluencer.lifestyle ||
              "", // Map age/lifestyle to age_lifestyle
            // Ensure arrays are properly initialized
            content_focus: Array.isArray(existingInfluencer.content_focus)
              ? existingInfluencer.content_focus
              : [],
            content_focus_areas: Array.isArray(
              existingInfluencer.content_focus_areas
            )
              ? existingInfluencer.content_focus_areas
              : [],
            hobbies: Array.isArray(existingInfluencer.hobbies)
              ? existingInfluencer.hobbies
              : [],
            strengths: Array.isArray(existingInfluencer.strengths)
              ? existingInfluencer.strengths
              : [],
            weaknesses: Array.isArray(existingInfluencer.weaknesses)
              ? existingInfluencer.weaknesses
              : [],
            speech_style: Array.isArray(existingInfluencer.speech_style)
              ? existingInfluencer.speech_style
              : [],
            humor: Array.isArray(existingInfluencer.humor)
              ? existingInfluencer.humor
              : [],
            core_values: Array.isArray(existingInfluencer.core_values)
              ? existingInfluencer.core_values
              : [],
            current_goals: Array.isArray(existingInfluencer.current_goals)
              ? existingInfluencer.current_goals
              : [],
            background_elements: Array.isArray(
              existingInfluencer.background_elements
            )
              ? existingInfluencer.background_elements
              : [],
            color_palette: Array.isArray(existingInfluencer.color_palette)
              ? existingInfluencer.color_palette
              : [],
            // Handle bio field for Redux store influencers
            bio: existingInfluencer.bio || null,
          });
          setOriginalData({ ...existingInfluencer });
        } else {
          console.log("Influencer not found in Redux store, redirecting..."); // Debug log
          toast.error("Influencer not found");
          navigate("/influencers/profiles");
        }
      } else {
        console.log(
          "No influencer ID provided and not creating new, redirecting..."
        ); // Debug log
        navigate("/influencers/profiles");
      }
    } else {
      console.log("Creating new influencer"); // Debug log
    }
  }, [location.state, influencers, navigate]);
  // Store original data on mount for reset functionality
  useEffect(() => {
    if (influencerData.id && !originalData) {
      setOriginalData({ ...influencerData });
    }
  }, [influencerData.id, originalData]);

  // Load field options from database
  useEffect(() => {
    const fetchOptions = async () => {
      setIsOptionsLoading(true);
      try {
        const endpoints = {
          // Basic appearance options
          skin: setSkinOptions,
          haircolor: setHairColorOptions,
          hairstyle: setHairStyleOptions,
          eyecolor: setEyeColorOptions,
          bodytype: setBodyTypeOptions,
          faceshape: setFaceShapeOptions,
          bust: setBustOptions,
          background: setCulturalBackgroundOptions,
          sex: setSexOptions,
          age: setAgeOptions,
          lifestyle: setLifestyleOptions,
          // Advanced appearance options
          hairlength: setHairLengthOptions,
          eye_shape: setEyeShapeOptions,
          lips: setLipOptions,
          nose: setNoseOptions,
          eyebrow: setEyebrowOptions,
          facial_features: setFacialFeaturesOptions,
          // AI Personality options
          cfocus: setContentFocusOptions,
          jobarea: setJobAreaOptions,
          hobby: setHobbyOptions,
          strength: setStrengthOptions,
          weak: setWeaknessOptions,
          // Additional options from InfluencerProfiles
          humor: setHumorOptions,
          goals: setGoalsOptions,
          bground: setBackgroundOptions,
          niche: setContentFocusAreasOptions,
          cvalues: setCoreValuesOptions,
          persona: setPersonaOptions,
          speech: setSpeechOptions,
          // Wardrobe/Clothing Style endpoints
          clothing_everyday: setClothingEverydayOptions,
          clothing_occasional: setClothingOccasionalOptions,
          clothing_homewear: setClothingHomewearOptions,
          clothing_sports: setClothingSportsOptions,
          clothing_sexy: setClothingSexyOptions,
          home_environment: setHomeEnvironmentOptions,
          colorpalette: setColorPaletteOptions,
        };

        const promises = Object.entries(endpoints).map(
          async ([fieldtype, setter]) => {
            try {
              const response = await fetch(
                `${config.backend_url}/fieldoptions?fieldtype=${fieldtype}`,
                {
                  headers: {
                    Authorization: "Bearer WeInfl3nc3withAI",
                  },
                }
              );
              if (response.ok) {
                const responseData = await response.json();
                if (
                  responseData &&
                  responseData.fieldoptions &&
                  Array.isArray(responseData.fieldoptions)
                ) {
                  setter(
                    responseData.fieldoptions.map((item: any) => ({
                      label: item.label,
                      image: item.image,
                      description: item.description,
                    }))
                  );
                }
              }
            } catch (error) {
              console.error(`Error fetching ${fieldtype} options:`, error);
            }
          }
        );

        await Promise.all(promises);
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setIsOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  // Input change handler
  const handleInputChange = (
    field: string,
    value: string | boolean | string[]
  ) => {
    setInfluencerData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);

    // Clear validation error
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Toggle accordion section - close others when opening one
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => {
      const isCurrentlyExpanded = prev[section];

      // If the section is currently expanded, just close it
      if (isCurrentlyExpanded) {
        return {
          ...prev,
          [section]: false,
        };
      }

      // If the section is currently closed, open it and close all others
      return {
        basicInformation: section === "basicInformation",
        defineLook: section === "defineLook",
        detailedFeatures: section === "detailedFeatures",
        personalInformation: section === "personalInformation",
        contentGeneration: section === "contentGeneration",
      };
    });
  };

  // Generate preview - using original logic
  const handleGeneratePreview = async () => {
    console.log("🚀 handleGeneratePreview: Starting...");

    if (!validateFields()) {
      toast.error("Please fill in all required fields");
      return;
    }

    console.log("🚀 Setting isGenerating to true");
    setIsGenerating(true);

    try {
      // Get user ID for API calls
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

      // Create preview request data - matching original implementation
      const requestData = {
        task: "generate_preview",
        number_of_images: 1,
        quality: "Quality",
        nsfw_strength: -1,
        lora: "",
        noAI: false,
        prompt: "",
        lora_strength: 0,
        seed: -1,
        guidance: 7,
        model: {
          id: influencerData.id,
          influencer_type: influencerData.influencer_type,
          sex: influencerData.sex,
          cultural_background: influencerData.cultural_background,
          hair_length: influencerData.hair_length,
          hair_color: influencerData.hair_color,
          hair_style: influencerData.hair_style,
          eye_color: influencerData.eye_color,
          lip_style: influencerData.lip_style,
          nose_style: influencerData.nose_style,
          face_shape: influencerData.face_shape,
          facial_features: influencerData.facial_features,
          skin_tone: influencerData.skin_tone,
          bust: influencerData.bust_size,
          body_type: influencerData.body_type,
          color_palette: influencerData.color_palette || [],
          clothing_style_everyday: influencerData.clothing_style_everyday,
          eyebrow_style: influencerData.eyebrow_style,
          name_first: influencerData.name_first,
          name_last: influencerData.name_last,
          visual_only: influencerData.visual_only,
          age: influencerData.age,
          lifestyle: influencerData.lifestyle,
        },
        scene: {
          framing: "",
          rotation: "",
          lighting_preset: "",
          scene_setting: "",
          pose: "",
          clothes: "",
        },
        negative_prompt: "1",
      };

      // Send generation request
      console.log("🚀 Sending generation request with data:", requestData);
      const response = await fetch(
        `${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createimage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log("🚀 Generation response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("🚀 Generation result:", result);
      const taskId = result.id;

      // Poll for completion
      const pollForImage = async () => {
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
            const imageUrl = `${config.data_url}/${userData.id}/${
              completedImage.user_filename === "" ||
              completedImage.user_filename === null
                ? "output"
                : "vault/" + completedImage.user_filename
            }/${completedImage.system_filename}`;

            setPreviewImage(imageUrl);
            setIsGenerating(false);
            toast.success("Preview generated successfully!");
            return;
          }

          // Continue polling if not ready
          setTimeout(pollForImage, 2000);
        } catch (error) {
          console.error("Error polling for image:", error);
          toast.error("Failed to fetch preview image");
          setIsGenerating(false);
        }
      };

      // Start polling
      pollForImage();
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("Failed to generate preview");
      setIsGenerating(false);
    }
  };

  // Set as profile picture
  const handleSetAsProfile = async () => {
    if (!previewImage) return;

    try {
      // Extract filename from preview URL
      const urlParts = previewImage.split("/");
      const filename = urlParts[urlParts.length - 1];

      // Copy image to profile folder
      const num = influencerData.image_num || 0;
      const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `output/${filename}`,
          destinationfilename: `models/${influencerData.id}/profilepic/profilepic${num}.png`,
        }),
      });

      if (!copyResponse.ok) {
        throw new Error("Failed to copy image to profile picture");
      }

      // Update influencer data
      const newImageUrl = `${config.data_url}/${userData.id}/models/${influencerData.id}/profilepic/profilepic${num}.png`;

      setInfluencerData((prev) => ({
        ...prev,
        image_url: newImageUrl,
        image_num: num + 1,
      }));

      setPreviewImage(null);
      setHasUnsavedChanges(true);
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error setting profile picture:", error);
      toast.error("Failed to set profile picture");
    }
  };

  // Validation
  const validateFields = () => {
    const errors: Record<string, string> = {};
    const requiredFields = ["name_first", "name_last", "influencer_type"];

    // Check basic required fields
    requiredFields.forEach((field) => {
      if (
        !influencerData[field as keyof typeof influencerData] ||
        (
          influencerData[field as keyof typeof influencerData] as string
        ).trim() === ""
      ) {
        errors[field] = "This field is required";
      }
    });

    // Check if user_id is set (critical for database operations)
    if (!influencerData.user_id) {
      errors.user_id = "User ID is required";
    } else if (influencerData.user_id === "") {
      errors.user_id = "User ID cannot be empty";
    }

    // Check if age_lifestyle is set (required by database schema)
    if (
      !influencerData.age_lifestyle &&
      !influencerData.age &&
      !influencerData.lifestyle
    ) {
      errors.age_lifestyle = "Age or lifestyle information is required";
    }

    // Check for empty strings in UUID fields
    if (influencerData.elevenlabs_voiceid === "") {
      errors.elevenlabs_voiceid = "Voice ID cannot be empty string";
    }
    if (influencerData.elevenlabs_apikey === "") {
      errors.elevenlabs_apikey = "API key cannot be empty string";
    }
    if (influencerData.fanvue_api_key === "") {
      errors.fanvue_api_key = "Fanvue API key cannot be empty string";
    }

    // Log validation errors for debugging
    if (Object.keys(errors).length > 0) {
      console.warn("Validation errors:", errors);
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save handler - complete implementation from original
  const handleSave = async () => {
    if (!validateFields()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);

    try {
      if (location.state?.create) {
        // Create new influencer
        const isFromTemplate = location.state?.fromTemplate;

        if (isFromTemplate) {
          influencerData.id = "";
          // Ensure user_id is set for template influencers
          influencerData.user_id = userData.id;
        }

        console.log("Influencer data before save:", influencerData);
        console.log("Original id field:", influencerData.id);
        console.log("Original user_id field:", influencerData.user_id);

        // Check for empty strings in the data
        const emptyStringFields = Object.entries(influencerData)
          .filter(([key, value]) => value === "")
          .map(([key]) => key);
        console.log("Fields with empty strings:", emptyStringFields);

        // Create request body without the id field for new influencers
        const { id, ...influencerDataWithoutId } = influencerData;

        // Clean up empty strings that might cause UUID validation issues
        const cleanedData = Object.fromEntries(
          Object.entries(influencerDataWithoutId).map(([key, value]) => [
            key,
            value === "" ? null : value,
          ])
        );

        const requestBody = {
          ...cleanedData,
          user_id: influencerData.user_id || userData.id, // Ensure user_id is always set
          age_lifestyle:
            influencerData.age_lifestyle ||
            influencerData.age ||
            influencerData.lifestyle ||
            "", // Map age/lifestyle properly
          // Ensure all required fields have proper values
          name_first: influencerData.name_first || "",
          name_last: influencerData.name_last || "",
          influencer_type: influencerData.influencer_type || "Lifestyle",
          sex: influencerData.sex || "Female",
          visual_only: influencerData.visual_only || false,
          image_url: influencerData.image_url || "",
          image_num: influencerData.image_num || 0,
          lorastatus: influencerData.lorastatus || 0,
          template_pro: influencerData.template_pro || false,
          created_at: influencerData.created_at || new Date().toISOString(),
          updated_at: influencerData.updated_at || new Date().toISOString(),
          // Ensure arrays are properly initialized
          content_focus: Array.isArray(influencerData.content_focus)
            ? influencerData.content_focus
            : [],
          content_focus_areas: Array.isArray(influencerData.content_focus_areas)
            ? influencerData.content_focus_areas
            : [],
          hobbies: Array.isArray(influencerData.hobbies)
            ? influencerData.hobbies
            : [],
          strengths: Array.isArray(influencerData.strengths)
            ? influencerData.strengths
            : [],
          weaknesses: Array.isArray(influencerData.weaknesses)
            ? influencerData.weaknesses
            : [],
          speech_style: Array.isArray(influencerData.speech_style)
            ? influencerData.speech_style
            : [],
          humor: Array.isArray(influencerData.humor)
            ? influencerData.humor
            : [],
          core_values: Array.isArray(influencerData.core_values)
            ? influencerData.core_values
            : [],
          current_goals: Array.isArray(influencerData.current_goals)
            ? influencerData.current_goals
            : [],
          background_elements: Array.isArray(influencerData.background_elements)
            ? influencerData.background_elements
            : [],
          color_palette: Array.isArray(influencerData.color_palette)
            ? influencerData.color_palette
            : [],
          // Ensure UUID fields are not empty strings
          elevenlabs_voiceid: influencerData.elevenlabs_voiceid || null,
          elevenlabs_apikey: influencerData.elevenlabs_apikey || null,
          fanvue_api_key: influencerData.fanvue_api_key || null,
          // Include bio field for template influencers
          bio: influencerData.bio || null,
          new: true,
        };

        console.log("Cleaned data:", cleanedData);
        console.log("Request body being sent:", requestBody);
        console.log("Request body keys:", Object.keys(requestBody));
        console.log(
          "Critical fields - user_id:",
          requestBody.user_id,
          "age_lifestyle:",
          requestBody.age_lifestyle
        );
        console.log("Fields that might be UUIDs:", {
          elevenlabs_voiceid: requestBody.elevenlabs_voiceid,
          elevenlabs_apikey: requestBody.elevenlabs_apikey,
          fanvue_api_key: requestBody.fanvue_api_key,
        });
        console.log("Bio field value:", requestBody.bio);
        console.log("Request URL:", `${config.supabase_server_url}/influencer`);
        console.log(
          "Final JSON being sent:",
          JSON.stringify(requestBody, null, 2)
        );

        const response = await fetch(
          `${config.supabase_server_url}/influencer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer WeInfl3nc3withAI",
            },
            body: JSON.stringify(requestBody),
          }
        );

        console.log("Response status:", response.status);
        console.log(
          "Response headers:",
          Object.fromEntries(response.headers.entries())
        );

        if (response.ok) {
          // Get the created influencer ID
          const responseId = await fetch(
            `${config.supabase_server_url}/influencer?user_id=eq.${userData.id}&new=eq.true`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer WeInfl3nc3withAI",
              },
            }
          );

          if (!responseId.ok) {
            console.error(
              "Failed to fetch created influencer:",
              responseId.status,
              responseId.statusText
            );
            toast.error("Influencer created but failed to retrieve ID");
            return;
          }

          const data = await responseId.json();
          if (!data || data.length === 0) {
            console.error("No influencer data returned after creation");
            toast.error("Influencer created but data retrieval failed");
            return;
          }

          const newInfluencerId = data[0].id;

          // Create necessary folders
          const folderPromises = [
            fetch(`${config.backend_url}/createfolder`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer WeInfl3nc3withAI",
              },
              body: JSON.stringify({
                user: userData.id,
                parentfolder: `models/${newInfluencerId}/`,
                folder: "lora",
              }),
            }),
            fetch(`${config.backend_url}/createfolder`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer WeInfl3nc3withAI",
              },
              body: JSON.stringify({
                user: userData.id,
                parentfolder: `models/${newInfluencerId}/`,
                folder: "loratraining",
              }),
            }),
            fetch(`${config.backend_url}/createfolder`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer WeInfl3nc3withAI",
              },
              body: JSON.stringify({
                user: userData.id,
                parentfolder: `models/${newInfluencerId}/`,
                folder: "profilepic",
              }),
            }),
            fetch(`${config.backend_url}/createfolder`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer WeInfl3nc3withAI",
              },
              body: JSON.stringify({
                user: userData.id,
                parentfolder: `models/${newInfluencerId}/`,
                folder: "reference",
              }),
            }),
          ];

          await Promise.all(folderPromises);

          // Update new flag
          await fetch(
            `${config.supabase_server_url}/influencer?id=eq.${newInfluencerId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer WeInfl3nc3withAI",
              },
              body: JSON.stringify({
                new: false,
              }),
            }
          );

          dispatch(
            addInfluencer({
              ...influencerData,
              id: newInfluencerId,
              user_id: userData.id,
              age_lifestyle:
                influencerData.age_lifestyle ||
                influencerData.age ||
                influencerData.lifestyle ||
                "",
              bio: influencerData.bio || null, // Ensure bio field is included
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          );

          // Handle guide step progression
          if (userData.guide_step === 1) {
            try {
              const guideStepResponse = await fetch(
                `${config.supabase_server_url}/user?uuid=eq.${userData.id}`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer WeInfl3nc3withAI",
                  },
                  body: JSON.stringify({
                    guide_step: 2,
                  }),
                }
              );

              if (guideStepResponse.ok) {
                dispatch(setUser({ guide_step: 2 }));
                toast.success(
                  "Influencer created successfully! Moving to next step..."
                );
                navigate("/start");
                return;
              }
            } catch (error) {
              console.error("Failed to update guide_step:", error);
            }
          }

          toast.success("Influencer created successfully");
          navigate("/influencers/profiles");
        } else {
          // Get error details from response
          let errorMessage = "Failed to create influencer";
          try {
            const errorData = await response.text();
            console.error(
              "Create influencer error response:",
              response.status,
              errorData
            );
            console.error(
              "Response headers:",
              Object.fromEntries(response.headers.entries())
            );
            if (errorData) {
              try {
                const parsedError = JSON.parse(errorData);
                errorMessage =
                  parsedError.message || parsedError.error || errorMessage;
                console.error("Parsed error:", parsedError);
              } catch {
                errorMessage = `HTTP ${response.status}: ${errorData}`;
                console.error("Raw error data:", errorData);
              }
            }
          } catch (e) {
            console.error("Failed to read error response:", e);
          }
          toast.error(errorMessage);
        }
      } else {
        // Update existing influencer
        const updatedInfluencerData = {
          ...influencerData,
          updated_at: new Date().toISOString(),
        };

        console.log("Update request body:", updatedInfluencerData);
        console.log("Update bio field:", updatedInfluencerData.bio);

        const response = await fetch(
          `${config.supabase_server_url}/influencer?id=eq.${influencerData.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer WeInfl3nc3withAI",
            },
            body: JSON.stringify(updatedInfluencerData),
          }
        );

        if (response.ok) {
          dispatch(
            updateInfluencer({
              ...updatedInfluencerData,
              user_id: userData.id,
              age_lifestyle:
                influencerData.age_lifestyle ||
                influencerData.age ||
                influencerData.lifestyle ||
                "",
              created_at: originalData?.created_at || new Date().toISOString(),
            })
          );
          toast.success("Influencer updated successfully");
          navigate("/influencers/profiles");
        } else {
          // Get error details from response
          let errorMessage = "Failed to update influencer";
          try {
            const errorData = await response.text();
            console.error(
              "Update influencer error response:",
              response.status,
              errorData
            );
            console.error(
              "Response headers:",
              Object.fromEntries(response.headers.entries())
            );
            if (errorData) {
              try {
                const parsedError = JSON.parse(errorData);
                errorMessage =
                  parsedError.message || parsedError.error || errorMessage;
                console.error("Parsed error:", parsedError);
              } catch {
                errorMessage = `HTTP ${response.status}: ${errorData}`;
                console.error("Raw error data:", errorData);
              }
            }
          } catch (e) {
            console.error("Failed to read error response:", e);
          }
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Save error:", error);

      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error("Network error: Please check your connection");
      } else if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred while saving");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Reset handler
  const handleReset = () => {
    if (hasUnsavedChanges && originalData) {
      if (confirm("Are you sure you want to reset all changes?")) {
        setInfluencerData({ ...originalData });
        setHasUnsavedChanges(false);
        setPreviewImage(null);
        toast.info("Form reset to original values");
      }
    }
  };

  // Get option by label helper
  const getOptionByLabel = (options: Option[], label: string) => {
    return options.find((option) => option.label === label);
  };

  // Clear field helper
  const clearField = (field: string) => {
    handleInputChange(field, "");
  };

  // Additional functions from InfluencerProfiles
  const handleAddTag = (field: string, value: string) => {
    setInfluencerData((prev) => ({
      ...prev,
      [field]: [
        ...((prev[field as keyof typeof influencerData] as string[]) || []),
        value,
      ],
    }));
  };

  const handleRemoveTag = (field: string, tag: string) => {
    setInfluencerData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof influencerData] as string[]).filter(
        (t) => t !== tag
      ),
    }));
  };

  // Example Pictures Upload Functions
  const handleFileUpload = useCallback((file: File, index: number) => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      handleInputChange(`example_pic${index + 1}`, url);
      toast.success(`Example picture ${index + 1} uploaded successfully`);
    } else {
      toast.error("Please upload an image file");
    }
  }, []);

  const uploadImageToVault = async (file: File): Promise<string | null> => {
    if (!userData.id) {
      toast.error("User not authenticated");
      return null;
    }

    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop() || "jpg";
      const filename = `example_${timestamp}.${fileExtension}`;

      // Upload file using the correct API
      const uploadResponse = await fetch(
        `${config.backend_url}/uploadfile?user=${userData.id}&filename=example/${filename}`,
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
      const imageUrl = `${config.data_url}/${userData.id}/example/${filename}`;
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  // Check credit cost for preview generation
  const checkPreviewCreditCost = async () => {
    console.log("🚀 checkPreviewCreditCost: Starting...");
    try {
      setIsCheckingPreviewCredits(true);
      console.log("🚀 Making API request to getgems...");
      const response = await fetch("https://api.nymia.ai/v1/getgems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          item: "nymia_image",
        }),
      });

      console.log("🚀 API response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch credit cost: ${response.status}`);
      }

      const creditData = await response.json();
      console.log("🚀 Credit data received:", creditData);
      return creditData;
    } catch (error) {
      console.error("Error checking credit cost:", error);
      toast.error("Failed to check credit cost. Please try again.");
      return null;
    } finally {
      setIsCheckingPreviewCredits(false);
    }
  };

  // Check credit cost for example images
  const checkCreditCost = async (itemType: string) => {
    try {
      setIsCheckingCredits(true);
      const response = await fetch("https://api.nymia.ai/v1/getgems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          item: itemType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch credit cost: ${response.status}`);
      }

      const creditData = await response.json();
      return creditData;
    } catch (error) {
      console.error("Error checking credit cost:", error);
      toast.error("Failed to check credit cost. Please try again.");
      return null;
    } finally {
      setIsCheckingCredits(false);
    }
  };

  // Handle generate button click with credit check
  const handleGenerateExamples = async () => {
    if (!influencerData || !userData.id) return;

    // Check credit cost first
    const creditData = await checkCreditCost("nymia_image");
    if (!creditData) return;

    // Calculate total required credits for 3 images
    const totalRequiredCredits = creditData.gems * 3;

    setCreditCostData({
      ...creditData,
      gems: totalRequiredCredits,
      originalGemsPerImage: creditData.gems,
    });

    // Check if user has enough credits
    if (userData.credits < totalRequiredCredits) {
      setShowCreditWarning(true);
      return;
    } else {
      // Show confirmation for credit cost
      setShowCreditWarning(true);
      return;
    }
  };

  // Handle preview generation with credit check
  const handlePreviewGenerationWithCreditCheck = async () => {
    console.log("🚀 handlePreviewGenerationWithCreditCheck: Starting...");

    if (!validateFields()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check credit cost first
    console.log("🚀 Checking credit cost...");
    const creditData = await checkPreviewCreditCost();
    console.log("🚀 Credit cost result:", creditData);

    if (!creditData) {
      console.log("🚀 No credit data returned");
      return;
    }

    // Format the credit data to match the expected structure
    const formattedCreditData = {
      id: 1,
      item: "nymia_image",
      description: "Generate preview image for influencer",
      gems: creditData.gems,
      originalGemsPerImage: creditData.gems,
    };

    console.log("🚀 Formatted credit data:", formattedCreditData);
    setPreviewCreditCostData(formattedCreditData);

    // Always show the credit confirmation modal
    // The modal will handle both sufficient and insufficient credits cases
    console.log("🚀 Showing credit warning modal");
    setShowPreviewCreditWarning(true);
  };

  // Handle preview generation after credit confirmation
  const handlePreviewGenerationConfirmed = async () => {
    console.log("🚀 handlePreviewGenerationConfirmed: Starting...");
    setShowPreviewCreditWarning(false);
    console.log("🚀 Calling handleGeneratePreview...");
    await handleGeneratePreview();
    console.log("🚀 handleGeneratePreview completed");
  };

  // Handle individual generate button click with credit check
  const handleGenerateIndividualExample = async (imageIndex: number) => {
    if (!influencerData || !userData.id) return;

    // Check credit cost first
    setIsCheckingIndividualCredits((prev) => ({ ...prev, [imageIndex]: true }));
    const creditData = await checkCreditCost("nymia_image");
    setIsCheckingIndividualCredits((prev) => ({
      ...prev,
      [imageIndex]: false,
    }));

    if (!creditData) return;

    // Store credit data for this specific image
    setIndividualCreditCostData((prev) => ({
      ...prev,
      [imageIndex]: creditData,
    }));

    // Check if user has enough credits
    if (userData.credits < creditData.gems) {
      setShowIndividualCreditWarning((prev) => ({
        ...prev,
        [imageIndex]: true,
      }));
      return;
    } else {
      // Show confirmation for credit cost
      setShowIndividualCreditWarning((prev) => ({
        ...prev,
        [imageIndex]: true,
      }));
      return;
    }
  };

  // Copy file from output to models directory using API
  const copyFileToModelsDirectory = async (
    sourceFilename: string,
    influencerId: string
  ): Promise<string | null> => {
    if (!userData.id) return null;

    try {
      // Extract filename from sourceFilename path
      const filename = sourceFilename.split("/").pop();
      if (!filename) return null;

      const copyData = {
        user: userData.id,
        sourcefilename: sourceFilename,
        destinationfilename: `models/${influencerId}/examples/${filename}`,
      };

      const response = await fetch("https://api.nymia.ai/v1/copyfile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify(copyData),
      });

      if (!response.ok) {
        console.error("Failed to copy file:", sourceFilename);
        return null;
      }

      // Return the new URL for the copied file
      return `https://images.nymia.ai/${userData.id}/models/${influencerId}/examples/${filename}`;
    } catch (error) {
      console.error("Error copying file:", error);
      return null;
    }
  };

  // Save influencer data to database
  const saveInfluencerData = async () => {
    if (!influencerData?.id || !userData.id) return;

    try {
      // Process example images - copy from output directory if needed
      const updatedExamplePics = { ...influencerData };

      // Check and copy each example picture if it's in the output directory
      for (let i = 1; i <= 3; i++) {
        const examplePicKey = `example_pic${i}` as keyof typeof influencerData;
        const currentUrl = influencerData[examplePicKey] as string;

        if (currentUrl && currentUrl.includes("/output/")) {
          // Extract the filename from the URL
          const urlParts = currentUrl.split("/");
          const filename = urlParts[urlParts.length - 1]; // Get the actual filename

          if (filename) {
            // Copy the file to the models directory
            const newUrl = await copyFileToModelsDirectory(
              `output/${filename}`,
              influencerData.id
            );

            if (newUrl) {
              (updatedExamplePics as any)[examplePicKey] = newUrl;

              // Update local state immediately
              handleInputChange(examplePicKey, newUrl);

              toast.success(`Example picture ${i} moved to permanent storage`);
            } else {
              toast.error(
                `Failed to move example picture ${i} to permanent storage`
              );
            }
          }
        }
      }

      // Save to database with updated URLs
      const response = await fetch(
        `${config.supabase_server_url}/influencer?id=eq.${influencerData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify({
            example_pic1: updatedExamplePics.example_pic1,
            example_pic2: updatedExamplePics.example_pic2,
            example_pic3: updatedExamplePics.example_pic3,
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to save example images to database");
        toast.error("Failed to save example images");
      } else {
        toast.success("Example images saved successfully");
      }
    } catch (error) {
      console.error("Error saving example images:", error);
      toast.error("Error saving example images");
    }
  };

  // Generate single example image
  const generateSingleExampleImage = async (imageIndex: number) => {
    if (!influencerData || !userData.id) return;

    setIsGeneratingIndividual((prev) => ({ ...prev, [imageIndex]: true }));

    try {
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

      // Create request data similar to the content generation
      const requestData = {
        task: "generate_example",
        number_of_images: 1,
        quality: "Quality",
        nsfw_strength: -1,
        lora: "",
        noAI: false,
        prompt: "",
        lora_strength: 0,
        seed: -1,
        guidance: 7,
        negative_prompt: imageIndex.toString(), // Use image index as identifier
        model: {
          id: influencerData.id,
          influencer_type: influencerData.influencer_type,
          sex: influencerData.sex,
          cultural_background: influencerData.cultural_background,
          hair_length: influencerData.hair_length,
          hair_color: influencerData.hair_color,
          hair_style: influencerData.hair_style,
          eye_color: influencerData.eye_color,
          lip_style: influencerData.lip_style,
          nose_style: influencerData.nose_style,
          face_shape: influencerData.face_shape,
          facial_features: influencerData.facial_features,
          skin_tone: influencerData.skin_tone,
          bust: influencerData.bust_size,
          body_type: influencerData.body_type,
          color_palette: influencerData.color_palette || [],
          clothing_style_everyday: influencerData.clothing_style_everyday,
          eyebrow_style: influencerData.eyebrow_style,
          makeup_style: "Default",
          name_first: influencerData.name_first,
          name_last: influencerData.name_last,
          visual_only: influencerData.visual_only,
          age: influencerData.age,
          lifestyle: influencerData.lifestyle,
        },
        scene: {
          framing: "",
          rotation: "",
          lighting_preset: "",
          scene_setting: "",
          pose: "",
          clothes: "",
        },
      };

      const response = await fetch(
        `${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createimage`,
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
      console.log(`Generated example image ${imageIndex} task:`, result);

      if (result.id) {
        // Start polling for the image
        const pollForImage = async () => {
          try {
            const imagesResponse = await fetch(
              `${config.supabase_server_url}/generated_images?task_id=eq.${result.id}`,
              {
                headers: {
                  Authorization: "Bearer WeInfl3nc3withAI",
                },
              }
            );
            const imagesData = await imagesResponse.json();

            if (imagesData.length > 0) {
              if (
                imagesData[0].generation_status === "completed" &&
                imagesData[0].file_path
              ) {
                const completedImage = imagesData[0];
                const imageUrl = `${config.data_url}/${completedImage.file_path}`;

                console.log(`Generated image ${imageIndex}:`, imageUrl);

                // Update the specific example image using the field name pattern
                const fieldName = `example_pic${imageIndex}`;
                handleInputChange(fieldName, imageUrl);

                // Save to database
                await saveInfluencerData();

                toast.success(
                  `Example image ${imageIndex} generated successfully!`
                );
                setIsGeneratingIndividual((prev) => ({
                  ...prev,
                  [imageIndex]: false,
                }));
                return;
              } else if (imagesData[0].generation_status === "failed") {
                console.error(`Image ${imageIndex} generation failed`);
                toast.error(`Failed to generate example image ${imageIndex}`);
                setIsGeneratingIndividual((prev) => ({
                  ...prev,
                  [imageIndex]: false,
                }));
                return;
              } else {
                console.log(
                  `Image ${imageIndex} not ready yet. Status:`,
                  imagesData[0]?.generation_status
                );
              }
            }

            // Continue polling if not completed
            setTimeout(pollForImage, 2000);
          } catch (error) {
            console.error(`Error polling for image ${imageIndex}:`, error);
            toast.error(`Failed to fetch generated image ${imageIndex}`);
            setIsGeneratingIndividual((prev) => ({
              ...prev,
              [imageIndex]: false,
            }));
          }
        };

        pollForImage();
      } else {
        throw new Error("No task ID received");
      }
    } catch (error) {
      console.error(`Error generating example image ${imageIndex}:`, error);
      toast.error(`Failed to generate example image ${imageIndex}`);
      setIsGeneratingIndividual((prev) => ({ ...prev, [imageIndex]: false }));
    }
  };

  // Generate example images using API (called after credit confirmation)
  const generateExampleImages = async () => {
    if (!influencerData || !userData.id) return;

    setIsGeneratingExamples(true);

    try {
      // Get user ID
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

      // Create base request data
      const baseRequestData = {
        task: "generate_example", // Changed from generate_preview
        number_of_images: 1,
        quality: "Quality",
        nsfw_strength: -1,
        lora: "",
        noAI: false,
        prompt: "",
        lora_strength: 0,
        seed: -1,
        guidance: 7,
        model: {
          id: influencerData.id,
          influencer_type: influencerData.influencer_type,
          sex: influencerData.sex,
          cultural_background: influencerData.cultural_background,
          hair_length: influencerData.hair_length,
          hair_color: influencerData.hair_color,
          hair_style: influencerData.hair_style,
          eye_color: influencerData.eye_color,
          lip_style: influencerData.lip_style,
          nose_style: influencerData.nose_style,
          face_shape: influencerData.face_shape,
          facial_features: influencerData.facial_features,
          skin_tone: influencerData.skin_tone,
          bust: influencerData.bust_size,
          body_type: influencerData.body_type,
          color_palette: influencerData.color_palette || [],
          clothing_style_everyday: influencerData.clothing_style_everyday,
          eyebrow_style: influencerData.eyebrow_style,
          makeup_style: "Default",
          name_first: influencerData.name_first,
          name_last: influencerData.name_last,
          visual_only: influencerData.visual_only,
          age: influencerData.age,
          lifestyle: influencerData.lifestyle,
        },
        scene: {
          framing: "",
          rotation: "",
          lighting_preset: "",
          scene_setting: "",
          pose: "",
          clothes: "",
        },
      };

      // Send 3 requests for the example images
      const requests = [
        { negative_prompt: "1", order: 0 },
        { negative_prompt: "2", order: 1 },
        { negative_prompt: "3", order: 2 },
      ];

      const taskPromises = requests.map(async (request) => {
        const requestData = {
          ...baseRequestData,
          negative_prompt: request.negative_prompt,
        };
        const response = await fetch(
          `${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createimage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer WeInfl3nc3withAI",
            },
            body: JSON.stringify(requestData),
          }
        );

        const result = await response.json();
        return { taskId: result.id, order: request.order };
      });

      const taskResults = await Promise.all(taskPromises);

      // Poll for images
      const pollForImages = async () => {
        try {
          let allCompleted = true;
          let completedCount = 0;

          for (const taskResult of taskResults) {
            const imagesResponse = await fetch(
              `${config.supabase_server_url}/generated_images?task_id=eq.${taskResult.taskId}`,
              {
                headers: {
                  Authorization: "Bearer WeInfl3nc3withAI",
                },
              }
            );
            const imagesData = await imagesResponse.json();

            if (imagesData.length > 0) {
              if (
                imagesData[0].generation_status === "completed" &&
                imagesData[0].file_path
              ) {
                const completedImage = imagesData[0];
                const imageUrl = `${config.data_url}/${completedImage.file_path}`;

                console.log(
                  `Generated image ${taskResult.order + 1}:`,
                  imageUrl
                );

                // Update the corresponding example picture
                const fieldName = `example_pic${taskResult.order + 1}`;
                handleInputChange(fieldName, imageUrl);
                completedCount++;

                console.log(`Updated ${fieldName} with URL:`, imageUrl);
              } else if (imagesData[0].generation_status === "failed") {
                console.error(
                  `Image ${taskResult.order + 1} generation failed`
                );
                completedCount++; // Count as processed even if failed
              } else {
                allCompleted = false;
                console.log(
                  `Image ${taskResult.order + 1} not ready yet. Status:`,
                  imagesData[0]?.generation_status
                );
              }
            } else {
              allCompleted = false;
              console.log(`No image data found for task ${taskResult.taskId}`);
            }
          }

          if (allCompleted || completedCount === taskResults.length) {
            // Save to database
            await saveInfluencerData();

            setIsGeneratingExamples(false);
            if (completedCount === taskResults.length) {
              toast.success(
                `Generated ${completedCount} example images successfully!`
              );
            } else {
              toast.warning(
                `Generated ${completedCount} out of ${taskResults.length} example images`
              );
            }
            return;
          }

          // Continue polling if not all completed
          setTimeout(pollForImages, 2000);
        } catch (error) {
          console.error("Error polling for images:", error);
          toast.error("Failed to fetch generated images");
          setIsGeneratingExamples(false);
        }
      };

      pollForImages();
    } catch (error) {
      console.error("Generate example error:", error);
      toast.error("Failed to generate example images");
      setIsGeneratingExamples(false);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedImageIndex !== null) {
      handleFileUpload(file, selectedImageIndex);
      // Clear the file input so the same file can be uploaded again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileUpload = useCallback((index: number) => {
    setSelectedImageIndex(index);
    fileInputRef.current?.click();
  }, []);

  const handleVaultImageSelect = (image: any) => {
    if (selectedImageIndex !== null) {
      // Use the same URL construction logic as VaultSelector
      const imageUrl = `${config.data_url}/${userData.id}/${
        image.user_filename === "" ? "output" : "vault/" + image.user_filename
      }/${image.system_filename}`;
      handleInputChange(`example_pic${selectedImageIndex + 1}`, imageUrl);
      setShowVaultSelector(false);
      setSelectedImageIndex(null);
      toast.success(
        `Example picture ${selectedImageIndex + 1} selected from library`
      );
    }
  };

  // Helper function to render option cards with descriptions (for wardrobe modal)
  const renderOptionCard = (
    option: Option | undefined,
    placeholder: string = "Select option",
    showDescription: boolean = false,
    item: string = "",
    handleInputChange: (field: string, value: string) => void,
    refreshData: string = ""
  ) => {
    if (!option?.image) {
      return (
        <Card className="relative w-full border max-w-[250px]">
          <CardContent className="p-4">
            <div
              className="relative w-full group text-center"
              style={{ paddingBottom: "100%" }}
            >
              {placeholder}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="relative w-full max-w-[250px]">
        <CardContent className="p-4">
          <div
            className="relative w-full group text-center"
            style={{ paddingBottom: "100%" }}
          >
            <img
              src={`${config.data_url}/wizard/mappings400/${option.image}`}
              className="absolute inset-0 w-full h-full object-cover rounded-md"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute bottom-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleInputChange(item, refreshData);
              }}
            >
              <Trash2 className="w-4 h-4 text-white" />
            </Button>
          </div>
          <p className="text-sm text-center font-medium mt-2">{option.label}</p>
          {showDescription && option.description && (
            <p className="text-xs text-center text-muted-foreground mt-1 line-clamp-2">
              {option.description}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const handleOnlySave = async () => {
    if (!validateFields()) {
      return;
    }

    setIsUpdating(true);

    if (profileImageId) {
      const extension = profileImageId.substring(
        profileImageId.lastIndexOf(".") + 1
      );
      await fetch(`${config.backend_url}/copyfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `vault/Inbox/${profileImageId}`,
          destinationfilename: `models/${influencerData.id}/profilepic/profilepic${influencerData.image_num}.${extension}`,
        }),
      });

      influencerData.image_url = `${config.data_url}/${userData.id}/models/${influencerData.id}/profilepic/profilepic${influencerData.image_num}.png`;
      influencerData.image_num = influencerData.image_num + 1;
    }

    try {
      const updatedInfluencerData = {
        ...influencerData,
        updated_at: new Date().toISOString(),
      };

      const response = await fetch(
        `${config.supabase_server_url}/influencer?id=eq.${influencerData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify(updatedInfluencerData),
        }
      );

      dispatch(
        updateInfluencer({
          ...updatedInfluencerData,
          user_id: userData.id,
          age_lifestyle: influencerData.age || "",
          created_at: originalData?.created_at || new Date().toISOString(),
        })
      );

      if (response.ok) {
        toast.success("Influencer updated successfully");
        navigate("/influencers/profiles");
      } else {
        toast.error("Failed to update influencer");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreview = async () => {
    if (!validateFields()) {
      return;
    }

    setIsPreviewLoading(true);

    const initialPreviewImages = [
      {
        imageUrl: "",
        negativePrompt: "1",
        isRecommended: true,
        isLoading: true,
        taskId: "",
      },
    ];

    setPreviewImages(initialPreviewImages);
    setShowPreviewModal(true);

    try {
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

      const baseRequestData = {
        task: "generate_preview",
        number_of_images: 1,
        quality: "Quality",
        nsfw_strength: -1,
        lora: "",
        noAI: false,
        prompt: "",
        lora_strength: 0,
        seed: -1,
        guidance: 7,
        model: influencerData
          ? {
              id: influencerData.id,
              influencer_type: influencerData.influencer_type,
              sex: influencerData.sex,
              cultural_background: influencerData.cultural_background,
              hair_length: influencerData.hair_length,
              hair_color: influencerData.hair_color,
              hair_style: influencerData.hair_style,
              eye_color: influencerData.eye_color,
              lip_style: influencerData.lip_style,
              nose_style: influencerData.nose_style,
              face_shape: influencerData.face_shape,
              facial_features: influencerData.facial_features,
              skin_tone: influencerData.skin_tone,
              bust: influencerData.bust_size,
              body_type: influencerData.body_type,
              color_palette: influencerData.color_palette || [],
              clothing_style_everyday: influencerData.clothing_style_everyday,
              eyebrow_style: influencerData.eyebrow_style,
              name_first: influencerData.name_first,
              name_last: influencerData.name_last,
              visual_only: influencerData.visual_only,
              age: influencerData.age,
              lifestyle: influencerData.lifestyle,
            }
          : null,
        scene: {
          framing: "",
          rotation: "",
          lighting_preset: "",
          scene_setting: "",
          pose: "",
          clothes: "",
        },
      };

      const requests = [{ negative_prompt: "1", order: 0, displayIndex: 0 }];

      const taskPromises = requests.map(async (request) => {
        const requestData = {
          ...baseRequestData,
          negative_prompt: request.negative_prompt,
        };

        const response = await fetch(
          `${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createimage`,
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
        return {
          taskId: result.id,
          order: request.order,
          displayIndex: request.displayIndex,
          negativePrompt: request.negative_prompt,
        };
      });

      const taskResults = await Promise.all(taskPromises);

      const pollForImages = async () => {
        try {
          let allCompleted = true;

          for (const taskResult of taskResults) {
            const imagesResponse = await fetch(
              `${config.supabase_server_url}/generated_images?task_id=eq.${taskResult.taskId}`,
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
              const imageUrl = `${config.data_url}/${userData.id}/${
                completedImage.user_filename === "" ||
                completedImage.user_filename === null
                  ? "output"
                  : "vault/" + completedImage.user_filename
              }/${completedImage.system_filename}`;

              setPreviewImages((prev) =>
                prev.map((img, index) =>
                  index === taskResult.displayIndex
                    ? {
                        ...img,
                        imageUrl,
                        isLoading: false,
                        taskId: taskResult.taskId,
                        systemFilename: completedImage.system_filename,
                      }
                    : img
                )
              );
            } else {
              allCompleted = false;
            }
          }

          if (allCompleted) {
            setIsPreviewLoading(false);
            toast.success("Preview image generated successfully!");
            return;
          }

          setTimeout(pollForImages, 2000);
        } catch (error) {
          console.error("Error polling for images:", error);
          toast.error("Failed to fetch preview images");
          setIsPreviewLoading(false);
        }
      };

      pollForImages();
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("Failed to generate preview images");
      setIsPreviewLoading(false);
    }
  };

  const handleUseAsProfilePicture = async () => {
    if (!generatedImageData) {
      toast.error("No generated image available");
      return;
    }

    if (!influencerData.id) {
      toast.error(
        "Please save the influencer first before setting a profile picture"
      );
      return;
    }

    try {
      console.log("Setting profile picture with data:", {
        generatedImageData,
        influencerData,
      });

      const num =
        influencerData.image_num === null ||
        influencerData.image_num === undefined
          ? 0
          : influencerData.image_num;

      // Extract the correct filename from the generated image data
      const systemFilename = generatedImageData.system_filename;

      console.log("Using system filename:", systemFilename);

      const copyResponse = await fetch(`${config.backend_url}/copyfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: userData.id,
          sourcefilename: `output/${systemFilename}`,
          destinationfilename: `models/${influencerData.id}/profilepic/profilepic${num}.png`,
        }),
      });

      if (!copyResponse.ok) {
        throw new Error("Failed to copy image to profile picture");
      }

      const newImageUrl = `${config.data_url}/${userData.id}/models/${influencerData.id}/profilepic/profilepic${num}.png`;

      setInfluencerData((prev) => ({
        ...prev,
        image_url: newImageUrl,
        image_num: num + 1,
      }));

      const updateResponse = await fetch(
        `${config.supabase_server_url}/influencer?id=eq.${influencerData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify({
            image_url: newImageUrl,
            image_num: num + 1,
          }),
        }
      );

      if (updateResponse.ok) {
        // Update Redux store
        dispatch(
          updateInfluencer({
            ...influencerData,
            image_url: newImageUrl,
            image_num: num + 1,
            user_id: userData.id,
            age_lifestyle: influencerData.age || "",
            created_at: originalData?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        );
      }

      setPreviewImage(null);
      setGeneratedImageData(null);

      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error setting profile picture:", error);
      toast.error("Failed to set profile picture");
    }
  };

  if (isOptionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-muted-foreground">Loading options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {location.state?.fromTemplate
                    ? "Customize Template"
                    : location.state?.create
                    ? "Create Influencer"
                    : "Edit Influencer"}
                </h1>
                {location.state?.fromTemplate && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 text-sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Template
                  </Badge>
                )}
              </div>
              {/* <Badge
                variant="secondary"
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              >
                Production v1.0
              </Badge> */}
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {location.state?.fromTemplate
                ? "Customize your selected template to create a unique influencer"
                : "Advanced influencer customization with database integration"}
            </p>
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-orange-600 dark:text-orange-400">
                  Unsaved changes
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/influencers/profiles")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List
            </Button>
            {hasUnsavedChanges && (
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg hover:shadow-xl"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information - Expanded by default */}
            <EnhancedAccordionSection
              title="Basic Information"
              icon={User}
              isExpanded={expandedSections.basicInformation}
              onToggle={() => toggleSection("basicInformation")}
              isRequired
              description="Essential information about your influencer"
            >
              <div className="space-y-6">
                {/* Names and Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={influencerData.name_first}
                      onChange={(e) =>
                        handleInputChange("name_first", e.target.value)
                      }
                      placeholder="Enter first name"
                      className={
                        validationErrors.name_first ? "border-red-500" : ""
                      }
                    />
                    {validationErrors.name_first && (
                      <p className="text-sm text-red-500">
                        {validationErrors.name_first}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={influencerData.name_last}
                      onChange={(e) =>
                        handleInputChange("name_last", e.target.value)
                      }
                      placeholder="Enter last name"
                      className={
                        validationErrors.name_last ? "border-red-500" : ""
                      }
                    />
                    {validationErrors.name_last && (
                      <p className="text-sm text-red-500">
                        {validationErrors.name_last}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={influencerData.influencer_type}
                      onValueChange={(value) =>
                        handleInputChange("influencer_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {INFLUENCER_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sex, Age, Cultural Background */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Sex</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.sex}
                        onValueChange={(value) =>
                          handleInputChange("sex", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          {sexOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          sexOptions,
                          influencerData.sex
                        )}
                        onSelect={() => setShowSexSelector(true)}
                        onImageClick={() => setShowSexSelector(true)}
                        onClear={() => clearField("sex")}
                        placeholder="Select sex"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.age}
                        onValueChange={(value) =>
                          handleInputChange("age", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select age" />
                        </SelectTrigger>
                        <SelectContent>
                          {ageOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          ageOptions,
                          influencerData.age
                        )}
                        onSelect={() => setShowAgeSelector(true)}
                        onImageClick={() => setShowAgeSelector(true)}
                        onClear={() => clearField("age")}
                        placeholder="Select age"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cultural Background</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.cultural_background}
                        onValueChange={(value) =>
                          handleInputChange("cultural_background", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select background" />
                        </SelectTrigger>
                        <SelectContent>
                          {culturalBackgroundOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          culturalBackgroundOptions,
                          influencerData.cultural_background
                        )}
                        onSelect={() => setShowCulturalBackgroundSelector(true)}
                        onImageClick={() =>
                          setShowCulturalBackgroundSelector(true)
                        }
                        onClear={() => clearField("cultural_background")}
                        placeholder="Select background"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </EnhancedAccordionSection>

            {/* Define the Look */}
            <EnhancedAccordionSection
              title="Define the Look"
              icon={Eye}
              isExpanded={expandedSections.defineLook}
              onToggle={() => toggleSection("defineLook")}
              description="Physical appearance and visual characteristics"
            >
              <div className="space-y-6">
                {/* Skin, Hair Color, Hair Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Skin Tone</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.skin_tone}
                        onValueChange={(value) =>
                          handleInputChange("skin_tone", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select skin tone" />
                        </SelectTrigger>
                        <SelectContent>
                          {skinOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          skinOptions,
                          influencerData.skin_tone
                        )}
                        onSelect={() => setShowSkinSelector(true)}
                        onImageClick={() => setShowSkinSelector(true)}
                        onClear={() => clearField("skin_tone")}
                        placeholder="Select skin tone"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Hair Color</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.hair_color}
                        onValueChange={(value) =>
                          handleInputChange("hair_color", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hair color" />
                        </SelectTrigger>
                        <SelectContent>
                          {hairColorOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          hairColorOptions,
                          influencerData.hair_color
                        )}
                        onSelect={() => setShowHairColorSelector(true)}
                        onImageClick={() => setShowHairColorSelector(true)}
                        onClear={() => clearField("hair_color")}
                        placeholder="Select hair color"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Hair Style</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.hair_style}
                        onValueChange={(value) =>
                          handleInputChange("hair_style", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hair style" />
                        </SelectTrigger>
                        <SelectContent>
                          {hairStyleOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          hairStyleOptions,
                          influencerData.hair_style
                        )}
                        onSelect={() => setShowHairStyleSelector(true)}
                        onImageClick={() => setShowHairStyleSelector(true)}
                        onClear={() => clearField("hair_style")}
                        placeholder="Select hair style"
                      />
                    </div>
                  </div>
                </div>

                {/* Body Type, Face Shape, Eye Color */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Body Type</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.body_type}
                        onValueChange={(value) =>
                          handleInputChange("body_type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select body type" />
                        </SelectTrigger>
                        <SelectContent>
                          {bodyTypeOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          bodyTypeOptions,
                          influencerData.body_type
                        )}
                        onSelect={() => setShowBodyTypeSelector(true)}
                        onImageClick={() => setShowBodyTypeSelector(true)}
                        onClear={() => clearField("body_type")}
                        placeholder="Select body type"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Face Shape</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.face_shape}
                        onValueChange={(value) =>
                          handleInputChange("face_shape", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select face shape" />
                        </SelectTrigger>
                        <SelectContent>
                          {faceShapeOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          faceShapeOptions,
                          influencerData.face_shape
                        )}
                        onSelect={() => setShowFaceShapeSelector(true)}
                        onImageClick={() => setShowFaceShapeSelector(true)}
                        onClear={() => clearField("face_shape")}
                        placeholder="Select face shape"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Eye Color</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.eye_color}
                        onValueChange={(value) =>
                          handleInputChange("eye_color", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select eye color" />
                        </SelectTrigger>
                        <SelectContent>
                          {eyeColorOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          eyeColorOptions,
                          influencerData.eye_color
                        )}
                        onSelect={() => setShowEyeColorSelector(true)}
                        onImageClick={() => setShowEyeColorSelector(true)}
                        onClear={() => clearField("eye_color")}
                        placeholder="Select eye color"
                      />
                    </div>
                  </div>
                </div>

                {/* Bust Size - Important for female influencers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Bust Size</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.bust_size}
                        onValueChange={(value) =>
                          handleInputChange("bust_size", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select bust size" />
                        </SelectTrigger>
                        <SelectContent>
                          {bustOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          bustOptions,
                          influencerData.bust_size
                        )}
                        onSelect={() => setShowBustSelector(true)}
                        onImageClick={() => setShowBustSelector(true)}
                        onClear={() => clearField("bust_size")}
                        placeholder="Select bust size"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </EnhancedAccordionSection>

            {/* Detailed Features - Only in Advanced Mode */}
            {isAdvancedMode && (
              <EnhancedAccordionSection
                title="Detailed Features"
                icon={Settings}
                isExpanded={expandedSections.detailedFeatures}
                onToggle={() => toggleSection("detailedFeatures")}
                description="Advanced appearance customization options"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Hair Length</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.hair_length}
                        onValueChange={(value) =>
                          handleInputChange("hair_length", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hair length" />
                        </SelectTrigger>
                        <SelectContent>
                          {hairLengthOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          hairLengthOptions,
                          influencerData.hair_length
                        )}
                        onSelect={() => setShowHairLengthSelector(true)}
                        onImageClick={() => setShowHairLengthSelector(true)}
                        onClear={() => clearField("hair_length")}
                        placeholder="Select hair length"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Eye Shape</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.eye_shape}
                        onValueChange={(value) =>
                          handleInputChange("eye_shape", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select eye shape" />
                        </SelectTrigger>
                        <SelectContent>
                          {eyeShapeOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          eyeShapeOptions,
                          influencerData.eye_shape
                        )}
                        onSelect={() => setShowEyeShapeSelector(true)}
                        onImageClick={() => setShowEyeShapeSelector(true)}
                        onClear={() => clearField("eye_shape")}
                        placeholder="Select eye shape"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Lip Style</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.lip_style}
                        onValueChange={(value) =>
                          handleInputChange("lip_style", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select lip style" />
                        </SelectTrigger>
                        <SelectContent>
                          {lipOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          lipOptions,
                          influencerData.lip_style
                        )}
                        onSelect={() => setShowLipSelector(true)}
                        onImageClick={() => setShowLipSelector(true)}
                        onClear={() => clearField("lip_style")}
                        placeholder="Select lip style"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Nose Style</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.nose_style}
                        onValueChange={(value) =>
                          handleInputChange("nose_style", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select nose style" />
                        </SelectTrigger>
                        <SelectContent>
                          {noseOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          noseOptions,
                          influencerData.nose_style
                        )}
                        onSelect={() => setShowNoseSelector(true)}
                        onImageClick={() => setShowNoseSelector(true)}
                        onClear={() => clearField("nose_style")}
                        placeholder="Select nose style"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Eyebrow Style</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.eyebrow_style}
                        onValueChange={(value) =>
                          handleInputChange("eyebrow_style", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select eyebrow style" />
                        </SelectTrigger>
                        <SelectContent>
                          {eyebrowOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          eyebrowOptions,
                          influencerData.eyebrow_style
                        )}
                        onSelect={() => setShowEyebrowSelector(true)}
                        onImageClick={() => setShowEyebrowSelector(true)}
                        onClear={() => clearField("eyebrow_style")}
                        placeholder="Select eyebrow style"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Facial Features</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.facial_features}
                        onValueChange={(value) =>
                          handleInputChange("facial_features", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select facial features" />
                        </SelectTrigger>
                        <SelectContent>
                          {facialFeaturesOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          facialFeaturesOptions,
                          influencerData.facial_features
                        )}
                        onSelect={() => setShowFacialFeaturesSelector(true)}
                        onImageClick={() => setShowFacialFeaturesSelector(true)}
                        onClear={() => clearField("facial_features")}
                        placeholder="Select facial features"
                      />
                    </div>
                  </div>
                </div>
              </EnhancedAccordionSection>
            )}

            {/* Personal Information */}
            <EnhancedAccordionSection
              title="Personal Information"
              icon={User}
              isExpanded={expandedSections.personalInformation}
              onToggle={() => toggleSection("personalInformation")}
              description="Background and personal details"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Lifestyle</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.lifestyle}
                        onValueChange={(value) =>
                          handleInputChange("lifestyle", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select lifestyle" />
                        </SelectTrigger>
                        <SelectContent>
                          {lifestyleOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          lifestyleOptions,
                          influencerData.lifestyle
                        )}
                        onSelect={() => setShowLifestyleSelector(true)}
                        onImageClick={() => setShowLifestyleSelector(true)}
                        onClear={() => clearField("lifestyle")}
                        placeholder="Select lifestyle"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Birth Origin</Label>
                    <Input
                      value={influencerData.origin_birth}
                      onChange={(e) =>
                        handleInputChange("origin_birth", e.target.value)
                      }
                      placeholder="e.g., New York, USA"
                    />
                  </div>
                  {/* Empty third column to maintain 3-column layout */}
                  <div></div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={influencerData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Add any additional notes or comments about this influencer..."
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </EnhancedAccordionSection>

            {/* Content Generation */}
            <EnhancedAccordionSection
              title="Content Generation"
              icon={Brain}
              isExpanded={expandedSections.contentGeneration}
              onToggle={() => toggleSection("contentGeneration")}
              description="AI-powered content generation settings"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-green-500" />
                    User Prompt for Special Features
                  </Label>
                  <Textarea
                    value={influencerData.prompt || ""}
                    onChange={(e) =>
                      handleInputChange("prompt", e.target.value)
                    }
                    placeholder="Add special features or characteristics (e.g., 'wearing modern black glasses', 'has a small scar on left cheek', 'always wears a silver necklace')..."
                    rows={4}
                    className="border-2 focus:border-green-500/50 transition-colors"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      This prompt will be used for additional customization
                      during generation
                    </span>
                    <span>{influencerData.prompt?.length || 0}/500</span>
                  </div>
                </div>
              </div>
            </EnhancedAccordionSection>
          </div>

          {/* Right Column - Enhanced Live Preview */}
          <div className="lg:col-span-1">
            <EnhancedLivePreview
              influencerData={influencerData}
              isGenerating={isGenerating}
              isCheckingPreviewCredits={isCheckingPreviewCredits}
              onGenerate={handleGeneratePreview}
              onSetAsProfile={handleSetAsProfile}
              previewImage={previewImage}
              onOpenAIPersonality={() => setShowAIPersonalityModal(true)}
              onOpenIntegrations={() => setShowIntegrationsModal(true)}
              onOpenExamplePictures={() => setShowExamplePicturesModal(true)}
              onOpenWardrobe={() => setShowWardrobeModal(true)}
              handlePreviewGenerationWithCreditCheck={
                handlePreviewGenerationWithCreditCheck
              }
            />

            {/* Mode Toggle - Small and discrete under Live Preview */}
            <div className="mt-4">
              <EnhancedModeToggle
                isAdvanced={isAdvancedMode}
                onToggle={setIsAdvancedMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Option Selectors */}
      {showSkinSelector && (
        <OptionSelector
          options={skinOptions}
          onSelect={(label) => handleInputChange("skin_tone", label)}
          onClose={() => setShowSkinSelector(false)}
          title="Select Skin Tone"
        />
      )}

      {showHairColorSelector && (
        <OptionSelector
          options={hairColorOptions}
          onSelect={(label) => handleInputChange("hair_color", label)}
          onClose={() => setShowHairColorSelector(false)}
          title="Select Hair Color"
        />
      )}

      {showHairStyleSelector && (
        <OptionSelector
          options={hairStyleOptions}
          onSelect={(label) => handleInputChange("hair_style", label)}
          onClose={() => setShowHairStyleSelector(false)}
          title="Select Hair Style"
        />
      )}

      {showEyeColorSelector && (
        <OptionSelector
          options={eyeColorOptions}
          onSelect={(label) => handleInputChange("eye_color", label)}
          onClose={() => setShowEyeColorSelector(false)}
          title="Select Eye Color"
        />
      )}

      {showBodyTypeSelector && (
        <OptionSelector
          options={bodyTypeOptions}
          onSelect={(label) => handleInputChange("body_type", label)}
          onClose={() => setShowBodyTypeSelector(false)}
          title="Select Body Type"
        />
      )}

      {showFaceShapeSelector && (
        <OptionSelector
          options={faceShapeOptions}
          onSelect={(label) => handleInputChange("face_shape", label)}
          onClose={() => setShowFaceShapeSelector(false)}
          title="Select Face Shape"
        />
      )}

      {showBustSelector && (
        <OptionSelector
          options={bustOptions}
          onSelect={(label) => handleInputChange("bust_size", label)}
          onClose={() => setShowBustSelector(false)}
          title="Select Bust Size"
        />
      )}

      {showCulturalBackgroundSelector && (
        <OptionSelector
          options={culturalBackgroundOptions}
          onSelect={(label) => handleInputChange("cultural_background", label)}
          onClose={() => setShowCulturalBackgroundSelector(false)}
          title="Select Cultural Background"
        />
      )}

      {showSexSelector && (
        <OptionSelector
          options={sexOptions}
          onSelect={(label) => handleInputChange("sex", label)}
          onClose={() => setShowSexSelector(false)}
          title="Select Sex"
        />
      )}

      {showAgeSelector && (
        <OptionSelector
          options={ageOptions}
          onSelect={(label) => handleInputChange("age", label)}
          onClose={() => setShowAgeSelector(false)}
          title="Select Age"
        />
      )}

      {showLifestyleSelector && (
        <OptionSelector
          options={lifestyleOptions}
          onSelect={(label) => handleInputChange("lifestyle", label)}
          onClose={() => setShowLifestyleSelector(false)}
          title="Select Lifestyle"
        />
      )}

      {/* Advanced Mode Selectors */}
      {showHairLengthSelector && (
        <OptionSelector
          options={hairLengthOptions}
          onSelect={(label) => handleInputChange("hair_length", label)}
          onClose={() => setShowHairLengthSelector(false)}
          title="Select Hair Length"
        />
      )}

      {showEyeShapeSelector && (
        <OptionSelector
          options={eyeShapeOptions}
          onSelect={(label) => handleInputChange("eye_shape", label)}
          onClose={() => setShowEyeShapeSelector(false)}
          title="Select Eye Shape"
        />
      )}

      {showLipSelector && (
        <OptionSelector
          options={lipOptions}
          onSelect={(label) => handleInputChange("lip_style", label)}
          onClose={() => setShowLipSelector(false)}
          title="Select Lip Style"
        />
      )}

      {showNoseSelector && (
        <OptionSelector
          options={noseOptions}
          onSelect={(label) => handleInputChange("nose_style", label)}
          onClose={() => setShowNoseSelector(false)}
          title="Select Nose Style"
        />
      )}

      {showEyebrowSelector && (
        <OptionSelector
          options={eyebrowOptions}
          onSelect={(label) => handleInputChange("eyebrow_style", label)}
          onClose={() => setShowEyebrowSelector(false)}
          title="Select Eyebrow Style"
        />
      )}

      {showFacialFeaturesSelector && (
        <OptionSelector
          options={facialFeaturesOptions}
          onSelect={(label) => handleInputChange("facial_features", label)}
          onClose={() => setShowFacialFeaturesSelector(false)}
          title="Select Facial Features"
        />
      )}

      {/* AI Personality Modal */}
      <AIPersonalityModal
        isOpen={showAIPersonalityModal}
        onClose={() => setShowAIPersonalityModal(false)}
        influencerData={influencerData}
        onUpdate={handleInputChange}
        options={{
          contentFocusOptions,
          jobAreaOptions,
          hobbyOptions,
          strengthOptions,
          weaknessOptions,
          speechOptions,
          humorOptions,
          coreValuesOptions,
          goalsOptions,
          backgroundOptions,
          contentFocusAreasOptions,
        }}
      />

      {/* Integrations Modal */}
      <IntegrationsModal
        isOpen={showIntegrationsModal}
        onClose={() => setShowIntegrationsModal(false)}
        influencerData={influencerData}
        onUpdate={handleInputChange}
        onDispatch={dispatch}
      />

      {/* Example Pictures Modal */}
      {showExamplePicturesModal && (
        <Dialog
          open={showExamplePicturesModal}
          onOpenChange={setShowExamplePicturesModal}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Example Pictures
              </DialogTitle>
              <DialogDescription>
                Upload, select, or generate three example pictures for your
                influencer
              </DialogDescription>
            </DialogHeader>

            {/* Generate Button for all example images */}
            <div className="mb-6">
              <Button
                onClick={handleGenerateExamples}
                disabled={isGeneratingExamples || isCheckingCredits}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 relative overflow-hidden"
              >
                {isCheckingCredits ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin relative z-10" />
                    <span className="relative z-10">Checking Credits...</span>
                  </>
                ) : isGeneratingExamples ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-pulse"></div>
                    <div className="relative z-10 flex items-center">
                      <div className="w-4 h-4 mr-2 relative">
                        <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                        <div className="absolute inset-1 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      </div>
                      <span>Generating Example Images...</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate All Example Images
                  </>
                )}
              </Button>

              {/* Enhanced Status Display */}
              {isGeneratingExamples && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Wand2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                          AI Generation in Progress
                        </h4>
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          Creating professional example images...
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        3
                      </div>
                      <div className="text-xs text-purple-500 dark:text-purple-400">
                        Images
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-purple-200/50 dark:bg-purple-800/30 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                  </div>

                  <div className="mt-3 text-xs text-purple-600 dark:text-purple-400 text-center">
                    This may take a few moments. Please don't close this window.
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                Generate three example images based on your influencer's
                appearance settings
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-3">
                  <h4 className="font-medium text-center">
                    Example Picture {index + 1}
                  </h4>

                  {/* Image Preview */}
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden relative">
                    {(influencerData as any)[`example_pic${index + 1}`] ? (
                      <img
                        src={(influencerData as any)[`example_pic${index + 1}`]}
                        alt={`Example ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Image className="w-12 h-12" />
                      </div>
                    )}

                    {/* Loading overlay for individual image generation */}
                    {isGeneratingIndividual[index + 1] && (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center text-white p-4">
                          <div className="relative w-16 h-16 mx-auto mb-3">
                            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                            <div className="absolute inset-2 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
                            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                              <Sparkles className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="text-sm font-semibold mb-1">
                            AI Generating
                          </div>
                          <div className="text-xs opacity-90">
                            Example {index + 1}
                          </div>
                          <div className="mt-2 w-16 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
                            <div className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Loading overlay for all images generation */}
                    {isGeneratingExamples && (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center text-white p-4">
                          <div className="relative w-16 h-16 mx-auto mb-3">
                            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                            <div className="absolute inset-2 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
                            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                              <Wand2 className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="text-sm font-semibold mb-1">
                            AI Generating
                          </div>
                          <div className="text-xs opacity-90">All Examples</div>
                          <div className="mt-2 w-16 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
                            <div className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => triggerFileUpload(index)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setShowVaultSelector(true);
                      }}
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      Browse Library
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full relative overflow-hidden transition-all duration-300 ${
                        isGeneratingIndividual[index + 1]
                          ? "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-300 text-purple-700 dark:from-purple-950/20 dark:to-blue-950/20 dark:border-purple-600 dark:text-purple-300"
                          : ""
                      }`}
                      onClick={() => handleGenerateIndividualExample(index + 1)}
                      disabled={
                        isGeneratingIndividual[index + 1] ||
                        isCheckingIndividualCredits[index + 1]
                      }
                    >
                      {isCheckingIndividualCredits[index + 1] ? (
                        <>
                          {isGeneratingIndividual[index + 1] && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse"></div>
                          )}
                          <div className="relative z-10 flex items-center">
                            <div className="w-4 h-4 mr-2 relative">
                              <div className="absolute inset-0 rounded-full border-2 border-purple-300/30"></div>
                              <div className="absolute inset-0.5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                            </div>
                            <span>Checking...</span>
                          </div>
                        </>
                      ) : isGeneratingIndividual[index + 1] ? (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse"></div>
                          <div className="relative z-10 flex items-center">
                            <div className="w-4 h-4 mr-2 relative">
                              <div className="absolute inset-0 rounded-full border-2 border-purple-300/30"></div>
                              <div className="absolute inset-0.5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                            </div>
                            <span>Generating...</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>

                    {(influencerData as any)[`example_pic${index + 1}`] && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700"
                        onClick={() => {
                          handleInputChange(`example_pic${index + 1}`, "");
                          toast.success(`Example Picture ${index + 1} removed`);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowExamplePicturesModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await saveInfluencerData();
                  setShowExamplePicturesModal(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Hidden File Input for Example Pictures */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: "none" }}
      />

      {/* Vault Selector Modal for Example Pictures */}
      {showVaultSelector && (
        <VaultSelector
          open={showVaultSelector}
          onOpenChange={setShowVaultSelector}
          onImageSelect={handleVaultImageSelect}
          title="Select Image from Library"
          description="Browse your library and select an image for the example picture."
        />
      )}

      {/* Credit Warning Modal for Example Pictures Generation (All 3) */}
      {showCreditWarning && creditCostData && (
        <CreditConfirmationModal
          isOpen={showCreditWarning}
          onClose={() => setShowCreditWarning(false)}
          onConfirm={() => {
            setShowCreditWarning(false);
            generateExampleImages();
          }}
          gemCostData={{
            id: 1,
            item: "Example Images Generation",
            description: `Generate 3 example images for ${influencerData.name_first} ${influencerData.name_last}`,
            gems: creditCostData.gems,
            originalGemsPerImage: creditCostData.originalGemsPerImage,
          }}
          userCredits={userData.credits}
          userId={userData.id}
          numberOfItems={3}
          itemType="example image"
          title="Generate Example Images"
          confirmButtonText="Generate Images"
        />
      )}

      {/* Individual Credit Warning Modals for Single Example Pictures */}
      {[1, 2, 3].map(
        (imageIndex) =>
          showIndividualCreditWarning[imageIndex] &&
          individualCreditCostData[imageIndex] && (
            <CreditConfirmationModal
              key={imageIndex}
              isOpen={showIndividualCreditWarning[imageIndex]}
              onClose={() =>
                setShowIndividualCreditWarning((prev) => ({
                  ...prev,
                  [imageIndex]: false,
                }))
              }
              onConfirm={() => {
                setShowIndividualCreditWarning((prev) => ({
                  ...prev,
                  [imageIndex]: false,
                }));
                generateSingleExampleImage(imageIndex);
              }}
              gemCostData={{
                id: imageIndex,
                item: "Example Image Generation",
                description: `Generate example image ${imageIndex} for ${influencerData.name_first} ${influencerData.name_last}`,
                gems: individualCreditCostData[imageIndex].gems,
                originalGemsPerImage: individualCreditCostData[imageIndex].gems,
              }}
              userCredits={userData.credits}
              userId={userData.id}
              numberOfItems={1}
              itemType="example image"
              title={`Generate Example Image ${imageIndex}`}
              confirmButtonText="Generate Image"
            />
          )
      )}

      {/* Preview Generation Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showPreviewCreditWarning}
        onClose={() => setShowPreviewCreditWarning(false)}
        onConfirm={handlePreviewGenerationConfirmed}
        gemCostData={previewCreditCostData}
        userCredits={userData.credits}
        userId={userData.id}
        isProcessing={isGenerating}
        processingText="Generating Preview..."
        title="Generate Preview"
        confirmButtonText={
          previewCreditCostData
            ? `Confirm & Use ${previewCreditCostData.gems} Gems`
            : "Confirm"
        }
        numberOfItems={1}
        itemType="preview image"
      />

      {/* Preview Modal */}
      {showPreviewModal && (
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview Images</DialogTitle>
              <DialogDescription>
                Generated preview images for your influencer
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4">
              {previewImages.map((image, index) => (
                <Card key={index} className="p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {image.isLoading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      </div>
                    ) : image.imageUrl ? (
                      <img
                        src={image.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onClick={() => {
                          setGeneratedImageData({
                            image_id: image.taskId || "",
                            system_filename:
                              image.systemFilename ||
                              image.imageUrl.split("/").pop() ||
                              "",
                          });
                          setPreviewImage(image.imageUrl);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        Failed to generate
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Image Preview Dialog */}
      {/* {previewImage && (
        <DialogZoom open={true} onOpenChange={() => setPreviewImage(null)}>
          <DialogContentZoom className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
            <div className="relative h-full">
              <img
                src={previewImage}
                alt="Preview"
                className="h-full object-contain"
              />
              {generatedImageData && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/30 shadow-2xl">
                    <Button
                      onClick={handleUseAsProfilePicture}
                      className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 hover:scale-105"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                          <Image className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-base font-semibold">Use as Profile Picture</span>
                      </div>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContentZoom>
        </DialogZoom>
      )} */}

      {/* LoRA Prompt Dialog */}
      {showLoraPrompt && (
        <Dialog open={showLoraPrompt} onOpenChange={setShowLoraPrompt}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>AI Consistency Training</DialogTitle>
              <DialogDescription>
                Would you like to train AI consistency for this influencer?
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowLoraPrompt(false);
                  setShowTrainingModal(true);
                }}
                className="flex-1"
              >
                Yes, Train Now
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLoraPrompt(false)}
                className="flex-1"
              >
                Later
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* LoRA Training Modal */}
      {showTrainingModal && (
        <Dialog open={showTrainingModal} onOpenChange={setShowTrainingModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>AI Consistency Training</DialogTitle>
              <DialogDescription>
                Upload reference images to train AI consistency for better
                character recognition
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    const file = files[0];
                    if (file.size > 10 * 1024 * 1024) {
                      toast.error("File size must be less than 10MB");
                      return;
                    }
                    if (!file.type.startsWith("image/")) {
                      toast.error("Please select an image file");
                      return;
                    }
                    setUploadedFile(file);
                    setUploadedImageUrl(URL.createObjectURL(file));
                  }
                }}
              >
                {uploadedImageUrl ? (
                  <div className="space-y-4">
                    <img
                      src={uploadedImageUrl}
                      alt="Uploaded"
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <Button
                      onClick={() => {
                        URL.revokeObjectURL(uploadedImageUrl);
                        setUploadedFile(null);
                        setUploadedImageUrl(null);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Drag and drop an image here, or click to select
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum file size: 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error("File size must be less than 10MB");
                            return;
                          }
                          setUploadedFile(file);
                          setUploadedImageUrl(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Select Image
                    </label>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    if (uploadedFile) {
                      setIsCopyingImage(true);
                      try {
                        const loraFilePath = `models/${influencerData.id}/loratraining/${uploadedFile.name}`;
                        const uploadResponse = await fetch(
                          `${config.backend_url}/uploadfile?user=${userData.id}&filename=${loraFilePath}`,
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
                          throw new Error("Failed to upload image");
                        }

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

                        await fetch(
                          `${config.backend_url}/createtask?userid=${useridData[0].userid}&type=createlora`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: "Bearer WeInfl3nc3withAI",
                            },
                            body: JSON.stringify({
                              task: "createlora",
                              fromsingleimage: false,
                              modelid: influencerData.id,
                              inputimage: `/models/${influencerData.id}/loratraining/${uploadedFile.name}`,
                            }),
                          }
                        );

                        toast.success(
                          "AI consistency training started successfully"
                        );
                        setShowTrainingModal(false);
                        if (uploadedImageUrl) {
                          URL.revokeObjectURL(uploadedImageUrl);
                        }
                        setUploadedFile(null);
                        setUploadedImageUrl(null);
                        navigate("/influencers/profiles");
                      } catch (error) {
                        console.error("Error starting training:", error);
                        toast.error("Failed to start training");
                      } finally {
                        setIsCopyingImage(false);
                      }
                    } else {
                      toast.error("Please upload an image first");
                    }
                  }}
                  disabled={!uploadedFile || isCopyingImage}
                  className="flex-1"
                >
                  {isCopyingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Training...
                    </>
                  ) : (
                    "Start Training"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTrainingModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Wardrobe Modal */}
      {showWardrobeModal && (
        <Dialog open={showWardrobeModal} onOpenChange={setShowWardrobeModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Wardrobe & Style Settings
              </DialogTitle>
              <DialogDescription>
                Customize your influencer's clothing styles and color
                preferences
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Clothing Styles Grid */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Clothing Styles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Everyday Style */}
                  <div className="space-y-3">
                    <Label>Everyday Style</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.clothing_style_everyday}
                        onValueChange={(value) =>
                          handleInputChange("clothing_style_everyday", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select everyday style" />
                        </SelectTrigger>
                        <SelectContent>
                          {clothingEverydayOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          clothingEverydayOptions,
                          influencerData.clothing_style_everyday
                        )}
                        onSelect={() => setShowEverydayStyleSelector(true)}
                        onImageClick={() => setShowEverydayStyleSelector(true)}
                        onClear={() => clearField("clothing_style_everyday")}
                        placeholder="Select everyday style"
                      />
                    </div>
                  </div>

                  {/* Occasional Style */}
                  <div className="space-y-3">
                    <Label>Occasional Style</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.clothing_style_occasional}
                        onValueChange={(value) =>
                          handleInputChange("clothing_style_occasional", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select occasional style" />
                        </SelectTrigger>
                        <SelectContent>
                          {clothingOccasionalOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          clothingOccasionalOptions,
                          influencerData.clothing_style_occasional
                        )}
                        onSelect={() => setShowOccasionalStyleSelector(true)}
                        onImageClick={() =>
                          setShowOccasionalStyleSelector(true)
                        }
                        onClear={() => clearField("clothing_style_occasional")}
                        placeholder="Select occasional style"
                      />
                    </div>
                  </div>

                  {/* Home Style */}
                  <div className="space-y-3">
                    <Label>Home Style</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.clothing_style_home}
                        onValueChange={(value) =>
                          handleInputChange("clothing_style_home", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select home style" />
                        </SelectTrigger>
                        <SelectContent>
                          {clothingHomewearOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          clothingHomewearOptions,
                          influencerData.clothing_style_home
                        )}
                        onSelect={() => setShowHomeStyleSelector(true)}
                        onImageClick={() => setShowHomeStyleSelector(true)}
                        onClear={() => clearField("clothing_style_home")}
                        placeholder="Select home style"
                      />
                    </div>
                  </div>

                  {/* Sports Style */}
                  <div className="space-y-3">
                    <Label>Sports Style</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.clothing_style_sports}
                        onValueChange={(value) =>
                          handleInputChange("clothing_style_sports", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sports style" />
                        </SelectTrigger>
                        <SelectContent>
                          {clothingSportsOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          clothingSportsOptions,
                          influencerData.clothing_style_sports
                        )}
                        onSelect={() => setShowSportsStyleSelector(true)}
                        onImageClick={() => setShowSportsStyleSelector(true)}
                        onClear={() => clearField("clothing_style_sports")}
                        placeholder="Select sports style"
                      />
                    </div>
                  </div>

                  {/* Sexy Dresses Style */}
                  <div className="space-y-3">
                    <Label>Sexy Dresses Style</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.clothing_style_sexy_dress}
                        onValueChange={(value) =>
                          handleInputChange("clothing_style_sexy_dress", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sexy dress style" />
                        </SelectTrigger>
                        <SelectContent>
                          {clothingSexyOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          clothingSexyOptions,
                          influencerData.clothing_style_sexy_dress
                        )}
                        onSelect={() => setShowSexyStyleSelector(true)}
                        onImageClick={() => setShowSexyStyleSelector(true)}
                        onClear={() => clearField("clothing_style_sexy_dress")}
                        placeholder="Select sexy dress style"
                      />
                    </div>
                  </div>

                  {/* Home Environment */}
                  <div className="space-y-3">
                    <Label>Home Environment</Label>
                    <div className="space-y-2">
                      <Select
                        value={influencerData.home_environment}
                        onValueChange={(value) =>
                          handleInputChange("home_environment", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select home environment" />
                        </SelectTrigger>
                        <SelectContent>
                          {homeEnvironmentOptions.map((option, index) => (
                            <SelectItem key={index} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <OptionCard
                        option={getOptionByLabel(
                          homeEnvironmentOptions,
                          influencerData.home_environment
                        )}
                        onSelect={() => setShowHomeEnvironmentSelector(true)}
                        onImageClick={() =>
                          setShowHomeEnvironmentSelector(true)
                        }
                        onClear={() => clearField("home_environment")}
                        placeholder="Select home environment"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Color Palette Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Color Palette
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    Max 3 colors
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {influencerData.color_palette.map((palette, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        {palette}
                        <button
                          onClick={() =>
                            handleRemoveTag("color_palette", palette)
                          }
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {colorPaletteOptions.map((option, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer hover:shadow-lg transition-all duration-300 ${
                          influencerData.color_palette.includes(option.label)
                            ? "ring-2 ring-purple-500"
                            : "opacity-50 hover:opacity-100"
                        }`}
                        onClick={() => {
                          if (
                            influencerData.color_palette.includes(option.label)
                          ) {
                            handleRemoveTag("color_palette", option.label);
                          } else {
                            if (influencerData.color_palette.length < 3) {
                              handleAddTag("color_palette", option.label);
                            } else {
                              toast.error("Maximum Selection Reached", {
                                description:
                                  "You can only select up to 3 color palettes",
                                duration: 3000,
                              });
                            }
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div
                            className="relative w-full group"
                            style={{ paddingBottom: "100%" }}
                          >
                            <img
                              src={`${config.data_url}/wizard/mappings400/${option.image}`}
                              alt={option.label}
                              className="absolute inset-0 w-full h-full object-cover rounded-md"
                            />
                            <div className="absolute right-2 top-2 bg-black/50 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <p className="text-sm text-center font-medium mt-2">
                            {option.label}
                          </p>
                          {option.description && (
                            <p className="text-xs text-center text-muted-foreground mt-1 line-clamp-2">
                              {option.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowWardrobeModal(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowWardrobeModal(false);
                  toast.success("Wardrobe settings updated successfully!");
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Image Preview Dialog for Color Palette - Disabled per user request */}
      {/* {previewImage && (
        <DialogZoom open={true} onOpenChange={() => setPreviewImage(null)}>
          <DialogContentZoom className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
            <div className="relative h-full">
              <img
                src={previewImage}
                alt="Preview"
                className="h-full object-contain"
              />
            </div>
          </DialogContentZoom>
        </DialogZoom>
      )} */}

      {/* Wardrobe Style Selectors */}
      {showEverydayStyleSelector && (
        <OptionSelector
          options={clothingEverydayOptions}
          onSelect={(label) =>
            handleInputChange("clothing_style_everyday", label)
          }
          onClose={() => setShowEverydayStyleSelector(false)}
          title="Select Everyday Style"
        />
      )}

      {showOccasionalStyleSelector && (
        <OptionSelector
          options={clothingOccasionalOptions}
          onSelect={(label) =>
            handleInputChange("clothing_style_occasional", label)
          }
          onClose={() => setShowOccasionalStyleSelector(false)}
          title="Select Occasional Style"
        />
      )}

      {showHomeStyleSelector && (
        <OptionSelector
          options={clothingHomewearOptions}
          onSelect={(label) => handleInputChange("clothing_style_home", label)}
          onClose={() => setShowHomeStyleSelector(false)}
          title="Select Home Style"
        />
      )}

      {showSportsStyleSelector && (
        <OptionSelector
          options={clothingSportsOptions}
          onSelect={(label) =>
            handleInputChange("clothing_style_sports", label)
          }
          onClose={() => setShowSportsStyleSelector(false)}
          title="Select Sports Style"
        />
      )}

      {showSexyStyleSelector && (
        <OptionSelector
          options={clothingSexyOptions}
          onSelect={(label) =>
            handleInputChange("clothing_style_sexy_dress", label)
          }
          onClose={() => setShowSexyStyleSelector(false)}
          title="Select Sexy Dress Style"
        />
      )}

      {showHomeEnvironmentSelector && (
        <OptionSelector
          options={homeEnvironmentOptions}
          onSelect={(label) => handleInputChange("home_environment", label)}
          onClose={() => setShowHomeEnvironmentSelector(false)}
          title="Select Home Environment"
        />
      )}
    </div>
  );
}
