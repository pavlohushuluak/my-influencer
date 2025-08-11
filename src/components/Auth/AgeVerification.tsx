import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Clock,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgeVerificationProps {
  onVerificationComplete: (verificationData: AgeVerificationData) => void;
  onCancel?: () => void;
}

export interface AgeVerificationData {
  dateOfBirth: string;
  ageConfirmed: boolean;
  adultContentAcknowledged: boolean;
  isVerified: boolean;
}

export function AgeVerification({ onVerificationComplete, onCancel }: AgeVerificationProps) {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [adultContentAcknowledged, setAdultContentAcknowledged] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate minimum date (18 years ago from today)
  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return minDate.toISOString().split('T')[0];
  };

  // Calculate age from date of birth
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = calculateAge(dateOfBirth);
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old to use this platform';
      }
    }

    if (!ageConfirmed) {
      newErrors.ageConfirmed = 'You must confirm your age to continue';
    }

    if (!adultContentAcknowledged) {
      newErrors.adultContentAcknowledged = 'You must acknowledge the adult content policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const verificationData: AgeVerificationData = {
        dateOfBirth,
        ageConfirmed,
        adultContentAcknowledged,
        isVerified: true
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onVerificationComplete(verificationData);
    } catch (error) {
      console.error('Age verification error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear errors when user starts typing
  useEffect(() => {
    if (dateOfBirth && errors.dateOfBirth) {
      setErrors(prev => ({ ...prev, dateOfBirth: '' }));
    }
  }, [dateOfBirth, errors.dateOfBirth]);

  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const isAgeValid = age !== null && age >= 18;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 border-orange-200/50 bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:border-orange-200/20 dark:from-orange-950/20 dark:to-red-950/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Age Verification Required
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            You must be at least 18 years old to use Nymia.ai
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-orange-200/50 bg-orange-50/50 dark:border-orange-200/20 dark:bg-orange-950/20">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <strong>Important:</strong> This platform may contain adult content and requires age verification for legal compliance.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date of Birth Input */}
            <div className="space-y-3">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Date of Birth
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={getMinDate()}
                  className={cn(
                    "pl-10 border-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400",
                    errors.dateOfBirth && "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400",
                    isAgeValid && "border-green-500 dark:border-green-400 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500 dark:focus:ring-green-400"
                  )}
                  required
                />
              </div>

              {/* Age Display */}
              {dateOfBirth && (
                <div className={cn(
                  "flex items-center gap-2 text-sm p-2 rounded-md",
                  isAgeValid
                    ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                )}>
                  {isAgeValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <span>
                    Age: {age} years old
                    {!isAgeValid && " - Must be 18 or older"}
                  </span>
                </div>
              )}

              {errors.dateOfBirth && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            <Separator />

            {/* Age Confirmation Checkbox */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="ageConfirm"
                  checked={ageConfirmed}
                  onCheckedChange={(checked) => setAgeConfirmed(checked as boolean)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="ageConfirm"
                  className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer"
                >
                  I confirm that I am at least 18 years of age and legally able to enter into this agreement.
                </Label>
              </div>

              {errors.ageConfirmed && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.ageConfirmed}
                </p>
              )}
            </div>

            {/* Adult Content Acknowledgment */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="adultContent"
                  checked={adultContentAcknowledged}
                  onCheckedChange={(checked) => setAdultContentAcknowledged(checked as boolean)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="adultContent"
                  className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer"
                >
                  I understand that this platform may contain adult content and I consent to viewing such material.
                </Label>
              </div>

              {errors.adultContentAcknowledged && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.adultContentAcknowledged}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 dark:from-orange-600 dark:to-red-600 dark:hover:from-orange-700 dark:hover:to-red-700 text-white"
                disabled={isSubmitting || !isAgeValid || !ageConfirmed || !adultContentAcknowledged}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Verify Age
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 