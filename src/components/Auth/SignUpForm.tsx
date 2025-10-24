import {
  LegalComplianceData,
  LegalComplianceManager,
} from "@/components/Legal/LegalComplianceManager";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { TermsOfService } from "@/components/TermsOfService";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import config from "@/config/config";
import { cn } from "@/lib/utils";
import {
  getStrengthColor,
  getStrengthProgress,
  validatePassword,
} from "@/utils/passwordValidation";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SignUpFormProps {
  onToggleMode: () => void;
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const [showLegalCompliance, setShowLegalCompliance] = useState(false);
  const [legalComplianceData, setLegalComplianceData] =
    useState<LegalComplianceData | null>(null);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const passwordValidation = validatePassword(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword;
  const showPasswordErrors = touched.password && formData.password.length > 0;
  const showConfirmPasswordError =
    touched.confirmPassword &&
    formData.confirmPassword.length > 0 &&
    !passwordsMatch;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation.isValid) {
      setTouched({ password: true, confirmPassword: true });
      return;
    }

    if (!passwordsMatch) {
      setTouched((prev) => ({ ...prev, confirmPassword: true }));
      return;
    }

    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    if (!legalComplianceData?.isFullyCompliant) {
      setShowLegalCompliance(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${config.backend_url}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            nickname: formData.nickname,
          },
        }),
      });

      const data = await response.json();
      console.log("Registration response:", data);

      await fetch(`${config.backend_url}/createfolder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: data.body.user.id,
          folder: "input",
        }),
      });
      await fetch(`${config.backend_url}/createfolder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: data.body.user.id,
          folder: "models",
        }),
      });
      await fetch(`${config.backend_url}/createfolder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: data.body.user.id,
          folder: "presets",
        }),
      });
      await fetch(`${config.backend_url}/createfolder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: data.body.user.id,
          folder: "output",
        }),
      });
      await fetch(`${config.backend_url}/createfolder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: data.body.user.id,
          folder: "vault",
        }),
      });
      await fetch(`${config.backend_url}/createfolder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: data.body.user.id,
          folder: "vault/Inbox",
        }),
      });
      await fetch(`${config.backend_url}/createfolder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: data.body.user.id,
          folder: "vault/Trash",
        }),
      });
      await fetch(`${config.backend_url}/createfolder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer WeInfl3nc3withAI",
        },
        body: JSON.stringify({
          user: data.body.user.id,
          folder: "vault/Examples",
        }),
      });
      // console.log('Registration response:', data);

      if (response.ok) {
        // Save tokens to session storage
        sessionStorage.setItem("access_token", data.body.access_token);
        sessionStorage.setItem("refresh_token", data.body.refresh_token);

        await fetch(`${config.supabase_server_url}/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer WeInfl3nc3withAI",
          },
          body: JSON.stringify({
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            nickname: formData.nickname,
            uuid: data.body.user.id,
            credits: 10,
          }),
        });

        toast.success("Account created successfully");
        navigate("/start");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Google sign up");
  };

  const handleLegalComplianceComplete = (data: LegalComplianceData) => {
    setLegalComplianceData(data);
    setShowLegalCompliance(false);
    // Continue with registration after legal compliance
    handleSubmit(new Event("submit") as any);
  };

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTermsOfService(true);
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPrivacyPolicy(true);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
  };

  const handleConfirmPasswordBlur = () => {
    setTouched((prev) => ({ ...prev, confirmPassword: true }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-foreground">
              First Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                type="text"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => updateFormData("firstName", e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-foreground">
              Last Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="lastName"
                type="text"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => updateFormData("lastName", e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nickname" className="text-foreground">
            Nickname
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="nickname"
              type="text"
              placeholder="Enter nickname"
              value={formData.nickname}
              onChange={(e) => updateFormData("nickname", e.target.value)}
              className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => updateFormData("password", e.target.value)}
              onBlur={handlePasswordBlur}
              className={cn(
                "pl-10 pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground",
                showPasswordErrors &&
                  !passwordValidation.isValid &&
                  "border-red-500 dark:border-red-400"
              )}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Password strength:
                </span>
                <span
                  className={cn(
                    "text-xs font-medium capitalize",
                    getStrengthColor(passwordValidation.strength)
                  )}
                >
                  {passwordValidation.strength}
                </span>
              </div>
              <Progress
                value={getStrengthProgress(passwordValidation.strength)}
                className="h-2"
              />
            </div>
          )}

          {showPasswordErrors && passwordValidation.errors.length > 0 && (
            <div className="space-y-1">
              {passwordValidation.errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-xs text-red-500 dark:text-red-400"
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-foreground">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) =>
                updateFormData("confirmPassword", e.target.value)
              }
              onBlur={handleConfirmPasswordBlur}
              className={cn(
                "pl-10 pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground",
                showConfirmPasswordError &&
                  "border-red-500 dark:border-red-400",
                touched.confirmPassword &&
                  passwordsMatch &&
                  formData.confirmPassword.length > 0 &&
                  "border-green-500 dark:border-green-400"
              )}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Confirm Password Validation */}
          {touched.confirmPassword && formData.confirmPassword.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              {passwordsMatch ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400" />
                  <span className="text-green-500 dark:text-green-400">
                    Passwords match
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 text-red-500 dark:text-red-400" />
                  <span className="text-red-500 dark:text-red-400">
                    Passwords do not match
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm text-foreground">
              I agree to the{" "}
              <button
                type="button"
                onClick={handleTermsClick}
                className="text-ai-purple-500 hover:text-ai-purple-600 underline"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={handlePrivacyClick}
                className="text-ai-purple-500 hover:text-ai-purple-600 underline"
              >
                Privacy Policy
              </button>
            </Label>
          </div>

          {/* Legal Compliance Status */}
          <div className="p-3 rounded-lg border border-orange-200/50 bg-orange-50/50 dark:border-orange-200/20 dark:bg-orange-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Legal Compliance
              </span>
            </div>
            {legalComplianceData?.isFullyCompliant ? (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span>All legal requirements completed</span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Age verification and legal document acceptance required
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLegalCompliance(true)}
                  className="text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                >
                  Complete Legal Requirements
                </Button>
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-ai-gradient hover:bg-ai-gradient-dark text-white"
          disabled={
            isLoading ||
            !passwordValidation.isValid ||
            !passwordsMatch ||
            !acceptTerms ||
            !legalComplianceData?.isFullyCompliant
          }
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border-border bg-background text-foreground hover:bg-muted"
        onClick={handleGoogleSignUp}
      >
        <FcGoogle className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Button
          variant="link"
          className="p-0 h-auto text-ai-purple-500 hover:text-ai-purple-600"
          onClick={onToggleMode}
        >
          Sign in
        </Button>
      </div>

      {/* Legal Compliance Manager */}
      <LegalComplianceManager
        open={showLegalCompliance}
        onOpenChange={setShowLegalCompliance}
        onComplete={handleLegalComplianceComplete}
        isRegistration={true}
      />

      {/* Terms of Service Modal */}
      <TermsOfService
        open={showTermsOfService}
        onOpenChange={setShowTermsOfService}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicy
        open={showPrivacyPolicy}
        onOpenChange={setShowPrivacyPolicy}
      />
    </div>
  );
}
