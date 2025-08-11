import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FolderOpen, Clock, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface LibraryRetentionNoticeProps {
  libraryType: 'images' | 'videos' | 'audios';
}

export function LibraryRetentionNotice({ libraryType }: LibraryRetentionNoticeProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const getLibraryInfo = () => {
    switch (libraryType) {
      case 'images':
        return {
          title: 'Image Retention Policy',
          description: 'Images in the main images folder will be automatically deleted after 30 days. Move them to sub-folders to keep them permanently.',
          icon: '🖼️'
        };
      case 'videos':
        return {
          title: 'Video Retention Policy',
          description: 'Videos in the main videos folder will be automatically deleted after 30 days. Move them to sub-folders to keep them permanently.',
          icon: '🎥'
        };
      case 'audios':
        return {
          title: 'Audio Retention Policy',
          description: 'Audio files in the main audios folder will be automatically deleted after 30 days. Move them to sub-folders to keep them permanently.',
          icon: '🎵'
        };
      default:
        return {
          title: 'File Retention Policy',
          description: 'Files in the main folder will be automatically deleted after 30 days. Move them to sub-folders to keep them permanently.',
          icon: '📁'
        };
    }
  };

  const info = getLibraryInfo();

  return (
    <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800/50 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{info.icon}</span>
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">
              {info.title}
            </h3>
          </div>
          <AlertDescription className="text-amber-700 dark:text-amber-300 mb-3">
            {info.description}
          </AlertDescription>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
              onClick={() => setIsDismissed(true)}
            >
              Dismiss
            </Button>
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              <span>Important: Files in main folder auto-delete after 30 days</span>
            </div>
          </div>
        </div>
      </div>
    </Alert>
  );
} 