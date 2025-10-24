import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLegalCompliance } from "@/hooks/useLegalCompliance";
import { AlertTriangle, ArrowRight, Lock, Shield } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { LegalComplianceManager } from "./LegalComplianceManager";
import { LegalComplianceStatus } from "./LegalComplianceStatus";

interface LegalComplianceGuardProps {
  children: React.ReactNode;
  requiredAction?: string;
  showComplianceManager?: boolean;
  fallback?: React.ReactNode;
  strict?: boolean; // If true, blocks access completely. If false, shows warning but allows access
}

export function LegalComplianceGuard({
  children,
  requiredAction = "this feature",
  showComplianceManager = true,
  fallback,
  strict = true,
}: LegalComplianceGuardProps) {
  const {
    complianceState,
    isLoading,
    getComplianceSummary,
    isComplianceExpired,
    validateComplianceForAction,
  } = useLegalCompliance();

  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  const summary = getComplianceSummary();
  const isCompliant = summary.isComplete && !isComplianceExpired();

  // Show warning toast on first render if not compliant
  useEffect(() => {
    if (!isLoading && !isCompliant && !hasShownWarning && !strict) {
      toast.warning(`Legal compliance required for ${requiredAction}`, {
        description: "Please complete legal requirements for full access",
        duration: 5000,
      });
      setHasShownWarning(true);
    }
  }, [isLoading, isCompliant, hasShownWarning, strict, requiredAction]);

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-muted-foreground">
          Checking legal compliance...
        </span>
      </div>
    );
  }

  // If compliant, render children
  if (isCompliant) {
    return <>{children}</>;
  }

  // If strict mode and not compliant, show blocking fallback
  if (strict) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-red-50">
        <Card className="w-full max-w-md border-2 border-orange-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Legal Compliance Required
            </CardTitle>
            <CardDescription className="text-gray-600">
              You must complete legal requirements to access {requiredAction}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Access Restricted:</strong> Your account does not meet
                the legal requirements for this feature.
              </AlertDescription>
            </Alert>

            <LegalComplianceStatus variant="detailed" showActions={false} />

            {showComplianceManager && (
              <div className="space-y-3">
                <Button
                  onClick={() => setShowComplianceModal(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Complete Legal Requirements
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => window.history.back()}
                  >
                    <ArrowRight className="mr-1 h-3 w-3 rotate-180" />
                    Go Back
                  </Button>
                </div>
              </div>
            )}

            <div className="text-xs text-center text-muted-foreground pt-4 border-t">
              <p>
                Need help? Contact our{" "}
                <a
                  href="#"
                  className="text-orange-600 hover:text-orange-700 underline"
                >
                  legal support team
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <LegalComplianceManager
          open={showComplianceModal}
          onOpenChange={setShowComplianceModal}
          onComplete={() => {
            setShowComplianceModal(false);
            toast.success(
              "Legal compliance completed! You can now access this feature."
            );
          }}
        />
      </div>
    );
  }

  // If not strict, show warning but allow access
  return (
    <>
      <div className="mb-4">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Legal Compliance Notice:</strong> Complete legal
                requirements for full access to {requiredAction}.
              </div>
              {showComplianceManager && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComplianceModal(true)}
                  className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Shield className="mr-1 h-3 w-3" />
                  Complete
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>

      {children}

      <LegalComplianceManager
        open={showComplianceModal}
        onOpenChange={setShowComplianceModal}
        onComplete={() => {
          setShowComplianceModal(false);
          toast.success("Legal compliance completed!");
        }}
      />
    </>
  );
}

// Higher-order component for protecting components
export function withLegalCompliance<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<LegalComplianceGuardProps, "children"> = {}
) {
  return function LegalComplianceWrappedComponent(props: P) {
    return (
      <LegalComplianceGuard {...options}>
        <Component {...props} />
      </LegalComplianceGuard>
    );
  };
}

// Hook for checking compliance in components
export function useLegalComplianceGuard(requiredAction?: string) {
  const {
    complianceState,
    getComplianceSummary,
    isComplianceExpired,
    validateComplianceForAction,
  } = useLegalCompliance();

  const summary = getComplianceSummary();
  const isCompliant = summary.isComplete && !isComplianceExpired();

  const checkAccess = (action?: string) => {
    return validateComplianceForAction(
      action || requiredAction || "this feature"
    );
  };

  return {
    isCompliant,
    complianceState,
    summary,
    isExpired: isComplianceExpired(),
    checkAccess,
  };
}
