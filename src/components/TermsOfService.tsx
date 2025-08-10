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
  ExternalLink
} from 'lucide-react';

interface TermsOfServiceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsOfService({ open, onOpenChange }: TermsOfServiceProps) {
  const { theme } = useSelector((state: RootState) => state.ui);
  
  const handlePrint = () => {
    try {
      // Get the content element
      const contentElement = document.getElementById('terms-content');
      if (!contentElement) {
        console.error('Terms content element not found');
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
          <title>Terms of Service</title>
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
      document.title = 'Terms of Service';

      // Print the current page
      window.print();

      // Restore original content after printing
      setTimeout(() => {
        document.body.innerHTML = originalBody;
        document.title = originalTitle;
        
        // Re-initialize any necessary event listeners or components
        // This might be needed if the modal needs to be re-initialized
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
    const content = document.getElementById('terms-content')?.innerText || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terms-of-service.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Terms of Service
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
          <div id="terms-content" className="p-6 space-y-8">
            {/* Introduction */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Important Notice
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    These Terms of Service constitute a legally binding agreement between you and sayasaas llc regarding your use of the Nymia.ai platform. By accessing or using the Service, you agree to be bound by these Terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Acceptance of Terms */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                Acceptance of Terms
              </h2>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
                      BY ACCESSING OR USING THE SERVICE, YOU AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THE SERVICE.
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and sayasaas llc ("Company," "we," "us," or "our") regarding your use of the Nymia.ai platform, including the website located at www.nymia.ai and the application at app.nymia.ai (collectively, the "Service").
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Description of Service */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                Description of Service
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Nymia.ai is an AI-powered platform that enables users to create virtual influencers and digital characters using artificial intelligence technology. The Service allows users to generate, customize, and manage virtual personas for various purposes, including but not limited to entertainment, marketing, and creative expression.
                </p>
              </div>
            </section>

            {/* Section 3: Eligibility and Age Requirements */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                Eligibility and Age Requirements
              </h2>
              <div className="space-y-4">
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Age Requirement
                  </h3>
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    You must be at least <strong>18 years of age</strong> to use the Service. By using the Service, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Age Verification</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    For access to adult content features, you may be required to complete additional age verification through our third-party verification service. Failure to complete age verification may result in restricted access to certain features.
                  </p>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Prohibited Users</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    You may not use the Service if you:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Are under 18 years of age</li>
                    <li>• Have been previously banned from the Service</li>
                    <li>• Are prohibited by applicable law from using the Service</li>
                    <li>• Reside in a jurisdiction where the Service is not available</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: Account Registration and Security */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                Account Registration and Security
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Account Creation</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    To access certain features of the Service, you must create an account by providing accurate, current, and complete information. You agree to maintain and update your account information as necessary.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Account Security</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    You are responsible for:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Maintaining the confidentiality of your account credentials</li>
                    <li>• All activities that occur under your account</li>
                    <li>• Immediately notifying us of any unauthorized use of your account</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Account Restrictions</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    You may not:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Share your account with others</li>
                    <li>• Create multiple accounts</li>
                    <li>• Use another person's account</li>
                    <li>• Transfer your account to another person</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 5: Subscription and Payment Terms */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                Subscription and Payment Terms
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Subscription Plans
                  </h3>
                  <div className="text-sm text-green-800 dark:text-green-200 space-y-2">
                    <p><strong>Subscription Plans:</strong> The Service operates on a subscription basis with monthly billing cycles. Each subscription includes a base allocation of "Gems" (our credit system currency) and access to platform features.</p>
                    <p><strong>Pricing:</strong> Current subscription pricing ranges from $9.95 to $149.95 per month. Additional Gems may be purchased separately for $9.95, $19.95, $49.95, or $99.95.</p>
                    <p><strong>Free Trial:</strong> New users receive 15 Gems upon registration for trial purposes.</p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Payment Processing</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Payments are processed through third-party payment processors. You authorize us to charge your designated payment method for all applicable fees.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Automatic Renewal</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Subscriptions automatically renew at the end of each billing cycle unless cancelled. You may cancel your subscription at any time through your account settings.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Gems System</h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Monthly subscription Gems expire at the end of each billing cycle</li>
                    <li>• Purchased Gems roll over and do not expire</li>
                    <li>• Subscription Gems are consumed before purchased Gems</li>
                    <li>• Gems cannot be transferred between users or converted to cash</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 6: Acceptable Use Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                Acceptable Use Policy
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Permitted Uses</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    You may use the Service to:
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                    <li>• Create virtual influencers and digital characters</li>
                    <li>• Generate content for personal or commercial use</li>
                    <li>• Customize and manage your virtual personas</li>
                    <li>• Access and use generated content in accordance with these Terms</li>
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Prohibited Uses</h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                    You may not use the Service to:
                  </p>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                    <li>• Create content depicting real individuals without their explicit consent</li>
                    <li>• Generate content involving minors or individuals who appear to be under 18</li>
                    <li>• Create content that violates applicable laws or regulations</li>
                    <li>• Engage in harassment, bullying, or threatening behavior</li>
                    <li>• Distribute malware, viruses, or other harmful code</li>
                    <li>• Attempt to reverse engineer or hack the Service</li>
                    <li>• Violate intellectual property rights of others</li>
                    <li>• Create content for illegal purposes</li>
                    <li>• Impersonate others or provide false information</li>
                  </ul>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Adult Content</h3>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-2">
                    The Service permits the creation of adult content, including nudity and sexual content, subject to the following restrictions:
                  </p>
                  <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                    <li>• All virtual characters must appear to be adults (18+)</li>
                    <li>• Content must not depict illegal activities</li>
                    <li>• Content must not violate applicable obscenity laws</li>
                    <li>• Users must comply with age verification requirements</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 7: Intellectual Property Rights */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</span>
                Intellectual Property Rights
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">User Content Ownership</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    You retain ownership of content you create using the Service ("User Content"), subject to the license granted to us below.
                  </p>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">License to Company</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    By using the Service, you grant us a worldwide, non-exclusive, royalty-free, sublicensable license to:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Host, store, and display your User Content</li>
                    <li>• Use your User Content to provide and improve the Service</li>
                    <li>• Use your User Content for moderation and compliance purposes</li>
                    <li>• Use your User Content anonymously for marketing and promotional purposes on our website and in advertising materials</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Company Intellectual Property</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    The Service, including all software, algorithms, designs, and content provided by us, is protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our intellectual property.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">AI Technology</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    The Service utilizes AI technology from third-party providers including OpenAI, x.ai, Black Forest Labs, Bytedance, and Kling. Your use of the Service is subject to the terms and policies of these providers.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8: Content Moderation and Removal */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">8</span>
                Content Moderation and Removal
              </h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Automated Moderation</h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                    We employ automated content moderation systems to detect and prevent prohibited content. Content that violates these Terms may be automatically removed or restricted.
                  </p>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Content Removal</h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    We reserve the right to remove, restrict, or refuse to display any User Content that violates these Terms, applicable law, infringes third-party rights, is reported by other users, or we determine is inappropriate in our sole discretion.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No Obligation to Monitor</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We have no obligation to monitor User Content but reserve the right to do so.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9: Data Storage and Retention */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">9</span>
                Data Storage and Retention
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Content Storage</h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Subscription plans include varying amounts of long-term storage</li>
                    <li>• Content not stored in your allocated space is automatically deleted after 30 days</li>
                    <li>• We are not responsible for deleted content</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Account Deletion</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Upon account termination, your data will be retained for 90 days for legal and operational purposes, then permanently deleted.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 10: Privacy and Data Protection */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">10</span>
                Privacy and Data Protection
              </h2>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Data Protection</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 11: Disclaimers and Warranties */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">11</span>
                Disclaimers and Warranties
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Service Availability</h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                    The Service is provided "as is" and "as available." We do not guarantee uninterrupted or error-free service.
                  </p>
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Content Accuracy</h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                    We make no warranties regarding the accuracy, reliability, or quality of AI-generated content.
                  </p>
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Third-Party Services</h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                    We are not responsible for the availability, accuracy, or content of third-party services integrated with our platform.
                  </p>
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Disclaimer of Warranties</h3>
                  <p className="text-sm text-red-800 dark:text-red-200 font-semibold">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 12: Limitation of Liability */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">12</span>
                Limitation of Liability
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Liability Cap</h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-3 font-semibold">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED THE GREATER OF (A) $100 OR (B) THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.
                  </p>
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Excluded Damages</h3>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">User Responsibility</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You are solely responsible for your use of the Service and any consequences thereof.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 13: Indemnification */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">13</span>
                Indemnification
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  You agree to indemnify, defend, and hold harmless the Company and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service, your violation of these Terms, your violation of any third-party rights, or your User Content.
                </p>
              </div>
            </section>

            {/* Section 14: Termination */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">14</span>
                Termination
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Termination by User</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    You may terminate your account at any time through your account settings. Paid subscriptions will continue until the end of the current billing cycle.
                  </p>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Termination by Company</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We may terminate or suspend your account immediately if you violate these Terms, engage in fraudulent or illegal activity, pose a risk to other users or the Service, or fail to pay applicable fees.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Effect of Termination</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Upon termination:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Your access to the Service will cease</li>
                    <li>• Your User Content may be deleted</li>
                    <li>• Unused Gems will be forfeited</li>
                    <li>• These Terms will remain in effect for applicable provisions</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 15: Dispute Resolution */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">15</span>
                Dispute Resolution
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Binding Arbitration</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    Any dispute arising from these Terms or your use of the Service shall be resolved through binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules.
                  </p>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Class Action Waiver</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    You agree to resolve disputes individually and waive any right to participate in class actions or representative proceedings.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Governing Law</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    These Terms are governed by the laws of New Mexico, without regard to conflict of law principles.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Jurisdiction</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Any legal proceedings not subject to arbitration shall be conducted in the courts of New Mexico.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 16: General Provisions */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">16</span>
                General Provisions
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Entire Agreement</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    These Terms, together with our Privacy Policy and other referenced policies, constitute the entire agreement between you and the Company.
                  </p>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Modifications</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    We may modify these Terms at any time by posting updated terms on our website. Continued use of the Service constitutes acceptance of modified terms.
                  </p>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Severability</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    If any provision of these Terms is found unenforceable, the remaining provisions will remain in full force and effect.
                  </p>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Assignment</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You may not assign these Terms without our written consent. We may assign these Terms without restriction.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 17: Contact Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">17</span>
                Contact Information
              </h2>
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Get in Touch</h3>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                      For questions about these Terms, contact us at:
                    </p>
                    <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <p><strong>Company:</strong> sayasaas llc</p>
                      <p><strong>Address:</strong> 5203 JUAN TABO BLVD NE SUITE 2B, ALBUQUERQUE NM 87111, USA</p>
                      <p><strong>Email:</strong> contact@sayasaas.com</p>
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