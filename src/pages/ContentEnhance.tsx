
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Wand2, Upload, Download, Sparkles, Palette, Zap, Eye } from 'lucide-react';

export default function ContentEnhance() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [enhanceType, setEnhanceType] = useState('upscale');
  const [isProcessing, setIsProcessing] = useState(false);
  const [brightness, setBrightness] = useState([0]);
  const [contrast, setContrast] = useState([0]);
  const [saturation, setSaturation] = useState([0]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleEnhance = () => {
    setIsProcessing(true);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-ai-gradient bg-clip-text text-transparent">
          Enhance Content
        </h1>
        <p className="text-muted-foreground">
          Improve your content with AI-powered enhancement tools
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Upload your content</p>
                <p className="text-muted-foreground">Drag & drop or click to browse</p>
              </label>
            </div>
            
            {selectedFile && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-ai-gradient rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Badge variant="secondary">Ready</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhancement Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Enhancement Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={enhanceType} onValueChange={setEnhanceType}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upscale">Upscale</TabsTrigger>
                <TabsTrigger value="colorize">Colorize</TabsTrigger>
                <TabsTrigger value="restore">Restore</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upscale" className="space-y-4">
                <div className="text-center p-6">
                  <Zap className="w-12 h-12 text-ai-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">AI Upscaling</h3>
                  <p className="text-sm text-muted-foreground">
                    Increase resolution up to 4x while preserving quality
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="colorize" className="space-y-4">
                <div className="text-center p-6">
                  <Palette className="w-12 h-12 text-ai-purple-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">AI Colorization</h3>
                  <p className="text-sm text-muted-foreground">
                    Add natural colors to black and white images
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="restore" className="space-y-4">
                <div className="text-center p-6">
                  <Eye className="w-12 h-12 text-ai-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Image Restoration</h3>
                  <p className="text-sm text-muted-foreground">
                    Remove noise, blur, and artifacts automatically
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Manual Adjustments */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Adjustments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Brightness: {brightness[0]}</Label>
            <Slider
              value={brightness}
              onValueChange={setBrightness}
              max={100}
              min={-100}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Contrast: {contrast[0]}</Label>
            <Slider
              value={contrast}
              onValueChange={setContrast}
              max={100}
              min={-100}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Saturation: {saturation[0]}</Label>
            <Slider
              value={saturation}
              onValueChange={setSaturation}
              max={100}
              min={-100}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={handleEnhance}
          disabled={!selectedFile || isProcessing}
          className="bg-ai-gradient hover:opacity-90"
        >
          {isProcessing ? (
            <>
              <Wand2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Enhance Content
            </>
          )}
        </Button>
        
        <Button variant="outline" disabled={!selectedFile}>
          <Download className="w-4 h-4 mr-2" />
          Download Original
        </Button>
      </div>
    </div>
  );
}
