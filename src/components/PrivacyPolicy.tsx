import React, { useEffect } from 'react';
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
  
  // Apply theme to document root when modal is open
  useEffect(() => {
    if (open) {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [open, theme]);
  
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
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Performance Data:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Service performance metrics</li>
                        <li>• Error logs and crash reports</li>
                        <li>• Feature usage statistics</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Information from Third Parties
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Authentication Services:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Information from social media login providers (if used)</li>
                        <li>• Profile information from connected accounts</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Payment Processors:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Transaction information and payment status</li>
                        <li>• Billing information (stored by payment processors, not by us)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Age Verification Services:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Age verification status and related information</li>
                        <li>• Identity verification data (processed by third-party providers)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">AI Service Providers:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Processing logs and usage metrics from AI providers</li>
                        <li>• Content generation metadata</li>
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
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Communication</h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Send service-related notifications</li>
                    <li>• Provide customer support responses</li>
                    <li>• Send marketing communications (with consent)</li>
                    <li>• Notify you of policy changes or updates</li>
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
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Marketing and Promotion</h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Use anonymized User Content for marketing purposes</li>
                    <li>• Display generated content on our website and in advertisements</li>
                    <li>• Promote the Service through various channels</li>
                    <li>• Analyze marketing effectiveness</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: Legal Basis for Processing (EU Users) */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                Legal Basis for Processing (EU Users)
              </h2>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">EU/UK Legal Grounds</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                      For users in the European Economic Area (EEA) and United Kingdom, we process your personal information based on the following legal grounds:
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                      <li>• <strong>Contract Performance:</strong> To provide the Service and fulfill our contractual obligations</li>
                      <li>• <strong>Legitimate Interests:</strong> To improve our Service, prevent fraud, and conduct marketing</li>
                      <li>• <strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                      <li>• <strong>Consent:</strong> For marketing communications and certain data processing activities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: How We Share Your Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                How We Share Your Information
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Service Providers</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    We share information with trusted third-party service providers who assist us in operating the Service:
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">AI Technology Providers:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• OpenAI, x.ai, Black Forest Labs, Bytedance, Kling</li>
                        <li>• Replicate, Wavespeed, and fal.ai (API providers)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Infrastructure Providers:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Cloudflare (content delivery and security)</li>
                        <li>• OVH (data hosting and storage)</li>
                        <li>• Cloud GPU providers (temporary processing)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Payment Processing:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Payment processors (CCBill and others)</li>
                        <li>• Fraud prevention services</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Age Verification:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• AgeChecker.net and other verification providers</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Analytics and Marketing:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Analytics service providers</li>
                        <li>• Marketing and advertising platforms</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Legal Requirements</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    We may disclose your information when required by law or to:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Comply with legal processes or government requests</li>
                    <li>• Enforce our Terms of Service</li>
                    <li>• Protect our rights, property, or safety</li>
                    <li>• Protect the rights, property, or safety of others</li>
                    <li>• Prevent fraud or illegal activities</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Business Transfers</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Anonymized Data</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We may share anonymized, aggregated data that cannot identify you for research, marketing, or business purposes.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: International Data Transfers */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                International Data Transfers
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Data Location</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Your personal information may be processed and stored in the United States and other countries where our service providers operate.
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">EU Data Transfers</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        For users in the EEA and UK, we ensure adequate protection for international data transfers through:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• <strong>Standard Contractual Clauses (SCCs)</strong> approved by the European Commission</li>
                        <li>• <strong>Adequacy decisions</strong> for certain countries</li>
                        <li>• <strong>Additional safeguards</strong> as required by applicable law</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Data Migration</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        We are in the process of migrating data storage from Germany to the United States to simplify our data processing operations while maintaining appropriate security measures.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Data Retention */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</span>
                Data Retention
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Account Data</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We retain your account information and personal data for as long as your account is active or as needed to provide the Service.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Content Storage</h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• <strong>Long-term Storage:</strong> Content stored in your allocated space is retained according to your subscription plan</li>
                    <li>• <strong>Temporary Content:</strong> Content not in long-term storage is automatically deleted after 30 days</li>
                    <li>• <strong>Generated Content:</strong> Metadata and processing logs may be retained for service improvement</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Post-Termination</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    After account termination, we retain your data for 90 days for legal and operational purposes, then permanently delete it unless required by law to retain it longer.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Legal Requirements</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We may retain information longer when required by law, regulation, or legal process.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8: Data Security */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">8</span>
                Data Security
              </h2>
              <div className="space-y-4">
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
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Third-Party Security</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We require our service providers to implement appropriate security measures and comply with applicable data protection laws.
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Security Limitations</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        No method of transmission or storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9: Your Privacy Rights */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">9</span>
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
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Exercising Your Rights</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    To exercise your privacy rights, contact us at contact@sayasaas.com. We will respond to your request within 30 days (or as required by applicable law).
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We may require additional information to verify your identity before processing your request.
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Complaints</h3>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        You have the right to lodge a complaint with your local data protection authority if you believe we have violated your privacy rights.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10: Cookies and Tracking Technologies */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">10</span>
                Cookies and Tracking Technologies
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Types of Cookies</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    We use the following types of cookies and similar technologies:
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Essential Cookies:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Required for basic Service functionality</li>
                        <li>• Authentication and security</li>
                        <li>• Load balancing and performance</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Analytics Cookies:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Usage statistics and performance monitoring</li>
                        <li>• User behavior analysis</li>
                        <li>• Service improvement insights</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Marketing Cookies:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Advertising effectiveness measurement</li>
                        <li>• Personalized marketing content</li>
                        <li>• Cross-platform tracking (with consent)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Cookie Management</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You can control cookies through your browser settings. However, disabling certain cookies may limit Service functionality.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Third-Party Cookies</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Third-party service providers may set their own cookies. We are not responsible for third-party cookie practices.
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    These may include cookies from analytics services, advertising networks, and social media platforms that help us understand how users interact with our Service.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 11: Children's Privacy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">11</span>
                Children's Privacy
              </h2>
              <div className="space-y-4">
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
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Parental Notice</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Parents or guardians who believe their child has provided personal information to us should contact us immediately. We will take steps to verify the parent's identity and delete the child's information.
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Reporting</h3>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        If you believe we have collected information from a minor, please contact us immediately at contact@sayasaas.com.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 12: California Privacy Rights */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">12</span>
                California Privacy Rights
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">CCPA Rights</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        California residents have additional rights under the California Consumer Privacy Act (CCPA):
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Right to know what personal information is collected</li>
                        <li>• Right to delete personal information</li>
                        <li>• Right to opt out of the sale of personal information</li>
                        <li>• Right to non-discrimination for exercising privacy rights</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Information Sales</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We do not sell personal information as defined by the CCPA. We may share information with service providers as described in this Privacy Policy.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Exercising CCPA Rights</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    California residents may exercise their rights by contacting us at contact@sayasaas.com.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 13: Changes to This Privacy Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">13</span>
                Changes to This Privacy Policy
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Policy Updates</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Notification</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    We will notify you of material changes by:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Posting the updated policy on our website</li>
                    <li>• Sending email notifications to registered users</li>
                    <li>• Providing in-Service notifications</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Continued Use</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Your continued use of the Service after policy changes constitutes acceptance of the updated Privacy Policy.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 14: Contact Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">14</span>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Privacy Questions</h3>
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
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Data Protection Officer</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        For EU-related privacy matters, you may contact our designated representative at contact@sayasaas.com.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Response Time</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We will respond to privacy inquiries within 30 days of receipt.
                  </p>
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