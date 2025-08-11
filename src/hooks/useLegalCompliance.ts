import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface LegalComplianceState {
  ageVerified: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  communityGuidelinesAccepted: boolean;
  complaintPolicyAccepted: boolean;
  dmcaPolicyAccepted: boolean;
  refundPolicyAccepted: boolean;
  cookiePolicyAccepted: boolean;
  isFullyCompliant: boolean;
  verificationDate: string | null;
  lastChecked: string | null;
}

const STORAGE_KEY = 'nymia_legal_compliance';

export function useLegalCompliance() {
  const [complianceState, setComplianceState] = useState<LegalComplianceState>({
    ageVerified: false,
    termsAccepted: false,
    privacyAccepted: false,
    communityGuidelinesAccepted: false,
    complaintPolicyAccepted: false,
    dmcaPolicyAccepted: false,
    refundPolicyAccepted: false,
    cookiePolicyAccepted: false,
    isFullyCompliant: false,
    verificationDate: null,
    lastChecked: null
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load compliance state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setComplianceState(parsed);
      }
    } catch (error) {
      console.error('Error loading legal compliance state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save compliance state to localStorage
  const saveComplianceState = (state: LegalComplianceState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setComplianceState(state);
    } catch (error) {
      console.error('Error saving legal compliance state:', error);
      toast.error('Failed to save legal compliance status');
    }
  };

  // Update compliance state
  const updateCompliance = (updates: Partial<LegalComplianceState>) => {
    const newState = {
      ...complianceState,
      ...updates,
      lastChecked: new Date().toISOString()
    };

    // Check if fully compliant
    const isFullyCompliant = 
      newState.ageVerified &&
      newState.termsAccepted &&
      newState.privacyAccepted &&
      newState.communityGuidelinesAccepted &&
      newState.complaintPolicyAccepted &&
      newState.dmcaPolicyAccepted &&
      newState.refundPolicyAccepted &&
      newState.cookiePolicyAccepted;

    newState.isFullyCompliant = isFullyCompliant;

    if (isFullyCompliant && !complianceState.isFullyCompliant) {
      newState.verificationDate = new Date().toISOString();
      toast.success('Legal compliance verification completed!');
    }

    saveComplianceState(newState);
  };

  // Reset compliance state
  const resetCompliance = () => {
    const resetState: LegalComplianceState = {
      ageVerified: false,
      termsAccepted: false,
      privacyAccepted: false,
      communityGuidelinesAccepted: false,
      complaintPolicyAccepted: false,
      dmcaPolicyAccepted: false,
      refundPolicyAccepted: false,
      cookiePolicyAccepted: false,
      isFullyCompliant: false,
      verificationDate: null,
      lastChecked: new Date().toISOString()
    };
    saveComplianceState(resetState);
    toast.info('Legal compliance status has been reset');
  };

  // Check if compliance is expired (e.g., for age verification)
  const isComplianceExpired = () => {
    if (!complianceState.verificationDate) return true;
    
    const verificationDate = new Date(complianceState.verificationDate);
    const now = new Date();
    const daysSinceVerification = (now.getTime() - verificationDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Consider compliance expired after 1 year
    return daysSinceVerification > 365;
  };

  // Get compliance status summary
  const getComplianceSummary = () => {
    const totalRequirements = 8; // age + 7 documents
    const completedRequirements = [
      complianceState.ageVerified,
      complianceState.termsAccepted,
      complianceState.privacyAccepted,
      complianceState.communityGuidelinesAccepted,
      complianceState.complaintPolicyAccepted,
      complianceState.dmcaPolicyAccepted,
      complianceState.refundPolicyAccepted,
      complianceState.cookiePolicyAccepted
    ].filter(Boolean).length;

    return {
      total: totalRequirements,
      completed: completedRequirements,
      percentage: Math.round((completedRequirements / totalRequirements) * 100),
      isComplete: complianceState.isFullyCompliant && !isComplianceExpired()
    };
  };

  // Validate compliance for specific actions
  const validateComplianceForAction = (action: string) => {
    if (!complianceState.isFullyCompliant) {
      toast.error(`Legal compliance required for ${action}`);
      return false;
    }

    if (isComplianceExpired()) {
      toast.error('Legal compliance has expired. Please re-verify your age and accept updated documents.');
      return false;
    }

    return true;
  };

  return {
    complianceState,
    isLoading,
    updateCompliance,
    resetCompliance,
    isComplianceExpired,
    getComplianceSummary,
    validateComplianceForAction
  };
} 