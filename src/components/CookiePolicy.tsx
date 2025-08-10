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
  UserCheck,
  Settings,
  BarChart3,
  Target,
  Monitor
} from 'lucide-react';

interface CookiePolicyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookiePolicy({ open, onOpenChange }: CookiePolicyProps) {
  const { theme } = useSelector((state: RootState) => state.ui);
  
  const handlePrint = () => {
    try {
      // Get the content element
      const contentElement = document.getElementById('cookie-content');
      if (!contentElement) {
        console.error('Cookie content element not found');
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
          <title>Cookie Policy</title>
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
      document.title = 'Cookie Policy';

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
    const content = document.getElementById('cookie-content')?.innerText || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cookie-policy.txt';
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
                <Cookie className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Cookie Policy
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
          <div id="cookie-content" className="p-6 space-y-8">
            {/* Introduction */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Important Notice
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This Cookie Policy explains how we use cookies and similar tracking technologies on the Nymia.ai platform. By using the Service, you consent to the use of cookies as described in this policy.
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
                  This Cookie Policy explains how sayasaas llc ("Company," "we," "us," or "our") uses cookies and similar tracking technologies on the Nymia.ai platform, including our website at www.nymia.ai and application at app.nymia.ai (collectively, the "Service").
                </p>
                <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                        This Cookie Policy should be read in conjunction with our Privacy Policy, which provides additional information about how we collect, use, and protect your personal information.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        BY USING THE SERVICE, YOU CONSENT TO THE USE OF COOKIES AS DESCRIBED IN THIS POLICY.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: What Are Cookies */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                What Are Cookies
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Definition
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Cookies are small text files that are stored on your device (computer, tablet, smartphone) when you visit websites or use applications. They contain information that is transferred to your device's hard drive and allow websites to recognize your device and remember certain information about your visit.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Types of Cookies by Duration
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Session Cookies:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Temporary cookies that expire when you close your browser</li>
                        <li>• Used to maintain your session while using the Service</li>
                        <li>• Automatically deleted when you end your browsing session</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Persistent Cookies:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Remain on your device for a specified period or until manually deleted</li>
                        <li>• Used to remember your preferences and settings across visits</li>
                        <li>• Have expiration dates ranging from days to years</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Types of Cookies by Origin
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">First-Party Cookies:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Set directly by our Service</li>
                        <li>• Used for essential functionality and user experience</li>
                        <li>• Under our direct control and management</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Third-Party Cookies:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Set by external service providers we work with</li>
                        <li>• Used for analytics, advertising, and additional functionality</li>
                        <li>• Governed by third-party privacy policies</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: How We Use Cookies */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                How We Use Cookies
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Essential Cookies</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        These cookies are necessary for the Service to function properly and cannot be disabled:
                      </p>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Authentication and Security:</h4>
                          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                            <li>• User login status and session management</li>
                            <li>• Security tokens and CSRF protection</li>
                            <li>• Account verification and access control</li>
                            <li>• Prevention of unauthorized access</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Core Functionality:</h4>
                          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                            <li>• User interface preferences and settings</li>
                            <li>• Shopping cart and subscription management</li>
                            <li>• Form data preservation during navigation</li>
                            <li>• Error handling and system stability</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Load Balancing:</h4>
                          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                            <li>• Server routing and traffic distribution</li>
                            <li>• Performance optimization</li>
                            <li>• Service availability maintenance</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Performance and Analytics Cookies</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        These cookies help us understand how users interact with our Service:
                      </p>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Usage Analytics:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Page views and user navigation patterns</li>
                            <li>• Feature usage and engagement metrics</li>
                            <li>• Performance monitoring and optimization</li>
                            <li>• Error tracking and debugging</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Service Improvement:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• A/B testing for feature development</li>
                            <li>• User experience optimization</li>
                            <li>• Content personalization</li>
                            <li>• Platform performance analysis</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Functional Cookies</h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        These cookies enhance your experience by remembering your preferences:
                      </p>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">User Preferences:</h4>
                          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                            <li>• Language and region settings</li>
                            <li>• Theme and display preferences</li>
                            <li>• Notification settings</li>
                            <li>• Accessibility options</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Content Customization:</h4>
                          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                            <li>• Recently viewed content</li>
                            <li>• Saved projects and favorites</li>
                            <li>• Personalized recommendations</li>
                            <li>• User interface customizations</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Marketing and Advertising Cookies</h3>
                      <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                        These cookies are used for marketing purposes (with your consent where required):
                      </p>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">Advertising:</h4>
                          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                            <li>• Targeted advertisement delivery</li>
                            <li>• Ad performance measurement</li>
                            <li>• Cross-platform advertising coordination</li>
                            <li>• Retargeting and remarketing campaigns</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">Marketing Analytics:</h4>
                          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                            <li>• Campaign effectiveness tracking</li>
                            <li>• Conversion rate optimization</li>
                            <li>• Customer acquisition analysis</li>
                            <li>• Marketing ROI measurement</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Specific Cookies We Use */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                Specific Cookies We Use
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Essential Service Cookies
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Cookie Name</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Purpose</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Duration</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">nymia_session</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">User session management</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Session</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">First-party</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">auth_token</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Authentication status</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">30 days</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">First-party</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">csrf_token</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Security protection</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Session</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">First-party</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">user_prefs</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Basic user preferences</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">1 year</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">First-party</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Analytics Cookies
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Cookie Name</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Purpose</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Duration</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">_ga</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Google Analytics user identification</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">2 years</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Third-party</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">_gid</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Google Analytics session identification</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">24 hours</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Third-party</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">_gat</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Google Analytics traffic throttling</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">1 minute</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Third-party</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">amplitude_*</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">User behavior analytics</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">1 year</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Third-party</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Functional Cookies
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Cookie Name</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Purpose</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Duration</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">theme_pref</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">UI theme selection</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">1 year</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">First-party</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">lang_pref</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Language preference</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">1 year</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">First-party</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">tutorial_seen</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Tutorial completion status</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">1 year</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">First-party</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">notification_prefs</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Notification settings</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">1 year</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">First-party</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Marketing Cookies
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Cookie Name</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Purpose</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Duration</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-medium">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">_fbp</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Facebook Pixel tracking</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">90 days</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Third-party</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">_gcl_au</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Google Ads conversion tracking</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">90 days</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Third-party</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">utm_source</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Marketing campaign tracking</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">30 days</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">First-party</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-mono text-xs">referrer_id</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">Referral program tracking</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">90 days</td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">First-party</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Third-Party Cookies */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                Third-Party Cookies
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Analytics Providers
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Google Analytics:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• <strong>Purpose:</strong> Website traffic and user behavior analysis</li>
                            <li>• <strong>Data collected:</strong> Page views, user interactions, demographic information</li>
                            <li>• <strong>Privacy policy:</strong> https://policies.google.com/privacy</li>
                            <li>• <strong>Opt-out:</strong> https://tools.google.com/dlpage/gaoptout</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Amplitude:</h4>
                          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                            <li>• <strong>Purpose:</strong> Product analytics and user journey tracking</li>
                            <li>• <strong>Data collected:</strong> Feature usage, user engagement, conversion events</li>
                            <li>• <strong>Privacy policy:</strong> https://amplitude.com/privacy</li>
                            <li>• <strong>Control:</strong> Through our cookie preferences</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Advertising Partners
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Facebook/Meta:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• <strong>Purpose:</strong> Social media advertising and conversion tracking</li>
                            <li>• <strong>Data collected:</strong> Website visits, ad interactions, conversion events</li>
                            <li>• <strong>Privacy policy:</strong> https://www.facebook.com/privacy/policy</li>
                            <li>• <strong>Control:</strong> Facebook Ad Preferences settings</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Google Ads:</h4>
                          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                            <li>• <strong>Purpose:</strong> Search and display advertising</li>
                            <li>• <strong>Data collected:</strong> Ad clicks, conversions, audience insights</li>
                            <li>• <strong>Privacy policy:</strong> https://policies.google.com/privacy</li>
                            <li>• <strong>Control:</strong> Google Ad Settings</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Infrastructure Providers
                  </h3>
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Cloudflare:</h4>
                        <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                          <li>• <strong>Purpose:</strong> Content delivery and security</li>
                          <li>• <strong>Data collected:</strong> IP addresses, security threats, performance metrics</li>
                          <li>• <strong>Privacy policy:</strong> https://www.cloudflare.com/privacy/</li>
                          <li>• <strong>Control:</strong> Essential for service operation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Managing Your Cookie Preferences */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                Managing Your Cookie Preferences
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Cookie Consent Management
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    When you first visit our Service, you will see a cookie consent banner allowing you to:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Accept all cookies</li>
                    <li>• Reject non-essential cookies</li>
                    <li>• Customize your cookie preferences</li>
                    <li>• Access detailed cookie information</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Browser Settings
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    You can control cookies through your browser settings:
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Google Chrome:</h4>
                      <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>1. Settings → Privacy and Security → Cookies and other site data</li>
                        <li>2. Choose your preferred cookie settings</li>
                        <li>3. Manage exceptions for specific sites</li>
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Mozilla Firefox:</h4>
                      <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>1. Settings → Privacy & Security → Cookies and Site Data</li>
                        <li>2. Select cookie acceptance preferences</li>
                        <li>3. Manage individual site permissions</li>
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Safari:</h4>
                      <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>1. Preferences → Privacy → Cookies and website data</li>
                        <li>2. Choose cookie blocking preferences</li>
                        <li>3. Manage website-specific settings</li>
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Microsoft Edge:</h4>
                      <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>1. Settings → Cookies and site permissions → Cookies and site data</li>
                        <li>2. Configure cookie handling preferences</li>
                        <li>3. Add site-specific exceptions</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Mobile Device Settings
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">iOS Safari:</h4>
                      <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>1. Settings → Safari → Privacy & Security</li>
                        <li>2. Block All Cookies or Allow from Websites I Visit</li>
                        <li>3. Manage website data</li>
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Android Chrome:</h4>
                      <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>1. Chrome → Settings → Site settings → Cookies</li>
                        <li>2. Allow or block cookies</li>
                        <li>3. Manage site-specific permissions</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Opt-Out Tools
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Industry Opt-Out Pages:</h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• Network Advertising Initiative: http://www.networkadvertising.org/choices/</li>
                        <li>• Digital Advertising Alliance: http://www.aboutads.info/choices/</li>
                        <li>• European Interactive Digital Advertising Alliance: http://www.youronlinechoices.eu/</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Do Not Track:</h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            We respect Do Not Track signals where technically feasible and legally required.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Impact of Disabling Cookies */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</span>
                Impact of Disabling Cookies
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Essential Cookies</h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        Disabling essential cookies will:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• Prevent you from logging into your account</li>
                        <li>• Disable core Service functionality</li>
                        <li>• Cause security and performance issues</li>
                        <li>• Make the Service largely unusable</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Analytics Cookies</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        Disabling analytics cookies will:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>• Not affect Service functionality</li>
                        <li>• Prevent us from improving user experience</li>
                        <li>• Reduce our ability to optimize performance</li>
                        <li>• Limit personalization features</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Marketing Cookies</h3>
                      <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                        Disabling marketing cookies will:
                      </p>
                      <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                        <li>• Not affect Service functionality</li>
                        <li>• Show less relevant advertisements</li>
                        <li>• Prevent marketing campaign tracking</li>
                        <li>• Reduce personalized content recommendations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: International Considerations */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">8</span>
                International Considerations
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">EU/UK Users (GDPR)</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Under GDPR, we:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Obtain explicit consent for non-essential cookies</li>
                        <li>• Provide clear information about cookie purposes</li>
                        <li>• Allow easy withdrawal of consent</li>
                        <li>• Respect your right to object to processing</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">California Users (CCPA)</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Under CCPA, we:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Disclose cookie-based data collection</li>
                        <li>• Provide opt-out mechanisms for data sales</li>
                        <li>• Respect Do Not Sell requests</li>
                        <li>• Maintain records of consent and opt-outs</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Other Jurisdictions
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We comply with applicable cookie and privacy laws in all jurisdictions where we operate.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9: Cookie Security */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">9</span>
                Cookie Security
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Security Measures</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        We implement security measures for cookies including:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Secure transmission (HTTPS only)</li>
                        <li>• HttpOnly flags for sensitive cookies</li>
                        <li>• SameSite attributes for CSRF protection</li>
                        <li>• Regular security audits and updates</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Data Protection</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Cookie data is protected through:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Encryption of sensitive information</li>
                        <li>• Access controls and authentication</li>
                        <li>• Regular security monitoring</li>
                        <li>• Incident response procedures</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Third-Party Security</h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        We require third-party cookie providers to:
                      </p>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                        <li>• Implement appropriate security measures</li>
                        <li>• Comply with applicable privacy laws</li>
                        <li>• Provide transparency about data use</li>
                        <li>• Honor user privacy preferences</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10: Updates to This Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">10</span>
                Updates to This Policy
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Policy Changes
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    We may update this Cookie Policy to reflect:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Changes in our cookie usage</li>
                    <li>• New third-party integrations</li>
                    <li>• Legal or regulatory requirements</li>
                    <li>• User feedback and best practices</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Notification Process</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        We will notify you of material changes through:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Updated policy posting on our website</li>
                        <li>• Email notifications to registered users</li>
                        <li>• In-Service notifications or banners</li>
                        <li>• Cookie consent banner updates</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Effective Date
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Policy changes become effective:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Immediately upon posting for non-material changes</li>
                    <li>• After notice period for material changes</li>
                    <li>• Upon your continued use of the Service</li>
                    <li>• When you accept updated cookie preferences</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 11: Contact Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">11</span>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Cookie Questions</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        For questions about our cookie practices:
                      </p>
                      <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                        <p><strong>Email:</strong> contact@sayasaas.com</p>
                        <p><strong>Subject:</strong> "Cookie Policy Question"</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Privacy Concerns</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        For privacy-related concerns:
                      </p>
                      <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <p><strong>Email:</strong> contact@sayasaas.com</p>
                        <p><strong>Subject:</strong> "Privacy Concern"</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Data Protection Requests</h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        For data protection requests:
                      </p>
                      <div className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                        <p><strong>Email:</strong> contact@sayasaas.com</p>
                        <p><strong>Subject:</strong> "Data Protection Request"</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Mailing Address
                  </h3>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p><strong>sayasaas llc</strong></p>
                    <p>5203 JUAN TABO BLVD NE SUITE 2B</p>
                    <p>ALBUQUERQUE NM 87111</p>
                    <p>USA</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 12: Additional Resources */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">12</span>
                Additional Resources
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Learn More About Cookies
                  </h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• All About Cookies: https://www.allaboutcookies.org/</li>
                    <li>• Cookie Central: https://www.cookiecentral.com/</li>
                    <li>• Your Online Choices: https://www.youronlinechoices.com/</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Privacy Tools
                  </h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Privacy Badger: https://privacybadger.org/</li>
                    <li>• Ghostery: https://www.ghostery.com/</li>
                    <li>• uBlock Origin: https://ublockorigin.com/</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Regulatory Information
                  </h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• ICO (UK): https://ico.org.uk/for-organisations/guide-to-pecr/cookies-and-similar-technologies/</li>
                    <li>• CNIL (France): https://www.cnil.fr/en/cookies-and-other-tracking-devices-cnil-publishes-new-guidelines</li>
                    <li>• FTC (US): https://www.ftc.gov/tips-advice/business-center/privacy-and-security/privacy-policy-guidance</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>© 2025 sayasaas llc. All rights reserved.</p>
                <p className="mt-1">Last updated: January 1, 2025</p>
                <p className="mt-1">Please check this page periodically for updates.</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 