import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Lock,
  UserCheck,
  ExternalLink,
  Download,
  Eye,
  Calendar,
  Users,
  CreditCard,
  Globe
} from 'lucide-react';
import { AgeVerification, AgeVerificationData } from '@/components/Auth/AgeVerification';
import { TermsOfService } from '@/components/TermsOfService';
import { PrivacyPolicy } from '@/components/PrivacyPolicy';
import { CommunityGuidelines } from '@/components/CommunityGuidelines';
import { ComplaintPolicy } from '@/components/ComplaintPolicy';
import { DMCAPolicy } from '@/components/DMCAPolicy';
import { RefundPolicy } from '@/components/RefundPolicy';
import { CookiePolicy } from '@/components/CookiePolicy';

interface LegalComplianceManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (complianceData: LegalComplianceData) => void;
  isRegistration?: boolean;
}

export interface LegalComplianceData {
  ageVerified: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  communityGuidelinesAccepted: boolean;
  complaintPolicyAccepted: boolean;
  dmcaPolicyAccepted: boolean;
  refundPolicyAccepted: boolean;
  cookiePolicyAccepted: boolean;
  isFullyCompliant: boolean;
  verificationDate: string;
}

interface LegalDocument {
  id: string;
  title: string;
  description: string;
  required: boolean;
  accepted: boolean;
  lastUpdated: string;
  version: string;
  icon: React.ReactNode;
}

export function LegalComplianceManager({ 
  open, 
  onOpenChange, 
  onComplete, 
  isRegistration = false 
}: LegalComplianceManagerProps) {
  const { theme } = useSelector((state: RootState) => state.ui);
  
  const [currentStep, setCurrentStep] = useState<'age' | 'documents' | 'complete'>('age');
  const [ageVerificationData, setAgeVerificationData] = useState<AgeVerificationData | null>(null);
  const [acceptedDocuments, setAcceptedDocuments] = useState<Set<string>>(new Set());
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const legalDocuments: LegalDocument[] = [
    {
      id: 'terms',
      title: 'Terms of Service',
      description: 'Our terms and conditions for using the platform',
      required: true,
      accepted: acceptedDocuments.has('terms'),
      lastUpdated: '2024-01-15',
      version: '2.1',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your data',
      required: true,
      accepted: acceptedDocuments.has('privacy'),
      lastUpdated: '2024-01-15',
      version: '2.1',
      icon: <Lock className="h-5 w-5" />
    },
    {
      id: 'community',
      title: 'Community Guidelines',
      description: 'Standards for acceptable behavior and content',
      required: true,
      accepted: acceptedDocuments.has('community'),
      lastUpdated: '2024-01-10',
      version: '1.5',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'complaint',
      title: 'Complaint Policy',
      description: 'How to report violations and our response process',
      required: true,
      accepted: acceptedDocuments.has('complaint'),
      lastUpdated: '2024-01-12',
      version: '1.2',
      icon: <AlertTriangle className="h-5 w-5" />
    },
    {
      id: 'dmca',
      title: 'DMCA Policy',
      description: 'Copyright infringement reporting and takedown procedures',
      required: true,
      accepted: acceptedDocuments.has('dmca'),
      lastUpdated: '2024-01-08',
      version: '1.3',
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: 'refund',
      title: 'Refund Policy',
      description: 'Our refund and cancellation terms',
      required: true,
      accepted: acceptedDocuments.has('refund'),
      lastUpdated: '2024-01-14',
      version: '1.4',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      id: 'cookies',
      title: 'Cookie Policy',
      description: 'How we use cookies and tracking technologies',
      required: true,
      accepted: acceptedDocuments.has('cookies'),
      lastUpdated: '2024-01-15',
      version: '1.1',
      icon: <Globe className="h-5 w-5" />
    }
  ];

  const requiredDocuments = legalDocuments.filter(doc => doc.required);
  const acceptedRequiredDocuments = requiredDocuments.filter(doc => acceptedDocuments.has(doc.id));
  const progressPercentage = ageVerificationData?.isVerified 
    ? ((acceptedRequiredDocuments.length + 1) / (requiredDocuments.length + 1)) * 100 
    : 0;

  const handleAgeVerificationComplete = (data: AgeVerificationData) => {
    setAgeVerificationData(data);
    setCurrentStep('documents');
  };

  const handleDocumentAccept = (documentId: string) => {
    setAcceptedDocuments(prev => new Set([...prev, documentId]));
  };

  const handleDocumentView = (documentId: string) => {
    setViewingDocument(documentId);
  };

  const handleComplete = async () => {
    if (!ageVerificationData?.isVerified || acceptedRequiredDocuments.length !== requiredDocuments.length) {
      return;
    }

    setIsProcessing(true);

    try {
      const complianceData: LegalComplianceData = {
        ageVerified: ageVerificationData.isVerified,
        termsAccepted: acceptedDocuments.has('terms'),
        privacyAccepted: acceptedDocuments.has('privacy'),
        communityGuidelinesAccepted: acceptedDocuments.has('community'),
        complaintPolicyAccepted: acceptedDocuments.has('complaint'),
        dmcaPolicyAccepted: acceptedDocuments.has('dmca'),
        refundPolicyAccepted: acceptedDocuments.has('refund'),
        cookiePolicyAccepted: acceptedDocuments.has('cookies'),
        isFullyCompliant: true,
        verificationDate: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onComplete(complianceData);
      setCurrentStep('complete');
    } catch (error) {
      console.error('Legal compliance error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderDocumentComponent = (documentId: string) => {
    switch (documentId) {
      case 'terms':
        return <TermsOfService open={true} onOpenChange={() => setViewingDocument(null)} />;
      case 'privacy':
        return <PrivacyPolicy open={true} onOpenChange={() => setViewingDocument(null)} />;
      case 'community':
        return <CommunityGuidelines open={true} onOpenChange={() => setViewingDocument(null)} />;
      case 'complaint':
        return <ComplaintPolicy open={true} onOpenChange={() => setViewingDocument(null)} />;
      case 'dmca':
        return <DMCAPolicy open={true} onOpenChange={() => setViewingDocument(null)} />;
      case 'refund':
        return <RefundPolicy open={true} onOpenChange={() => setViewingDocument(null)} />;
      case 'cookies':
        return <CookiePolicy open={true} onOpenChange={() => setViewingDocument(null)} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-orange-600" />
            Legal Compliance Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Compliance Progress</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              {acceptedRequiredDocuments.length + (ageVerificationData?.isVerified ? 1 : 0)} of {requiredDocuments.length + 1} requirements completed
            </div>
          </div>

          <Separator />

          {/* Step Content */}
          {currentStep === 'age' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Step 1: Age Verification</h3>
                <p className="text-muted-foreground">
                  You must verify that you are at least 18 years old to proceed
                </p>
              </div>
              <AgeVerification onVerificationComplete={handleAgeVerificationComplete} />
            </div>
          )}

          {currentStep === 'documents' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Step 2: Legal Documents</h3>
                <p className="text-muted-foreground">
                  Please review and accept the following legal documents
                </p>
              </div>

              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {requiredDocuments.map((document) => (
                  <Card key={document.id} className="border-2 hover:border-orange-200 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                            {document.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{document.title}</h4>
                              {document.accepted && (
                                <Badge variant="secondary" className="text-xs">
                                  Accepted
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {document.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Updated: {document.lastUpdated}</span>
                              <span>Version: {document.version}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDocumentView(document.id)}
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          
                          {!document.accepted ? (
                            <Button
                              size="sm"
                              onClick={() => handleDocumentAccept(document.id)}
                              className="text-xs bg-orange-500 hover:bg-orange-600"
                            >
                              Accept
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              className="text-xs text-green-600"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Accepted
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleComplete}
                  disabled={acceptedRequiredDocuments.length !== requiredDocuments.length || isProcessing}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Verification
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center space-y-4 py-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  Legal Compliance Complete!
                </h3>
                <p className="text-muted-foreground">
                  You have successfully completed all legal requirements and can now use the platform.
                </p>
              </div>
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-green-500 hover:bg-green-600"
              >
                Continue to Platform
              </Button>
            </div>
          )}
        </div>

        {/* Document Viewer Dialog */}
        {viewingDocument && (
          <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              {renderDocumentComponent(viewingDocument)}
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
} 