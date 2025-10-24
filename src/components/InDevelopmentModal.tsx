import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Construction, Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InDevelopmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  features?: Array<{
    title: string;
    description: string;
    color: string;
  }>;
}

export default function InDevelopmentModal({
  isOpen,
  onClose,
  title,
  description,
  features = [
    {
      title: "Content Management",
      description: "Schedule and organize your social posts",
      color: "from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800"
    },
    {
      title: "Analytics Dashboard",
      description: "Track performance and engagement metrics",
      color: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
    },
    {
      title: "AI Content Creation",
      description: "Generate engaging content with AI assistance",
      color: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800"
    },
    {
      title: "Audience Insights",
      description: "Understand your audience better",
      color: "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800"
    }
  ]
}: InDevelopmentModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="relative p-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                  <Construction className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
                  In Development
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center space-y-6">
              {/* Main Illustration */}
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800/30 dark:to-pink-800/30 rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative bg-white dark:bg-gray-800 rounded-full w-full h-full flex items-center justify-center shadow-2xl border-8 border-white dark:border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg bg-gradient-to-br ${feature.color} border`}
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/social/bio")}
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-3"
                >
                  Explore Social Tools
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
