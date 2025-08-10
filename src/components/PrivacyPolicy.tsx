import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  Shield, 
  Users, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  X,
  ExternalLink,
  Lock,
  Eye,
  Database,
  Globe,
  Cookie,
  UserCheck
} from 'lucide-react';

interface PrivacyPolicyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicy({ open, onOpenChange }: PrivacyPolicyProps) {
  const { theme } = useSelector((state: RootState) => state.ui);
  
  const handlePrint = () => {
    try {
      // Get the content element
      const contentElement = document.getElementById('privacy-content');
      if (!contentElement) {
        console.error('Privacy content element not found');
        return;
      }

      // Clone the content to avoid modifying the original
      const clonedContent = contentElement.cloneNode(true) as HTMLElement;

      // Remove modal-specific styling and elements
      const elementsToRemove = clonedContent.querySelectorAll('.modal-close, .print-button, [data-modal]');
      elementsToRemove.forEach(el => el.remove());

      // Remove SVG icons and circular badges
      const svgElements = clonedContent.querySelectorAll('svg');
      svgElements.forEach(svg => svg.remove());

      // Remove circular badges (elements with specific classes)
      const badgeElements = clonedContent.querySelectorAll('.badge, [class*="badge"]');
      badgeElements.forEach(badge => {
        if (badge.classList.contains('rounded-full') || badge.textContent?.includes('●')) {
          badge.remove();
        }
      });

      // Clean up modal-specific styles
      const styleElements = clonedContent.querySelectorAll('style');
      styleElements.forEach(style => style.remove());

      // Temporarily replace body content for printing
      const originalBody = document.body.innerHTML;
      const originalTitle = document.title;
      
      // Create print-ready content
      const printContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Privacy Policy</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.5;
              color: #1f2937;
              max-width: 800px;
              margin: 0 auto;
              padding: 25px;
              background: white;
              font-size: 12px;
              font-weight: 400;
            }
            
            /* Document Header */
            .document-header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #e5e7eb;
              position: relative;
            }
            
            .document-header::after {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 50%;
              transform: translateX(-50%);
              width: 100px;
              height: 2px;
              background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
            }
            
            .document-header h1 {
              font-size: 28px;
              font-weight: 700;
              background: linear-gradient(135deg, #1e40af, #7c3aed, #be185d);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              margin-bottom: 10px;
              letter-spacing: -0.025em;
            }
            
            .header-info {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin: 20px 0;
              padding: 20px;
              background: linear-gradient(135deg, #f8fafc, #f1f5f9);
              border-radius: 12px;
              border: 1px solid #e2e8f0;
            }
            
            .header-item {
              padding: 12px;
              background: white;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .header-item strong {
              display: block;
              font-size: 11px;
              font-weight: 600;
              color: #6b7280;
              margin-bottom: 4px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .header-item span {
              font-size: 12px;
              color: #1f2937;
              font-weight: 500;
            }
            
            /* Section Styles */
            .section {
              margin-bottom: 25px;
              page-break-inside: auto;
              position: relative;
            }
            
            .section h2 {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 12px;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
              position: relative;
              counter-increment: section-counter;
            }
            
            .section h2::before {
              content: counter(section-counter);
              position: absolute;
              left: -15px;
              top: 50%;
              transform: translateY(-50%);
              width: 24px;
              height: 24px;
              background: linear-gradient(135deg, #3b82f6, #8b5cf6);
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: 600;
            }
            
            .section h3 {
              font-size: 14px;
              font-weight: 600;
              color: #374151;
              margin: 15px 0 8px 0;
              padding-left: 15px;
              border-left: 3px solid #3b82f6;
            }
            
            .section p {
              margin-bottom: 10px;
              line-height: 1.6;
              color: #4b5563;
            }
            
            .section ul {
              margin: 12px 0;
              padding-left: 25px;
            }
            
            .section li {
              margin-bottom: 6px;
              line-height: 1.5;
              color: #4b5563;
            }
            
            /* Box Styles */
            .content-box {
              margin: 12px 0;
              padding: 15px;
              border-radius: 12px;
              border: 1px solid #e5e7eb;
              background: #fafafa;
              position: relative;
              page-break-inside: auto;
            }
            
            .content-box::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
              border-radius: 12px 12px 0 0;
            }
            
            .notice-box {
              background: linear-gradient(135deg, #eff6ff, #dbeafe);
              border: 1px solid #bfdbfe;
            }
            
            .warning-box {
              background: linear-gradient(135deg, #fef3c7, #fde68a);
              border: 1px solid #fbbf24;
            }
            
            .info-box {
              background: linear-gradient(135deg, #f0fdf4, #dcfce7);
              border: 1px solid #86efac;
            }
            
            .success-box {
              background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
              border: 1px solid #7dd3fc;
            }
            
            /* Highlight Styles */
            .highlight-text {
              background: linear-gradient(120deg, #fef3c7 0%, #fef3c7 100%);
              padding: 2px 4px;
              border-radius: 4px;
              font-weight: 500;
            }
            
            .important-text {
              color: #dc2626;
              font-weight: 600;
            }
            
            /* Footer */
            .footer {
              margin-top: 30px;
              padding: 25px;
              background: linear-gradient(135deg, #f8fafc, #f1f5f9);
              border-top: 2px solid #e5e7eb;
              border-radius: 12px;
              page-break-inside: auto;
            }
            
            .footer::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 2px;
              background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
            }
            
            .footer-content {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .footer-section {
              padding: 15px;
              background: white;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .footer-section h4 {
              font-size: 12px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 8px;
              padding-bottom: 5px;
              border-bottom: 2px solid #3b82f6;
              position: relative;
            }
            
            .footer-section h4::after {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 0;
              width: 30px;
              height: 2px;
              background: linear-gradient(90deg, #8b5cf6, #ec4899);
            }
            
            .footer-section p {
              font-size: 11px;
              color: #6b7280;
              margin: 0 0 4px 0;
              line-height: 1.4;
            }
            
            .copyright {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 11px;
              color: #9ca3af;
            }
            
            /* Counter Reset */
            body {
              counter-reset: section-counter;
            }
            
            /* Print Optimizations */
            @media print {
              @page {
                margin: 0.5in;
                size: A4;
              }
              
              body {
                padding: 0;
                margin: 0;
                font-size: 10px;
                line-height: 1.4;
                max-width: none;
                background: white;
                height: auto;
                overflow: visible;
              }
              
              h1 {
                font-size: 20px;
                margin: 0 0 10px 0;
                page-break-after: auto;
              }
              
              h2 {
                font-size: 14px;
                margin: 15px 0 8px 0;
                padding: 5px 0;
                page-break-after: auto;
              }
              
              h3 {
                font-size: 11px;
                margin: 10px 0 5px 0;
                padding-left: 8px;
              }
              
              p {
                margin-bottom: 8px;
                font-size: 10px;
                line-height: 1.3;
              }
              
              ul {
                margin: 8px 0;
                padding-left: 15px;
              }
              
              li {
                margin-bottom: 4px;
                font-size: 10px;
              }
              
              .document-header {
                margin-bottom: 20px;
                padding-bottom: 15px;
              }
              
              .header-info {
                grid-template-columns: repeat(2, 1fr);
                gap: 6px;
                margin: 15px 0;
                padding: 10px;
              }
              
              .header-item {
                padding: 8px;
              }
              
              .header-item strong {
                font-size: 9px;
                margin-bottom: 2px;
              }
              
              .header-item span {
                font-size: 10px;
              }
              
              .section {
                margin-bottom: 15px;
                page-break-inside: auto;
              }
              
              .content-box {
                padding: 8px;
                margin: 8px 0;
                page-break-inside: auto;
              }
              
              .footer {
                margin-top: 20px;
                padding: 15px;
                page-break-inside: auto;
                page-break-before: auto;
              }
              
              .footer-content {
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-bottom: 10px;
              }
              
              .footer-section h4 {
                font-size: 9px;
                margin-bottom: 4px;
              }
              
              .footer-section p {
                font-size: 9px;
                margin: 0 0 2px 0;
              }
              
              .copyright {
                padding-top: 10px;
                font-size: 9px;
              }
              
              /* Force content to flow without breaks */
              .section:last-child {
                page-break-after: auto;
              }
              
              .footer {
                page-break-after: auto;
              }
              
              /* Hide decorative elements */
              .document-header::after {
                display: none;
              }
              
              /* Remove all page break controls */
              * {
                page-break-before: auto !important;
                page-break-after: auto !important;
                page-break-inside: auto !important;
              }
              
              /* Only allow breaks where absolutely necessary */
              h1, h2 {
                page-break-after: auto !important;
              }
              
              /* Ensure footer doesn't create blank page */
              .footer {
                page-break-before: auto !important;
                page-break-after: auto !important;
                margin-bottom: 0 !important;
              }
            }
          </style>
        </head>
        <body>
          ${clonedContent.innerHTML}
        </body>
        </html>
      `;

      // Replace body content temporarily
      document.body.innerHTML = printContent;
      document.title = 'Privacy Policy';

      // Print the current page
      window.print();

      // Restore original content after printing
      setTimeout(() => {
        document.body.innerHTML = originalBody;
        document.title = originalTitle;
        
        // Re-initialize any necessary event listeners or components
        window.location.reload();
      }, 100);

    } catch (error) {
      console.error('Print error:', error);
      
      // Fallback: print current page
      try {
        window.print();
      } catch (fallbackError) {
        console.error('Fallback print error:', fallbackError);
      }
    }
  };

  const handleDownload = () => {
    const content = document.getElementById('privacy-content')?.innerText || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'privacy-policy.txt';
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
                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Privacy Policy
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
          <div id="privacy-content" className="p-6 space-y-8">
            {/* Introduction */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Important Notice
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use the Nymia.ai platform. By using the Service, you consent to the collection and use of your information as described in this Privacy Policy.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Introduction */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                Introduction
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  sayasaas llc ("Company," "we," "us," or "our") operates the Nymia.ai platform, including the website at www.nymia.ai and the application at app.nymia.ai (collectively, the "Service"). This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our Service.
                </p>
                <div className="mt-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        BY USING THE SERVICE, YOU CONSENT TO THE COLLECTION AND USE OF YOUR INFORMATION AS DESCRIBED IN THIS PRIVACY POLICY.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Information We Collect */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Information You Provide Directly
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Account Information:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Name and email address</li>
                        <li>• Username and password</li>
                        <li>• Age verification information</li>
                        <li>• Payment information (processed by third-party payment processors)</li>
                        <li>• Profile information and preferences</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Communications:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Messages sent to customer support</li>
                        <li>• Feedback and survey responses</li>
                        <li>• Communications through the Service</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">User-Generated Content:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Virtual characters and digital personas you create</li>
                        <li>• Text prompts and instructions</li>
                        <li>• Images and other content you upload or generate</li>
                        <li>• Metadata associated with your content</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Information We Collect Automatically
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Usage Information:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Pages visited and features used</li>
                        <li>• Time spent on the Service</li>
                        <li>• Click patterns and navigation paths</li>
                        <li>• Search queries and interactions</li>
                        <li>• Gems usage and transaction history</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Technical Information:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• IP address and location data</li>
                        <li>• Device type, operating system, and browser information</li>
                        <li>• Screen resolution and device identifiers</li>
                        <li>• Cookies and similar tracking technologies</li>
                        <li>• Log files and error reports</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: How We Use Your Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                How We Use Your Information
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Service Provision</h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Create and manage your account</li>
                    <li>• Process payments and subscriptions</li>
                    <li>• Provide customer support</li>
                    <li>• Deliver requested features and functionality</li>
                    <li>• Store and manage your generated content</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Service Improvement</h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Analyze usage patterns and user behavior</li>
                    <li>• Improve AI models and algorithms</li>
                    <li>• Develop new features and services</li>
                    <li>• Conduct research and analytics</li>
                    <li>• Optimize Service performance</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Legal and Safety</h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Comply with legal obligations</li>
                    <li>• Enforce our Terms of Service</li>
                    <li>• Detect and prevent fraud or abuse</li>
                    <li>• Protect user safety and security</li>
                    <li>• Respond to legal requests</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: Data Security */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                Data Security
              </h2>
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Security Measures</h3>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                      We implement appropriate technical and organizational measures to protect your personal information:
                    </p>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                      <li>• Encryption of data in transit and at rest</li>
                      <li>• Access controls and authentication systems</li>
                      <li>• Regular security assessments and updates</li>
                      <li>• Employee training on data protection</li>
                      <li>• Incident response procedures</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Your Privacy Rights */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                Your Privacy Rights
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">General Rights</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    You have the right to:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Access your personal information</li>
                    <li>• Correct inaccurate information</li>
                    <li>• Update your account settings and preferences</li>
                    <li>• Delete your account and associated data</li>
                    <li>• Opt out of marketing communications</li>
                  </ul>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">EU/UK User Rights</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        If you are located in the EEA or UK, you have additional rights under GDPR:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Right of Access: Request a copy of your personal data</li>
                        <li>• Right of Rectification: Correct inaccurate personal data</li>
                        <li>• Right of Erasure: Request deletion of your personal data</li>
                        <li>• Right to Restrict Processing: Limit how we process your data</li>
                        <li>• Right to Data Portability: Receive your data in a portable format</li>
                        <li>• Right to Object: Object to certain types of processing</li>
                        <li>• Right to Withdraw Consent: Withdraw consent for consent-based processing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Children's Privacy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                Children's Privacy
              </h2>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Age Restrictions</h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                      The Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors.
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      If we become aware that we have collected personal information from a minor, we will take steps to delete such information promptly.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Contact Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</span>
                Contact Information
              </h2>
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Get in Touch</h3>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                      For questions about this Privacy Policy or our privacy practices, contact us at:
                    </p>
                    <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <p><strong>Email:</strong> contact@sayasaas.com</p>
                      <p><strong>Mail:</strong></p>
                      <p className="ml-4">sayasaas llc</p>
                      <p className="ml-4">5203 JUAN TABO BLVD NE SUITE 2B</p>
                      <p className="ml-4">ALBUQUERQUE NM 87111</p>
                      <p className="ml-4">USA</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>© 2025 sayasaas llc. All rights reserved.</p>
                <p className="mt-1">Last updated: January 1, 2025</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 