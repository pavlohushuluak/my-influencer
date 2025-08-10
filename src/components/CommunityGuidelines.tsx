import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  Mail, 
  Users, 
  Heart, 
  Gavel,
  Eye,
  Flag,
  Ban,
  CheckCircle,
  XCircle,
  Info,
  Settings,
  Globe,
  Lock,
  UserCheck,
  Zap,
  Target,
  Scale,
  MessageCircle,
  HelpCircle,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  Calendar
} from 'lucide-react';

interface CommunityGuidelinesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommunityGuidelines({ open, onOpenChange }: CommunityGuidelinesProps) {
  const { theme } = useSelector((state: RootState) => state.ui);

  const handlePrint = () => {
    const content = document.getElementById('community-guidelines-content');
    if (!content) return;

    const printContent = content.cloneNode(true) as HTMLElement;
    
    // Remove modal-specific elements
    const elementsToRemove = printContent.querySelectorAll('.modal-close, .print-button, [data-modal]');
    elementsToRemove.forEach(el => el.remove());
    
    // Remove SVG icons
    const svgElements = printContent.querySelectorAll('svg');
    svgElements.forEach(svg => svg.remove());
    
    // Remove circular badges
    const badges = printContent.querySelectorAll('[class*="rounded-full"]');
    badges.forEach(badge => badge.remove());
    
    // Remove any inline styles
    const styleElements = printContent.querySelectorAll('style');
    styleElements.forEach(style => style.remove());

    const originalBody = document.body.innerHTML;
    const originalTitle = document.title;

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Community Guidelines & Acceptable Use Policy - Nymia.ai</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
              font-size: 12px;
            }
            
            h1 {
              font-size: 24px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 20px;
              text-align: center;
              border-bottom: 3px solid #8b5cf6;
              padding-bottom: 10px;
            }
            
            h2 {
              font-size: 16px;
              font-weight: 600;
              color: #374151;
              margin: 20px 0 10px 0;
              page-break-after: avoid;
            }
            
            h3 {
              font-size: 14px;
              font-weight: 600;
              color: #4b5563;
              margin: 15px 0 8px 0;
            }
            
            h4 {
              font-size: 13px;
              font-weight: 500;
              color: #6b7280;
              margin: 10px 0 5px 0;
            }
            
            p {
              margin-bottom: 8px;
              text-align: justify;
            }
            
            ul {
              margin: 8px 0 8px 20px;
            }
            
            li {
              margin-bottom: 4px;
            }
            
            .document-header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              background: linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%);
              border-radius: 8px;
              border: 2px solid #8b5cf6;
            }
            
            .document-header::after {
              content: '';
              display: block;
              width: 60px;
              height: 4px;
              background: linear-gradient(90deg, #8b5cf6, #7c3aed);
              margin: 15px auto 0;
              border-radius: 2px;
            }
            
            .header-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-top: 15px;
            }
            
            .header-item {
              background: white;
              padding: 12px;
              border-radius: 6px;
              border-left: 4px solid #8b5cf6;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            
            .content-box {
              background: #faf5ff;
              border: 1px solid #e9d5ff;
              border-radius: 6px;
              padding: 15px;
              margin: 10px 0;
              position: relative;
            }
            
            .content-box::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, #8b5cf6, #7c3aed);
              border-radius: 6px 6px 0 0;
            }
            
            .notice-box {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 15px;
              margin: 10px 0;
            }
            
            .warning-box {
              background: #fee2e2;
              border: 1px solid #ef4444;
              border-radius: 6px;
              padding: 15px;
              margin: 10px 0;
            }
            
            .info-box {
              background: #dbeafe;
              border: 1px solid #3b82f6;
              border-radius: 6px;
              padding: 15px;
              margin: 10px 0;
            }
            
            .success-box {
              background: #dcfce7;
              border: 1px solid #22c55e;
              border-radius: 6px;
              padding: 15px;
              margin: 10px 0;
            }
            
            .highlight-text {
              background: linear-gradient(120deg, #c4b5fd 0%, #a78bfa 100%);
              background-clip: text;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              font-weight: 600;
            }
            
            .important-text {
              color: #dc2626;
              font-weight: 600;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
            }
            
            .footer-content {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .footer-section {
              background: #f9fafb;
              padding: 15px;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            
            .footer-section h4 {
              color: #374151;
              margin-bottom: 8px;
              border-bottom: 2px solid #8b5cf6;
              padding-bottom: 5px;
            }
            
            .copyright {
              font-size: 11px;
              color: #6b7280;
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px solid #e5e7eb;
            }
            
            @media print {
              body {
                font-size: 10px;
                line-height: 1.4;
                padding: 15px;
              }
              
              h1 { font-size: 20px; margin-bottom: 15px; }
              h2 { font-size: 14px; margin: 15px 0 8px 0; }
              h3 { font-size: 12px; margin: 12px 0 6px 0; }
              h4 { font-size: 11px; margin: 8px 0 4px 0; }
              p { margin-bottom: 6px; }
              li { margin-bottom: 3px; }
              
              .document-header { margin-bottom: 20px; padding: 15px; }
              .header-info { gap: 15px; margin-top: 10px; }
              .header-item { padding: 10px; }
              .section { margin-bottom: 20px; }
              .content-box, .notice-box, .warning-box, .info-box, .success-box { 
                padding: 12px; 
                margin: 8px 0; 
              }
              .footer { margin-top: 30px; padding-top: 15px; }
              .footer-content { gap: 15px; margin-bottom: 15px; }
              .footer-section { padding: 12px; }
              .copyright { font-size: 10px; margin-top: 12px; }
              
              * { page-break-before: auto !important; page-break-after: auto !important; page-break-inside: auto !important; }
              h1, h2 { page-break-after: auto !important; }
              .footer { page-break-before: auto !important; page-break-after: auto !important; margin-bottom: 0 !important; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `;

    document.body.innerHTML = printHTML;
    document.title = 'Community Guidelines & Acceptable Use Policy - Nymia.ai';

    window.print();

    setTimeout(() => {
      document.body.innerHTML = originalBody;
      document.title = originalTitle;
      window.location.reload();
    }, 100);
  };

  const handleDownload = () => {
    const content = document.getElementById('community-guidelines-content');
    if (!content) return;

    const printContent = content.cloneNode(true) as HTMLElement;
    
    // Remove modal-specific elements
    const elementsToRemove = printContent.querySelectorAll('.modal-close, .print-button, [data-modal]');
    elementsToRemove.forEach(el => el.remove());
    
    // Remove SVG icons
    const svgElements = printContent.querySelectorAll('svg');
    svgElements.forEach(svg => svg.remove());
    
    // Remove circular badges
    const badges = printContent.querySelectorAll('[class*="rounded-full"]');
    badges.forEach(badge => badge.remove());

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Community Guidelines & Acceptable Use Policy - Nymia.ai</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
              font-size: 12px;
            }
            
            h1 {
              font-size: 24px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 20px;
              text-align: center;
              border-bottom: 3px solid #8b5cf6;
              padding-bottom: 10px;
            }
            
            h2 {
              font-size: 16px;
              font-weight: 600;
              color: #374151;
              margin: 20px 0 10px 0;
            }
            
            h3 {
              font-size: 14px;
              font-weight: 600;
              color: #4b5563;
              margin: 15px 0 8px 0;
            }
            
            h4 {
              font-size: 13px;
              font-weight: 500;
              color: #6b7280;
              margin: 10px 0 5px 0;
            }
            
            p {
              margin-bottom: 8px;
              text-align: justify;
            }
            
            ul {
              margin: 8px 0 8px 20px;
            }
            
            li {
              margin-bottom: 4px;
            }
            
            .document-header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              background: linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%);
              border-radius: 8px;
              border: 2px solid #8b5cf6;
            }
            
            .document-header::after {
              content: '';
              display: block;
              width: 60px;
              height: 4px;
              background: linear-gradient(90deg, #8b5cf6, #7c3aed);
              margin: 15px auto 0;
              border-radius: 2px;
            }
            
            .header-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-top: 15px;
            }
            
            .header-item {
              background: white;
              padding: 12px;
              border-radius: 6px;
              border-left: 4px solid #8b5cf6;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .section {
              margin-bottom: 25px;
            }
            
            .content-box {
              background: #faf5ff;
              border: 1px solid #e9d5ff;
              border-radius: 6px;
              padding: 15px;
              margin: 10px 0;
              position: relative;
            }
            
            .content-box::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, #8b5cf6, #7c3aed);
              border-radius: 6px 6px 0 0;
            }
            
            .notice-box {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 15px;
              margin: 10px 0;
            }
            
            .warning-box {
              background: #fee2e2;
              border: 1px solid #ef4444;
              border-radius: 6px;
              padding: 15px;
              margin: 10px 0;
            }
            
            .info-box {
              background: #dbeafe;
              border: 1px solid #3b82f6;
              border-radius: 6px;
              padding: 15px;
              margin: 10px 0;
            }
            
            .success-box {
              background: #dcfce7;
              border: 1px solid #22c55e;
              border-radius: 6px;
              padding: 15px;
              margin: 10px 0;
            }
            
            .highlight-text {
              background: linear-gradient(120deg, #c4b5fd 0%, #a78bfa 100%);
              background-clip: text;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              font-weight: 600;
            }
            
            .important-text {
              color: #dc2626;
              font-weight: 600;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
            }
            
            .footer-content {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .footer-section {
              background: #f9fafb;
              padding: 15px;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            
            .footer-section h4 {
              color: #374151;
              margin-bottom: 8px;
              border-bottom: 2px solid #8b5cf6;
              padding-bottom: 5px;
            }
            
            .copyright {
              font-size: 11px;
              color: #6b7280;
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Community_Guidelines_Nymia.ai.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Community Guidelines & Acceptable Use Policy
                </DialogTitle>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Effective: January 1, 2025</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Current Version
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="hidden sm:flex"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="hidden sm:flex"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <div id="community-guidelines-content" className="p-6 space-y-8">
            {/* Introduction */}
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                    Important Notice
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    These Community Guidelines and Acceptable Use Policy establish the standards of conduct for all users of the Nymia.ai platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Introduction */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                Introduction
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  These Community Guidelines and Acceptable Use Policy ("Guidelines") establish the standards of conduct for all users of the Nymia.ai platform (the "Service"). Our mission is to provide a safe, creative, and respectful environment where users can create virtual influencers and digital characters using AI technology.
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Important Warning</h3>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      <strong>BY USING THE SERVICE, YOU AGREE TO COMPLY WITH THESE GUIDELINES. VIOLATION OF THESE GUIDELINES MAY RESULT IN CONTENT REMOVAL, ACCOUNT SUSPENSION, OR PERMANENT TERMINATION.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Core Principles */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                Core Principles
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Respect and Safety</h3>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        We are committed to maintaining a platform that prioritizes user safety, respects human dignity, and fosters creative expression within legal and ethical boundaries.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Gavel className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Legal Compliance</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        All content and activities on our platform must comply with applicable local, state, federal, and international laws.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Authenticity and Consent</h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        Users must respect the rights and privacy of real individuals and obtain proper consent when creating content that may affect others.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Creative Freedom</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        We support creative expression and artistic freedom while maintaining appropriate boundaries to protect our community.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Prohibited Content and Activities */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                Prohibited Content and Activities
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Ban className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Illegal Content</h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        You may not create, upload, or share content that:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• Depicts or promotes illegal activities</li>
                        <li>• Violates any applicable laws or regulations</li>
                        <li>• Infringes on intellectual property rights</li>
                        <li>• Contains malware, viruses, or harmful code</li>
                        <li>• Facilitates fraud, scams, or deceptive practices</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Harmful Content</h3>
                      <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                        The following types of harmful content are strictly prohibited:
                      </p>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">Violence and Threats:</h4>
                          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                            <li>• Content depicting graphic violence, torture, or cruelty</li>
                            <li>• Threats of violence against individuals or groups</li>
                            <li>• Content glorifying or promoting violence</li>
                            <li>• Instructions for creating weapons or explosives</li>
                            <li>• Content promoting self-harm or suicide</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">Harassment and Bullying:</h4>
                          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                            <li>• Targeted harassment of individuals or groups</li>
                            <li>• Cyberbullying or intimidation tactics</li>
                            <li>• Doxxing (sharing private personal information)</li>
                            <li>• Stalking or persistent unwanted contact</li>
                            <li>• Content designed to humiliate or degrade others</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">Hate Speech and Discrimination:</h4>
                          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                            <li>• Content promoting hatred based on race, ethnicity, religion, gender, sexual orientation, disability, or other protected characteristics</li>
                            <li>• Discriminatory language or imagery</li>
                            <li>• Content promoting supremacist ideologies</li>
                            <li>• Dehumanizing language or imagery</li>
                            <li>• Content inciting violence against protected groups</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Exploitation and Abuse</h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        Absolutely prohibited:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• Any content involving minors in sexual or suggestive contexts</li>
                        <li>• Content depicting or promoting human trafficking</li>
                        <li>• Non-consensual intimate imagery</li>
                        <li>• Content exploiting vulnerable individuals</li>
                        <li>• Revenge porn or intimate image abuse</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Impersonation and Deception</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        You may not:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>• Create content impersonating real individuals without consent</li>
                        <li>• Use another person's likeness, name, or identity without permission</li>
                        <li>• Create deepfakes of real people without explicit consent</li>
                        <li>• Misrepresent your identity or credentials</li>
                        <li>• Create content designed to deceive or mislead others about real events</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Spam and Manipulation</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Prohibited activities include:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Posting repetitive or irrelevant content</li>
                    <li>• Attempting to manipulate platform algorithms</li>
                    <li>• Creating multiple accounts to circumvent restrictions</li>
                    <li>• Engaging in coordinated inauthentic behavior</li>
                    <li>• Selling or transferring accounts</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: Adult Content Guidelines */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                Adult Content Guidelines
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Adult Content Permitted</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        The Service permits the creation of adult content, including nudity and sexual content, subject to strict guidelines and age verification requirements.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Age Requirements</h3>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>• All users accessing adult content features must be 18 years or older</li>
                        <li>• Age verification may be required through third-party services</li>
                        <li>• Users under 18 are prohibited from creating or accessing adult content</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Virtual Character Requirements</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    All AI-generated virtual characters in adult content must:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Clearly appear to be adults (18+ years old)</li>
                    <li>• Not resemble real individuals without explicit consent</li>
                    <li>• Not depict illegal sexual activities</li>
                    <li>• Comply with applicable obscenity laws</li>
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Adult Content Restrictions</h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        Even within adult content, the following are prohibited:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• Content depicting or suggesting minors in sexual contexts</li>
                        <li>• Non-consensual sexual scenarios</li>
                        <li>• Content promoting illegal sexual activities</li>
                        <li>• Extreme violence combined with sexual content</li>
                        <li>• Content violating applicable obscenity standards</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Content Labeling</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Adult content must be:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Properly categorized and labeled</li>
                    <li>• Restricted from users under 18</li>
                    <li>• Clearly identified in content metadata</li>
                    <li>• Subject to additional content warnings</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5: AI-Generated Content Standards */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                AI-Generated Content Standards
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Responsible AI Use</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Users must use AI generation tools responsibly and ethically:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Do not attempt to create content depicting real individuals without consent</li>
                        <li>• Avoid prompts designed to generate illegal or harmful content</li>
                        <li>• Respect the limitations and guidelines of AI providers</li>
                        <li>• Do not attempt to circumvent content filters or safety measures</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Deepfakes and Synthetic Media</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Special requirements for AI-generated content depicting people:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Must not depict real, identifiable individuals without explicit written consent</li>
                        <li>• Must be clearly labeled as AI-generated when shared outside the platform</li>
                        <li>• Must not be used to create false or misleading information about real people</li>
                        <li>• Must not be used for harassment, blackmail, or other harmful purposes</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Intellectual Property Respect</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        When creating AI content:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>• Do not use copyrighted images as input without permission</li>
                        <li>• Avoid creating content that substantially reproduces copyrighted works</li>
                        <li>• Respect trademark rights and brand identities</li>
                        <li>• Do not create content infringing on others' intellectual property</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Consent and Privacy</h3>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                        <li>• Obtain explicit consent before creating content based on real individuals</li>
                        <li>• Respect privacy rights and personal boundaries</li>
                        <li>• Do not create content using private or personal information without consent</li>
                        <li>• Honor requests to remove content depicting someone without permission</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Platform Integrity */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                Platform Integrity
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Ban className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Technical Abuse</h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        You may not:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• Attempt to hack, exploit, or compromise the Service</li>
                        <li>• Use automated tools to access or interact with the Service</li>
                        <li>• Reverse engineer or attempt to extract proprietary algorithms</li>
                        <li>• Interfere with other users' access to the Service</li>
                        <li>• Overload or disrupt Service infrastructure</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Account Security</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Users must:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Maintain the security of their account credentials</li>
                        <li>• Not share accounts with others</li>
                        <li>• Report suspected unauthorized access immediately</li>
                        <li>• Use strong, unique passwords</li>
                        <li>• Enable available security features</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Fair Use</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Users should:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Use the Service in accordance with intended purposes</li>
                        <li>• Not abuse free trials or promotional offers</li>
                        <li>• Respect usage limits and restrictions</li>
                        <li>• Not attempt to circumvent payment or subscription requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Content Moderation */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</span>
                Content Moderation
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Automated Moderation</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        We employ automated systems to:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Detect potentially prohibited content</li>
                        <li>• Flag content for review</li>
                        <li>• Automatically remove clearly violating content</li>
                        <li>• Monitor for suspicious activity patterns</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Content Review Process</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Our moderation process includes:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Automated pre-screening of all generated content</li>
                    <li>• User reporting mechanisms</li>
                    <li>• Regular audits of platform content</li>
                    <li>• Appeals process for moderation decisions</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Enforcement Actions</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        Violations may result in:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>• Content removal or restriction</li>
                        <li>• Account warnings</li>
                        <li>• Temporary account suspension</li>
                        <li>• Permanent account termination</li>
                        <li>• Legal action when appropriate</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Appeals Process</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Users may appeal moderation decisions by:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Submitting an appeal through their account dashboard</li>
                        <li>• Providing additional context or evidence</li>
                        <li>• Requesting human review of automated decisions</li>
                        <li>• Contacting customer support for assistance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: Reporting Violations */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">8</span>
                Reporting Violations
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Flag className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Report</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Users can report violations through:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• In-platform reporting tools</li>
                        <li>• Email to contact@sayasaas.com</li>
                        <li>• Detailed description of the violation</li>
                        <li>• Screenshots or other supporting evidence</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Report Requirements</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Effective reports should include:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Specific description of the violation</li>
                    <li>• Location of the violating content (URL, username, etc.)</li>
                    <li>• Your relationship to the content (if applicable)</li>
                    <li>• Any supporting documentation</li>
                  </ul>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Response Timeline</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        We aim to:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Acknowledge reports within 24 hours</li>
                        <li>• Complete initial review within 5 business days</li>
                        <li>• Provide updates on complex cases</li>
                        <li>• Notify reporters of outcomes when appropriate</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">False Reports</h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        Submitting false or malicious reports may result in:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• Account warnings</li>
                        <li>• Temporary suspension</li>
                        <li>• Permanent account termination</li>
                        <li>• Legal action for abuse of reporting systems</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9: Consequences for Violations */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">9</span>
                Consequences for Violations
              </h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Progressive Enforcement</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        Our enforcement approach typically follows this progression:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>• <strong>First Violation:</strong> Warning and content removal</li>
                        <li>• <strong>Second Violation:</strong> Temporary account suspension (1-7 days)</li>
                        <li>• <strong>Third Violation:</strong> Extended suspension (7-30 days)</li>
                        <li>• <strong>Continued Violations:</strong> Permanent account termination</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Immediate Termination</h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        Certain violations may result in immediate permanent termination:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• Content involving minors in inappropriate contexts</li>
                        <li>• Serious threats of violence</li>
                        <li>• Doxxing or sharing private information</li>
                        <li>• Commercial spam or fraud</li>
                        <li>• Repeated circumvention of restrictions</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Account Restoration</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Terminated accounts may be eligible for restoration if:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• The violation was due to misunderstanding</li>
                        <li>• The user demonstrates understanding of guidelines</li>
                        <li>• The user commits to future compliance</li>
                        <li>• The violation was not severe or repeated</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10: Special Considerations */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">10</span>
                Special Considerations
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Cultural Sensitivity</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        We recognize cultural differences in content standards and strive to:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Apply guidelines consistently across all users</li>
                        <li>• Consider cultural context in moderation decisions</li>
                        <li>• Provide clear explanations for enforcement actions</li>
                        <li>• Maintain dialogue with diverse user communities</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Artistic Expression</h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        We support artistic and creative expression while maintaining safety:
                      </p>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                        <li>• Artistic nudity may be permitted with appropriate labeling</li>
                        <li>• Creative content is evaluated in context</li>
                        <li>• Educational content receives special consideration</li>
                        <li>• Parody and satire are generally permitted within bounds</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">News and Commentary</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Content related to current events and social commentary:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Must be factually accurate when presenting as news</li>
                    <li>• Should be clearly labeled as opinion when appropriate</li>
                    <li>• Must not promote violence or illegal activities</li>
                    <li>• Should respect privacy rights of individuals</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 11: Updates and Changes */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">11</span>
                Updates and Changes
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Guideline Updates</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        These Guidelines may be updated to reflect:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Changes in applicable laws</li>
                        <li>• Evolution of platform features</li>
                        <li>• Community feedback and needs</li>
                        <li>• Emerging safety concerns</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Notification Process</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Users will be notified of significant changes through:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Email notifications to registered users</li>
                        <li>• In-platform announcements</li>
                        <li>• Website posting of updated guidelines</li>
                        <li>• Reasonable advance notice when possible</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Compliance Expectations</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        Users are expected to:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>• Review updated guidelines regularly</li>
                        <li>• Adjust their behavior to comply with changes</li>
                        <li>• Seek clarification when guidelines are unclear</li>
                        <li>• Maintain awareness of platform policies</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 12: Resources and Support */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">12</span>
                Resources and Support
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Educational Resources</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        We provide resources to help users understand and comply with these guidelines:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Detailed FAQ sections</li>
                        <li>• Best practices guides</li>
                        <li>• Community forums for discussion</li>
                        <li>• Regular updates on policy clarifications</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Customer Support</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Users can contact our support team for:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Clarification of guidelines</li>
                        <li>• Assistance with compliance</li>
                        <li>• Technical support issues</li>
                        <li>• Appeals and dispute resolution</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Mental Health Resources</h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        For users affected by harmful content, we provide:
                      </p>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                        <li>• Links to mental health resources</li>
                        <li>• Crisis intervention information</li>
                        <li>• Support for harassment victims</li>
                        <li>• Referrals to appropriate services</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 13: Contact Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">13</span>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">General Guidelines Questions</h3>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Email:</strong> contact@sayasaas.com<br />
                        <strong>Subject:</strong> "Community Guidelines Question"
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Flag className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Content Reports</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Email:</strong> contact@sayasaas.com<br />
                        <strong>Subject:</strong> "Content Violation Report"
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Appeals</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Email:</strong> contact@sayasaas.com<br />
                        <strong>Subject:</strong> "Moderation Appeal"
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Mailing Address</h3>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p>sayasaas llc</p>
                    <p>5203 JUAN TABO BLVD NE SUITE 2B</p>
                    <p>ALBUQUERQUE NM 87111</p>
                    <p>USA</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 14: Legal Disclaimer */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">14</span>
                Legal Disclaimer
              </h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Enforcement Discretion</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        We reserve the right to enforce these guidelines at our discretion and may consider factors such as:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>• Severity of the violation</li>
                        <li>• User's history on the platform</li>
                        <li>• Impact on other users</li>
                        <li>• Legal requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">No Guarantee</h3>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        These guidelines do not guarantee that all content on the platform will comply with your personal standards or preferences.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Legal Rights</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    These guidelines do not limit our legal rights or remedies under applicable law or our Terms of Service.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>© 2025 sayasaas llc. All rights reserved.</p>
                <p className="mt-1">Last updated: January 1, 2025</p>
                <p className="mt-2 text-xs">
                  <strong>Remember:</strong> When in doubt, err on the side of caution. If you're unsure whether content complies with these guidelines, contact our support team before posting.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 