import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useLegalCompliance } from "@/hooks/useLegalCompliance";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Shield,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { LegalComplianceManager } from "./LegalComplianceManager";

interface LegalComplianceStatusProps {
  variant?: "compact" | "detailed" | "full";
  showActions?: boolean;
  className?: string;
}

export function LegalComplianceStatus({
  variant = "compact",
  showActions = true,
  className,
}: LegalComplianceStatusProps) {
  const {
    complianceState,
    isLoading,
    getComplianceSummary,
    isComplianceExpired,
    updateCompliance,
  } = useLegalCompliance();

  const [showComplianceManager, setShowComplianceManager] = useState(false);
  const summary = getComplianceSummary();

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  const handleComplianceComplete = (data: any) => {
    updateCompliance({
      ageVerified: data.ageVerified,
      termsAccepted: data.termsAccepted,
      privacyAccepted: data.privacyAccepted,
      communityGuidelinesAccepted: data.communityGuidelinesAccepted,
      complaintPolicyAccepted: data.complaintPolicyAccepted,
      dmcaPolicyAccepted: data.dmcaPolicyAccepted,
      refundPolicyAccepted: data.refundPolicyAccepted,
      cookiePolicyAccepted: data.cookiePolicyAccepted,
    });
    setShowComplianceManager(false);
  };

  const getStatusColor = () => {
    if (summary.isComplete) return "text-green-600";
    if (summary.percentage >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getStatusIcon = () => {
    if (summary.isComplete) return <CheckCircle className="h-4 w-4" />;
    if (isComplianceExpired()) return <Clock className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (summary.isComplete) return "Compliant";
    if (isComplianceExpired()) return "Expired";
    return "Incomplete";
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-1">
          <Shield className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Legal:</span>
        </div>
        <Badge
          variant={summary.isComplete ? "default" : "secondary"}
          className={cn(
            "text-xs",
            summary.isComplete
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          )}
        >
          {getStatusText()}
        </Badge>
        {showActions && !summary.isComplete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComplianceManager(true)}
            className="h-6 px-2 text-xs text-orange-600 hover:text-orange-700"
          >
            Complete
          </Button>
        )}
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <Card
        className={cn("border-2", className, {
          "border-green-200 bg-green-50": summary.isComplete,
          "border-orange-200 bg-orange-50":
            !summary.isComplete && summary.percentage >= 50,
          "border-red-200 bg-red-50":
            !summary.isComplete && summary.percentage < 50,
        })}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-base">Legal Compliance</CardTitle>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                summary.isComplete
                  ? "border-green-300 text-green-700"
                  : "border-orange-300 text-orange-700"
              )}
            >
              {summary.completed}/{summary.total}
            </Badge>
          </div>
          <CardDescription className="text-sm">
            {summary.isComplete
              ? "All legal requirements have been met"
              : `${summary.completed} of ${summary.total} requirements completed`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{summary.percentage}%</span>
            </div>
            <Progress value={summary.percentage} className="h-2" />
          </div>

          {complianceState.verificationDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                Verified:{" "}
                {new Date(
                  complianceState.verificationDate
                ).toLocaleDateString()}
              </span>
            </div>
          )}

          {showActions && (
            <div className="flex gap-2 pt-2">
              {!summary.isComplete ? (
                <Button
                  size="sm"
                  onClick={() => setShowComplianceManager(true)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <UserCheck className="mr-2 h-3 w-3" />
                  Complete Requirements
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComplianceManager(true)}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Review & Update
                </Button>
              )}
            </div>
          )}
        </CardContent>

        <LegalComplianceManager
          open={showComplianceManager}
          onOpenChange={setShowComplianceManager}
          onComplete={handleComplianceComplete}
        />
      </Card>
    );
  }

  // Full variant
  return (
    <Card
      className={cn("border-2", className, {
        "border-green-200 bg-green-50": summary.isComplete,
        "border-orange-200 bg-orange-50":
          !summary.isComplete && summary.percentage >= 50,
        "border-red-200 bg-red-50":
          !summary.isComplete && summary.percentage < 50,
      })}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                summary.isComplete ? "bg-green-100" : "bg-orange-100"
              )}
            >
              <Shield
                className={cn(
                  "h-5 w-5",
                  summary.isComplete ? "text-green-600" : "text-orange-600"
                )}
              />
            </div>
            <div>
              <CardTitle className="text-lg">Legal Compliance Status</CardTitle>
              <CardDescription>
                {summary.isComplete
                  ? "Your account meets all legal requirements"
                  : "Complete legal requirements to access all features"}
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <Badge
              variant="outline"
              className={cn(
                "text-sm",
                summary.isComplete
                  ? "border-green-300 text-green-700"
                  : "border-orange-300 text-orange-700"
              )}
            >
              {getStatusText()}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">
              {summary.completed}/{summary.total} Complete
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{summary.percentage}%</span>
          </div>
          <Progress value={summary.percentage} className="h-3" />
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Requirements</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {complianceState.ageVerified ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    complianceState.ageVerified
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  Age Verification
                </span>
              </div>
              <div className="flex items-center gap-2">
                {complianceState.termsAccepted ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    complianceState.termsAccepted
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  Terms of Service
                </span>
              </div>
              <div className="flex items-center gap-2">
                {complianceState.privacyAccepted ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    complianceState.privacyAccepted
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  Privacy Policy
                </span>
              </div>
              <div className="flex items-center gap-2">
                {complianceState.communityGuidelinesAccepted ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    complianceState.communityGuidelinesAccepted
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  Community Guidelines
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Additional Policies</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {complianceState.complaintPolicyAccepted ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    complianceState.complaintPolicyAccepted
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  Complaint Policy
                </span>
              </div>
              <div className="flex items-center gap-2">
                {complianceState.dmcaPolicyAccepted ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    complianceState.dmcaPolicyAccepted
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  DMCA Policy
                </span>
              </div>
              <div className="flex items-center gap-2">
                {complianceState.refundPolicyAccepted ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    complianceState.refundPolicyAccepted
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  Refund Policy
                </span>
              </div>
              <div className="flex items-center gap-2">
                {complianceState.cookiePolicyAccepted ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    complianceState.cookiePolicyAccepted
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  Cookie Policy
                </span>
              </div>
            </div>
          </div>
        </div>

        {complianceState.verificationDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Calendar className="h-3 w-3" />
            <span>
              Last verified:{" "}
              {new Date(complianceState.verificationDate).toLocaleDateString()}
            </span>
            {isComplianceExpired() && (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-3 pt-4">
            {!summary.isComplete ? (
              <Button
                onClick={() => setShowComplianceManager(true)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Complete Legal Requirements
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowComplianceManager(true)}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Review & Update
                </Button>
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Documents
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>

      <LegalComplianceManager
        open={showComplianceManager}
        onOpenChange={setShowComplianceManager}
        onComplete={handleComplianceComplete}
      />
    </Card>
  );
}
