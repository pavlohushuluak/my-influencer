import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LegalComplianceGuard, withLegalCompliance, useLegalComplianceGuard } from './LegalComplianceGuard';
import { LegalComplianceStatus } from './LegalComplianceStatus';
import { useLegalCompliance } from '@/hooks/useLegalCompliance';
import { 
  Shield, 
  UserCheck, 
  FileText, 
  Lock, 
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';

// Example protected component
function ContentCreationComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Creation
        </CardTitle>
        <CardDescription>
          Create and manage your AI-generated content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is a protected content creation component that requires legal compliance.</p>
        <Button className="mt-4">Create New Content</Button>
      </CardContent>
    </Card>
  );
}

// Example component using the hook
function ComplianceHookExample() {
  const { isCompliant, checkAccess, summary } = useLegalComplianceGuard("content creation");
  
  const handleAction = () => {
    if (!checkAccess()) {
      return; // Will show compliance modal
    }
    alert('Action allowed! You are legally compliant.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Manual Compliance Check
        </CardTitle>
        <CardDescription>
          Example of using the compliance hook in a component
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span>Compliance Status:</span>
          {isCompliant ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
          <span className={isCompliant ? "text-green-600" : "text-orange-600"}>
            {isCompliant ? "Compliant" : "Not Compliant"}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Progress: {summary.completed}/{summary.total} ({summary.percentage}%)
        </div>
        
        <Button onClick={handleAction} disabled={!isCompliant}>
          Perform Protected Action
        </Button>
      </CardContent>
    </Card>
  );
}

// Higher-order component example
const ProtectedInfluencerComponent = withLegalCompliance(
  () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Influencer Management
        </CardTitle>
        <CardDescription>
          Protected by higher-order component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>This component is protected using the higher-order component pattern.</p>
        <Button className="mt-4">Create Influencer</Button>
      </CardContent>
    </Card>
  ),
  { requiredAction: "influencer creation", strict: true }
);

// Main example component
export function LegalComplianceExample() {
  const { complianceState, getComplianceSummary, resetCompliance } = useLegalCompliance();
  const summary = getComplianceSummary();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-orange-600" />
          Legal Compliance Examples
        </h1>
        <p className="text-muted-foreground">
          Examples of how to implement legal compliance in your application
        </p>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Status Display</TabsTrigger>
          <TabsTrigger value="protection">Route Protection</TabsTrigger>
          <TabsTrigger value="hooks">Hook Usage</TabsTrigger>
          <TabsTrigger value="hoc">HOC Pattern</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="font-semibold mb-2">Compact Variant</h3>
              <LegalComplianceStatus variant="compact" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Detailed Variant</h3>
              <LegalComplianceStatus variant="detailed" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Full Variant</h3>
              <LegalComplianceStatus variant="full" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="protection" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Strict Protection</h3>
              <LegalComplianceGuard requiredAction="content creation" strict={true}>
                <ContentCreationComponent />
              </LegalComplianceGuard>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Non-Strict Protection</h3>
              <LegalComplianceGuard requiredAction="content creation" strict={false}>
                <ContentCreationComponent />
              </LegalComplianceGuard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hooks" className="space-y-4">
          <ComplianceHookExample />
        </TabsContent>

        <TabsContent value="hoc" className="space-y-4">
          <ProtectedInfluencerComponent />
        </TabsContent>
      </Tabs>

      {/* Debug Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Debug Information
          </CardTitle>
          <CardDescription>
            Current compliance state and debugging tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Compliance Summary</h4>
              <div className="space-y-1 text-sm">
                <div>Status: {summary.isComplete ? "Complete" : "Incomplete"}</div>
                <div>Progress: {summary.completed}/{summary.total} ({summary.percentage}%)</div>
                <div>Age Verified: {complianceState.ageVerified ? "Yes" : "No"}</div>
                <div>Terms Accepted: {complianceState.termsAccepted ? "Yes" : "No"}</div>
                <div>Privacy Accepted: {complianceState.privacyAccepted ? "Yes" : "No"}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Actions</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetCompliance}
                  className="w-full"
                >
                  Reset Compliance State
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    console.log('Compliance State:', complianceState);
                    console.log('Summary:', summary);
                  }}
                  className="w-full"
                >
                  Log to Console
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 