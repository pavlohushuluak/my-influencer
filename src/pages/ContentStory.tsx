import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Construction, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ContentStory() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative p-6 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Story Creator
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Create and manage engaging social media stories with AI assistance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-6">
        <Card className="w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            {/* Beta Test Icon */}
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Construction className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Beta Test Message */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  In Beta Test
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  We're currently testing the Story Creator. This feature will be available soon with powerful tools to create engaging social media stories and boost your content creation workflow.
                </p>
              </div>

              {/* Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Story Templates
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Pre-designed templates for different platforms
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    AI Story Generation
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Generate compelling stories with AI
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Multi-Platform Support
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Create stories for Instagram, TikTok, and more
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Analytics & Insights
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Track story performance and engagement
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
