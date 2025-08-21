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
  UserCheck,
  Settings,
  BarChart3,
  Target,
  Monitor,
  MessageSquare,
  Flag,
  AlertCircle,
  FileWarning,
  UserX,
  HelpCircle,
  Mail
} from 'lucide-react';

interface ComplaintPolicyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComplaintPolicy({ open, onOpenChange }: ComplaintPolicyProps) {
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
      const contentElement = document.getElementById('complaint-content');
      if (!contentElement) {
        console.error('Complaint content element not found');
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
          <title>Complaint Policy</title>
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
      document.title = 'Complaint Policy';

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
    const content = document.getElementById('complaint-content')?.innerText || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'complaint-policy.txt';
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
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Complaint Policy
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
          <div id="complaint-content" className="p-6 space-y-8">
            {/* Introduction */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Important Notice
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    sayasaas llc is committed to providing excellent service and maintaining a safe, respectful environment on the Nymia.ai platform. We take all complaints seriously and are committed to fair, timely, and transparent resolution processes.
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
                  sayasaas llc ("Company," "we," "us," or "our") is committed to providing excellent service and maintaining a safe, respectful environment on the Nymia.ai platform (the "Service"). This Complaint Policy outlines how we handle complaints, concerns, and disputes from users and non-users regarding our Service, content, user conduct, and business practices.
                </p>
                <div className="mt-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        We take all complaints seriously and are committed to fair, timely, and transparent resolution processes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Scope of This Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                Scope of This Policy
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    What This Policy Covers
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    This policy applies to complaints regarding:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• User-generated content on the platform</li>
                    <li>• User behavior and conduct violations</li>
                    <li>• Service functionality and technical issues</li>
                    <li>• Billing and payment disputes</li>
                    <li>• Privacy and data protection concerns</li>
                    <li>• Content moderation decisions</li>
                    <li>• Account suspension or termination</li>
                    <li>• Customer service experiences</li>
                    <li>• Platform policies and their enforcement</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Who Can File Complaints
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Complaints may be filed by:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Registered users of the Service</li>
                    <li>• Non-users affected by content or conduct on the platform</li>
                    <li>• Rights holders claiming infringement</li>
                    <li>• Legal representatives acting on behalf of affected parties</li>
                    <li>• Regulatory authorities and law enforcement</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Related Policies
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    This policy works in conjunction with:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Terms of Service</li>
                    <li>• Community Guidelines & Acceptable Use Policy</li>
                    <li>• DMCA Policy</li>
                    <li>• Privacy Policy</li>
                    <li>• Refund Policy</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: Types of Complaints */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                Types of Complaints
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileWarning className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Content-Related Complaints</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">Inappropriate Content:</h4>
                          <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                            <li>• Violations of Community Guidelines</li>
                            <li>• Adult content accessed by minors</li>
                            <li>• Violent or disturbing content</li>
                            <li>• Hate speech or discriminatory content</li>
                            <li>• Spam or misleading content</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">Intellectual Property Violations:</h4>
                          <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                            <li>• Copyright infringement (see DMCA Policy)</li>
                            <li>• Trademark violations</li>
                            <li>• Unauthorized use of likeness or identity</li>
                            <li>• Trade secret misappropriation</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">Privacy Violations:</h4>
                          <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                            <li>• Non-consensual intimate imagery</li>
                            <li>• Doxxing or sharing private information</li>
                            <li>• Unauthorized use of personal data</li>
                            <li>• Deepfakes without consent</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <UserX className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">User Conduct Complaints</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">Harassment and Abuse:</h4>
                          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                            <li>• Cyberbullying or intimidation</li>
                            <li>• Stalking or persistent unwanted contact</li>
                            <li>• Threats of violence or harm</li>
                            <li>• Coordinated harassment campaigns</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">Fraudulent Activity:</h4>
                          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                            <li>• Account impersonation</li>
                            <li>• Scams or deceptive practices</li>
                            <li>• Payment fraud or chargebacks</li>
                            <li>• Fake reviews or testimonials</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">Platform Abuse:</h4>
                          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                            <li>• Multiple account creation</li>
                            <li>• Circumventing restrictions or bans</li>
                            <li>• Automated or bot activity</li>
                            <li>• System manipulation or hacking attempts</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Service-Related Complaints</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Technical Issues:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• Service outages or downtime</li>
                            <li>• Feature malfunctions</li>
                            <li>• Data loss or corruption</li>
                            <li>• Performance problems</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Billing Disputes:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• Unauthorized charges</li>
                            <li>• Incorrect billing amounts</li>
                            <li>• Failed refund processing</li>
                            <li>• Subscription management issues</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Customer Service:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• Unresponsive support</li>
                            <li>• Inadequate assistance</li>
                            <li>• Unprofessional conduct</li>
                            <li>• Delayed resolution</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Policy and Moderation Complaints</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Moderation Decisions:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Wrongful content removal</li>
                            <li>• Inappropriate account actions</li>
                            <li>• Inconsistent policy enforcement</li>
                            <li>• Appeals process concerns</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Policy Concerns:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Unclear or confusing policies</li>
                            <li>• Unfair policy changes</li>
                            <li>• Discriminatory enforcement</li>
                            <li>• Lack of transparency</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: How to File a Complaint */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                How to File a Complaint
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ExternalLink className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Online Complaint Form</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        <strong>Primary Method:</strong> Use our online complaint form at [URL]
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Provides structured format for complaint details</li>
                        <li>• Automatically generates tracking number</li>
                        <li>• Allows file attachments and evidence upload</li>
                        <li>• Sends confirmation email upon submission</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Email Complaints</h3>
                      <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                        <p><strong>Email:</strong> contact@sayasaas.com</p>
                        <p><strong>Subject Line Format:</strong> "Complaint - [Type] - [Brief Description]"</p>
                        <div>
                          <p className="font-medium mb-1">Examples:</p>
                          <ul className="space-y-1 ml-4">
                            <li>• "Complaint - Content Violation - Inappropriate Material"</li>
                            <li>• "Complaint - User Conduct - Harassment"</li>
                            <li>• "Complaint - Billing - Unauthorized Charge"</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Flag className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">In-Platform Reporting</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Content Reports:</h4>
                          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                            <li>• Use "Report" button on specific content</li>
                            <li>• Select appropriate violation category</li>
                            <li>• Provide additional context in comments</li>
                            <li>• Submit supporting evidence if available</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">User Reports:</h4>
                          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                            <li>• Access user profile reporting options</li>
                            <li>• Select behavior violation type</li>
                            <li>• Describe specific incidents with dates/times</li>
                            <li>• Include screenshots or other evidence</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Postal Mail
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    For formal legal complaints or when electronic methods are unavailable:
                  </p>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p><strong>sayasaas llc</strong></p>
                    <p>Attention: Complaint Resolution Team</p>
                    <p>5203 JUAN TABO BLVD NE SUITE 2B</p>
                    <p>ALBUQUERQUE NM 87111</p>
                    <p>USA</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Complaint Requirements */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                Complaint Requirements
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Required Information</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        All complaints must include:
                      </p>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Contact Information:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Full name (or organization name)</li>
                            <li>• Email address</li>
                            <li>• Phone number (optional but helpful)</li>
                            <li>• Mailing address (for formal complaints)</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Complaint Details:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Clear description of the issue</li>
                            <li>• Specific violation or concern</li>
                            <li>• Date and time of incident(s)</li>
                            <li>• Location of content (URLs, usernames, etc.)</li>
                            <li>• Impact or harm caused</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Supporting Evidence:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Screenshots or screen recordings</li>
                            <li>• Email correspondence</li>
                            <li>• Transaction records</li>
                            <li>• Legal documentation (if applicable)</li>
                            <li>• Witness statements (if relevant)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Complaint Specificity</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Effective complaints should:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Be specific rather than general</li>
                        <li>• Focus on particular incidents or content</li>
                        <li>• Provide concrete examples</li>
                        <li>• Avoid inflammatory language</li>
                        <li>• Include relevant context</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Good Faith Requirement</h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        All complaints must be made in good faith. We prohibit:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• False or misleading complaints</li>
                        <li>• Malicious or retaliatory reports</li>
                        <li>• Spam or automated complaint submissions</li>
                        <li>• Complaints made to harass or intimidate others</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Complaint Processing */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                Complaint Processing
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Initial Response</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Acknowledgment Timeline:</h4>
                          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                            <li>• Online/Email complaints: Within 24 hours</li>
                            <li>• Postal complaints: Within 5 business days</li>
                            <li>• Emergency complaints: Within 2 hours</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Acknowledgment Includes:</h4>
                          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                            <li>• Complaint tracking number</li>
                            <li>• Estimated resolution timeline</li>
                            <li>• Next steps in the process</li>
                            <li>• Contact information for follow-up</li>
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
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Investigation Process</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Step 1: Initial Review (1-2 business days)</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Complaint categorization and prioritization</li>
                            <li>• Assignment to appropriate team member</li>
                            <li>• Initial evidence gathering</li>
                            <li>• Determination of investigation scope</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Step 2: Detailed Investigation (3-10 business days)</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Content and account review</li>
                            <li>• User notification (when appropriate)</li>
                            <li>• Additional evidence collection</li>
                            <li>• Consultation with legal/policy teams (if needed)</li>
                            <li>• Third-party verification (if required)</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Step 3: Decision and Action (1-3 business days)</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Final determination based on evidence</li>
                            <li>• Implementation of appropriate actions</li>
                            <li>• Documentation of decision rationale</li>
                            <li>• Preparation of response to complainant</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Investigation Standards</h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        Our investigations follow these principles:
                      </p>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                        <li>• <strong>Impartiality:</strong> Fair consideration of all evidence</li>
                        <li>• <strong>Thoroughness:</strong> Complete review of relevant information</li>
                        <li>• <strong>Consistency:</strong> Application of uniform standards</li>
                        <li>• <strong>Transparency:</strong> Clear communication of process and outcomes</li>
                        <li>• <strong>Timeliness:</strong> Resolution within stated timeframes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Priority Levels</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">Emergency (2-hour response):</h4>
                          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                            <li>• Imminent threats of violence</li>
                            <li>• Child safety concerns</li>
                            <li>• Active security breaches</li>
                            <li>• Legal emergencies</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">High Priority (24-hour response):</h4>
                          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                            <li>• Harassment or abuse</li>
                            <li>• Privacy violations</li>
                            <li>• Intellectual property infringement</li>
                            <li>• Significant service disruptions</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">Standard Priority (5-day response):</h4>
                          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                            <li>• Policy violations</li>
                            <li>• Content concerns</li>
                            <li>• Billing disputes</li>
                            <li>• General service issues</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">Low Priority (10-day response):</h4>
                          <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                            <li>• Feature requests</li>
                            <li>• Policy clarifications</li>
                            <li>• Minor technical issues</li>
                            <li>• General feedback</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Resolution Outcomes */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</span>
                Resolution Outcomes
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Possible Actions</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Depending on the complaint, we may take the following actions:
                      </p>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Content Actions:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Content removal or restriction</li>
                            <li>• Content labeling or warnings</li>
                            <li>• Age-gating or access restrictions</li>
                            <li>• Platform-wide content policy updates</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">User Actions:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Formal warning to user</li>
                            <li>• Temporary account suspension</li>
                            <li>• Permanent account termination</li>
                            <li>• Restriction of specific features</li>
                            <li>• Requirement for additional verification</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Service Actions:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Technical fixes or improvements</li>
                            <li>• Policy clarifications or updates</li>
                            <li>• Process improvements</li>
                            <li>• Staff training or disciplinary action</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Financial Actions:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Refunds or credits</li>
                            <li>• Billing corrections</li>
                            <li>• Payment processing improvements</li>
                            <li>• Compensation for damages (when appropriate)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Communication of Outcomes</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Complainants will receive:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Written notification of investigation results</li>
                        <li>• Explanation of actions taken (when appropriate)</li>
                        <li>• Rationale for decisions</li>
                        <li>• Information about appeal processes</li>
                        <li>• Timeline for implementation of actions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Confidentiality</h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        We maintain confidentiality by:
                      </p>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                        <li>• Limiting access to complaint information</li>
                        <li>• Protecting complainant identity when possible</li>
                        <li>• Redacting sensitive information in communications</li>
                        <li>• Following applicable privacy laws and regulations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: Appeals Process */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">8</span>
                Appeals Process
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Right to Appeal</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        You may appeal our complaint resolution if you believe:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• The investigation was inadequate or biased</li>
                        <li>• Important evidence was not considered</li>
                        <li>• The outcome was disproportionate to the violation</li>
                        <li>• Procedural errors affected the result</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Appeal Requirements</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Appeals must be submitted within <strong>30 days</strong> of the original decision and include:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Original complaint tracking number</li>
                        <li>• Specific grounds for appeal</li>
                        <li>• New evidence not previously considered</li>
                        <li>• Clear explanation of desired outcome</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Appeal Process</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Step 1: Appeal Review (5 business days)</h4>
                          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                            <li>• Senior team member reviews appeal</li>
                            <li>• Assessment of new evidence or arguments</li>
                            <li>• Determination of appeal validity</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Step 2: Re-investigation (10 business days)</h4>
                          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                            <li>• Fresh review of original complaint</li>
                            <li>• Consideration of new evidence</li>
                            <li>• Consultation with additional team members</li>
                            <li>• Independent assessment of original decision</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Step 3: Final Decision (3 business days)</h4>
                          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                            <li>• Final determination on appeal</li>
                            <li>• Implementation of any changes</li>
                            <li>• Communication of results to appellant</li>
                            <li>• Case closure and documentation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Appeal Outcomes</h3>
                      <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                        Appeals may result in:
                      </p>
                      <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                        <li>• <strong>Upheld:</strong> Original decision confirmed</li>
                        <li>• <strong>Modified:</strong> Partial change to original decision</li>
                        <li>• <strong>Reversed:</strong> Original decision overturned</li>
                        <li>• <strong>Remanded:</strong> Case returned for additional investigation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9: Special Complaint Categories */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">9</span>
                Special Complaint Categories
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileWarning className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Legal Complaints</h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        For complaints involving legal matters:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• May require additional documentation</li>
                        <li>• Could involve law enforcement coordination</li>
                        <li>• May have extended investigation timelines</li>
                        <li>• Might require legal counsel consultation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Regulatory Complaints</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        For complaints from regulatory authorities:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Receive highest priority processing</li>
                        <li>• May require formal legal responses</li>
                        <li>• Could trigger compliance audits</li>
                        <li>• Might result in policy changes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Media and Public Interest</h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        For complaints receiving media attention:
                      </p>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                        <li>• Assigned to senior management</li>
                        <li>• May require public statements</li>
                        <li>• Could involve external communications team</li>
                        <li>• Might trigger broader policy reviews</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Repeat Complaints</h3>
                      <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                        For recurring complaints about the same issue:
                      </p>
                      <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                        <li>• May be consolidated for efficiency</li>
                        <li>• Could trigger systematic reviews</li>
                        <li>• Might result in broader policy changes</li>
                        <li>• May require enhanced monitoring</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10: Complaint Abuse Prevention */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">10</span>
                Complaint Abuse Prevention
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Identifying Abuse</h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        We monitor for complaint abuse including:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• Multiple complaints about the same content without new evidence</li>
                        <li>• Complaints clearly made in bad faith</li>
                        <li>• Automated or bot-generated complaints</li>
                        <li>• Complaints used to harass or intimidate users</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <UserX className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Consequences for Abuse</h3>
                      <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                        Complaint abuse may result in:
                      </p>
                      <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                        <li>• Warning about proper complaint procedures</li>
                        <li>• Temporary restriction on filing complaints</li>
                        <li>• Permanent ban from complaint system</li>
                        <li>• Account termination for severe abuse</li>
                        <li>• Legal action for harassment or defamation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Protection Measures</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        We protect against abuse by:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Requiring detailed information for complaints</li>
                        <li>• Verifying complainant identity when necessary</li>
                        <li>• Tracking complaint patterns and frequency</li>
                        <li>• Implementing rate limits on complaint submissions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 11: External Dispute Resolution */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">11</span>
                External Dispute Resolution
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Alternative Dispute Resolution</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        For unresolved complaints, we may offer:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Mediation through neutral third parties</li>
                        <li>• Arbitration for certain types of disputes</li>
                        <li>• Industry-specific resolution programs</li>
                        <li>• Regulatory complaint processes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Regulatory Authorities</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        You may also file complaints with relevant authorities:
                      </p>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">United States:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Federal Trade Commission (FTC)</li>
                            <li>• State Attorney General offices</li>
                            <li>• Better Business Bureau</li>
                            <li>• Industry-specific regulators</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">European Union:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• National data protection authorities</li>
                            <li>• Consumer protection agencies</li>
                            <li>• Digital services coordinators</li>
                            <li>• European Consumer Centres</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Other Jurisdictions:</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                            <li>• Local consumer protection agencies</li>
                            <li>• Data protection authorities</li>
                            <li>• Industry ombudsman services</li>
                            <li>• Court systems</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Legal Action</h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        This complaint policy does not limit your right to:
                      </p>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                        <li>• Seek legal counsel</li>
                        <li>• File lawsuits in appropriate courts</li>
                        <li>• Pursue regulatory complaints</li>
                        <li>• Exercise other legal remedies</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 12: Continuous Improvement */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">12</span>
                Continuous Improvement
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Complaint Analysis</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        We regularly analyze complaints to:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Identify recurring issues and trends</li>
                        <li>• Improve our policies and procedures</li>
                        <li>• Enhance user education and communication</li>
                        <li>• Prevent similar complaints in the future</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Policy Updates</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Based on complaint patterns, we may:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Update our Terms of Service</li>
                        <li>• Revise Community Guidelines</li>
                        <li>• Improve technical systems</li>
                        <li>• Enhance staff training programs</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Transparency Reporting</h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        We may publish periodic transparency reports including:
                      </p>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                        <li>• Number and types of complaints received</li>
                        <li>• Resolution times and outcomes</li>
                        <li>• Policy changes made in response to complaints</li>
                        <li>• Trends and patterns in complaint data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 13: Contact Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">13</span>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Complaint Submission</h3>
                      <div className="text-sm text-green-800 dark:text-green-200 space-y-2">
                        <p><strong>Primary Email:</strong> contact@sayasaas.com</p>
                        <p><strong>Online Form:</strong> [URL to be added]</p>
                        <p><strong>Response Time:</strong> 24 hours for acknowledgment</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Complaint Status Inquiries</h3>
                      <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                        <p><strong>Email:</strong> contact@sayasaas.com</p>
                        <p><strong>Subject:</strong> "Complaint Status - [Tracking Number]"</p>
                        <p><strong>Phone:</strong> [PHONE NUMBER] (business hours only)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Appeals</h3>
                      <div className="text-sm text-purple-800 dark:text-purple-200 space-y-2">
                        <p><strong>Email:</strong> contact@sayasaas.com</p>
                        <p><strong>Subject:</strong> "Appeal - [Original Tracking Number]"</p>
                        <p><strong>Deadline:</strong> 30 days from original decision</p>
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
                    <p>Complaint Resolution Team</p>
                    <p>5203 JUAN TABO BLVD NE SUITE 2B</p>
                    <p>ALBUQUERQUE NM 87111</p>
                    <p>USA</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 14: Policy Updates */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">14</span>
                Policy Updates
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Changes to This Policy</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        We may update this Complaint Policy to:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Improve complaint resolution processes</li>
                        <li>• Comply with new legal requirements</li>
                        <li>• Address user feedback and concerns</li>
                        <li>• Reflect changes in our services</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Notification of Changes</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        We will notify users of material changes through:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Email notifications to registered users</li>
                        <li>• Website announcements</li>
                        <li>• In-service notifications</li>
                        <li>• Updated policy posting with change highlights</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Effective Date</h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        Policy changes become effective:
                      </p>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                        <li>• 30 days after notification for material changes</li>
                        <li>• Immediately for minor clarifications</li>
                        <li>• Upon posting for emergency updates</li>
                        <li>• As specified in change notifications</li>
                      </ul>
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
                <p className="mt-1">Please check this page periodically for updates.</p>
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      We are committed to fair and transparent complaint resolution. Your feedback helps us improve our service and maintain a safe, respectful community for all users.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 