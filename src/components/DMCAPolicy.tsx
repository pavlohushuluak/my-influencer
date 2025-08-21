import React, { useEffect } from 'react';
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
  Phone, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Gavel,
  Globe,
  Settings,
  Info,
  ExternalLink,
  Calendar
} from 'lucide-react';

interface DMCAPolicyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DMCAPolicy({ open, onOpenChange }: DMCAPolicyProps) {
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
    const content = document.getElementById('dmca-content');
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
          <title>DMCA Policy - Nymia.ai</title>
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
              border-bottom: 3px solid #3b82f6;
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
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              border-radius: 8px;
              border: 2px solid #3b82f6;
            }
            
            .document-header::after {
              content: '';
              display: block;
              width: 60px;
              height: 4px;
              background: linear-gradient(90deg, #3b82f6, #1d4ed8);
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
              border-left: 4px solid #3b82f6;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            
            .content-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
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
              background: linear-gradient(90deg, #3b82f6, #1d4ed8);
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
              background: linear-gradient(120deg, #a5b4fc 0%, #818cf8 100%);
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
              border-bottom: 2px solid #3b82f6;
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
    document.title = 'DMCA Policy - Nymia.ai';

    window.print();

    setTimeout(() => {
      document.body.innerHTML = originalBody;
      document.title = originalTitle;
      window.location.reload();
    }, 100);
  };

  const handleDownload = () => {
    const content = document.getElementById('dmca-content');
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
          <title>DMCA Policy - Nymia.ai</title>
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
              border-bottom: 3px solid #3b82f6;
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
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              border-radius: 8px;
              border: 2px solid #3b82f6;
            }
            
            .document-header::after {
              content: '';
              display: block;
              width: 60px;
              height: 4px;
              background: linear-gradient(90deg, #3b82f6, #1d4ed8);
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
              border-left: 4px solid #3b82f6;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .section {
              margin-bottom: 25px;
            }
            
            .content-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
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
              background: linear-gradient(90deg, #3b82f6, #1d4ed8);
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
              background: linear-gradient(120deg, #a5b4fc 0%, #818cf8 100%);
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
              border-bottom: 2px solid #3b82f6;
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
    a.download = 'DMCA_Policy_Nymia.ai.html';
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
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Digital Millennium Copyright Act (DMCA) Policy
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
          <div id="dmca-content" className="p-6 space-y-8">
            {/* Introduction */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Important Notice
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This DMCA Policy outlines our procedures for responding to claims of copyright infringement in accordance with the Digital Millennium Copyright Act of 1998 ("DMCA").
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Overview */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                Overview
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  sayasaas llc ("Company," "we," "us," or "our") respects the intellectual property rights of others and expects users of the Nymia.ai platform (the "Service") to do the same. This DMCA Policy outlines our procedures for responding to claims of copyright infringement in accordance with the Digital Millennium Copyright Act of 1998 ("DMCA").
                </p>
              </div>
            </section>

            {/* Section 2: DMCA Compliance */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                DMCA Compliance
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Safe Harbor Provisions</h3>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        We comply with the safe harbor provisions of the DMCA (17 U.S.C. § 512) and have implemented procedures to respond expeditiously to claims of copyright infringement.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Repeat Infringer Policy</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We maintain a policy of terminating, in appropriate circumstances, the accounts of users who are repeat infringers of copyrighted material.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">No Duty to Monitor</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We have no duty to monitor content on our Service for copyright infringement, but we will respond to valid DMCA notices as described below.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Notice and Takedown Procedure */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                Notice and Takedown Procedure
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Filing a DMCA Notice</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    If you believe that content on our Service infringes your copyright, you may submit a DMCA takedown notice to our designated Copyright Agent.
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Required Elements</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        Your DMCA notice must include ALL of the following elements to be valid:
                      </p>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">1. Identification of Copyrighted Work:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• A description of the copyrighted work you claim has been infringed</li>
                            <li>• If multiple works are involved, a representative list of such works</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">2. Identification of Infringing Material:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• A description of the material you claim is infringing</li>
                            <li>• Sufficient information to locate the material (e.g., URL, username, specific content description)</li>
                            <li>• Screenshots or other evidence of the infringing material</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">3. Contact Information:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• Your full legal name (not a pseudonym or business name)</li>
                            <li>• Your physical address</li>
                            <li>• Your telephone number</li>
                            <li>• Your email address</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">4. Good Faith Statement:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• A statement that you have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">5. Accuracy Statement:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• A statement that the information in your notice is accurate</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">6. Authority Statement:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• A statement, under penalty of perjury, that you are authorized to act on behalf of the copyright owner</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">7. Signature:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• Your physical or electronic signature</li>
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
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Incomplete Notices</h3>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        Notices that do not include all required elements may not be processed. We may, at our discretion, contact you to request missing information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Submitting DMCA Notices */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                Submitting DMCA Notices
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Designated Copyright Agent</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        All DMCA notices must be sent to our designated Copyright Agent:
                      </p>
                      <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <p><strong>Copyright Agent</strong></p>
                        <p>sayasaas llc</p>
                        <p>5203 JUAN TABO BLVD NE SUITE 2B</p>
                        <p>ALBUQUERQUE NM 87111</p>
                        <p>USA</p>
                        <p><strong>Email:</strong> contact@sayasaas.com</p>
                        <p><strong>Subject Line:</strong> "DMCA Takedown Notice"</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Notice Requirements</h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Notices must be in English</li>
                    <li>• Notices must be sent in writing (email acceptable)</li>
                    <li>• Include "DMCA Takedown Notice" in the subject line</li>
                    <li>• Attach supporting documentation when available</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Processing Time</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We will review and respond to valid DMCA notices within 5-10 business days of receipt.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Our Response to Valid Notices */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                Our Response to Valid Notices
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Content Removal</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Upon receipt of a valid DMCA notice, we will:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Remove or disable access to the allegedly infringing material</li>
                    <li>• Notify the user who posted the material of the removal</li>
                    <li>• Provide the user with a copy of the DMCA notice</li>
                    <li>• Inform the user of their right to file a counter-notice</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">User Notification</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    We will notify the affected user via email (if available) and through their account dashboard about:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• The removal of their content</li>
                    <li>• The reason for removal</li>
                    <li>• Their right to file a counter-notice</li>
                    <li>• The counter-notice procedure</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Account Actions</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Depending on the circumstances, we may also:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Issue a warning to the user</li>
                    <li>• Temporarily suspend the user's account</li>
                    <li>• Permanently terminate repeat infringers</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 6: Counter-Notice Procedure */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                Counter-Notice Procedure
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Filing a Counter-Notice</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    If you believe your content was removed due to mistake or misidentification, you may file a counter-notice with our Copyright Agent.
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Required Elements</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        Your counter-notice must include ALL of the following elements:
                      </p>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">1. Identification of Material:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• Description of the material that was removed</li>
                            <li>• Location where the material appeared before removal</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">2. Good Faith Statement:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• A statement, under penalty of perjury, that you have a good faith belief that the material was removed due to mistake or misidentification</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">3. Contact Information:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• Your full legal name</li>
                            <li>• Your physical address</li>
                            <li>• Your telephone number</li>
                            <li>• Your email address</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">4. Consent to Jurisdiction:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• A statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located (or the District of New Mexico if outside the US)</li>
                            <li>• A statement that you will accept service of process from the person who provided the original DMCA notice</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">5. Signature:</h4>
                          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                            <li>• Your physical or electronic signature</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Counter-Notice Processing</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Upon receipt of a valid counter-notice, we will:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Forward a copy to the original complainant</li>
                    <li>• Inform them that we will restore the content in 10-14 business days</li>
                    <li>• Restore the content unless the complainant files a court action seeking an injunction</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 7: Restoration of Content */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</span>
                Restoration of Content
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Automatic Restoration</h3>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        If we receive a valid counter-notice and the original complainant does not provide evidence of filing a court action within 10-14 business days, we will restore the removed content.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Court Orders</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We will comply with valid court orders regarding the restoration or continued removal of content.
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">No Guarantee</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        We reserve the right to refuse restoration if we believe the content violates our Terms of Service or other policies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: Misrepresentation and Abuse */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">8</span>
                Misrepresentation and Abuse
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">False Claims</h3>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        Making false claims in a DMCA notice or counter-notice may result in liability for damages, including costs and attorney fees, under Section 512(f) of the DMCA.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Abuse Prevention</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    We may take action against users who:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Submit false or bad faith DMCA notices</li>
                    <li>• File frivolous counter-notices</li>
                    <li>• Repeatedly infringe copyrights</li>
                    <li>• Abuse the DMCA process</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Account Termination</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Abuse of the DMCA process may result in account termination and legal action.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 9: Repeat Infringer Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">9</span>
                Repeat Infringer Policy
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Three-Strike Policy</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    We maintain a three-strike policy for copyright infringement:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• <strong>First Strike:</strong> Warning and content removal</li>
                    <li>• <strong>Second Strike:</strong> Temporary account suspension</li>
                    <li>• <strong>Third Strike:</strong> Permanent account termination</li>
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Immediate Termination</h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        We reserve the right to immediately terminate accounts for:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• Egregious copyright infringement</li>
                        <li>• Commercial piracy</li>
                        <li>• Repeated willful infringement</li>
                        <li>• Abuse of the DMCA process</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Appeal Process</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Users may appeal termination decisions by contacting our Copyright Agent with evidence that the infringement claims were invalid.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 10: Special Considerations for AI-Generated Content */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">10</span>
                Special Considerations for AI-Generated Content
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">AI Training Data</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We do not claim ownership of copyrighted material used to train AI models. However, we cannot guarantee that AI-generated content does not inadvertently reproduce copyrighted material.
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">User Responsibility</h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        Users are responsible for ensuring their AI-generated content does not infringe copyrights. This includes:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>• Not using copyrighted images as input without permission</li>
                        <li>• Not creating content that substantially reproduces copyrighted works</li>
                        <li>• Not using prompts designed to replicate specific copyrighted content</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Fair Use Considerations</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        We recognize that some AI-generated content may qualify for fair use protection. We will consider fair use factors when evaluating DMCA notices involving AI-generated content.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 11: Trademark and Other Intellectual Property */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">11</span>
                Trademark and Other Intellectual Property
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Trademark Claims</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    While this policy focuses on copyright, we also respond to valid trademark infringement claims. Trademark notices should be sent to our Copyright Agent with appropriate documentation.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Right of Publicity</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We respond to valid right of publicity claims, particularly regarding AI-generated content that may depict real individuals without consent.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Other IP Rights</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We may respond to claims involving other intellectual property rights on a case-by-case basis.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 12: International Considerations */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">12</span>
                International Considerations
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Non-US Copyright</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We will consider DMCA notices regarding copyrights from other countries, provided they meet our notice requirements and are enforceable under US law.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Translation</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Notices in languages other than English should include a certified English translation.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Jurisdiction</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    All DMCA procedures are governed by US law and the jurisdiction of US courts.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 13: Modifications to This Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">13</span>
                Modifications to This Policy
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Policy Updates</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We may update this DMCA Policy from time to time to reflect changes in law, technology, or our procedures.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Notification</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Material changes to this policy will be posted on our website and may be communicated to users via email or in-service notifications.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Effective Date</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Policy changes become effective immediately upon posting unless otherwise specified.
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
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Copyright Agent</h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        For all DMCA-related communications:
                      </p>
                      <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                        <p><strong>Copyright Agent</strong></p>
                        <p>sayasaas llc</p>
                        <p>5203 JUAN TABO BLVD NE SUITE 2B</p>
                        <p>ALBUQUERQUE NM 87111</p>
                        <p>USA</p>
                        <p><strong>Email:</strong> contact@sayasaas.com</p>
                        <p><strong>Phone:</strong> [PHONE NUMBER]</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">General Inquiries</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    For questions about this policy:<br />
                    <strong>Email:</strong> contact@sayasaas.com<br />
                    <strong>Subject:</strong> "DMCA Policy Question"
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Legal Department</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    For legal matters related to copyright:<br />
                    <strong>Email:</strong> contact@sayasaas.com<br />
                    <strong>Subject:</strong> "Legal - Copyright Matter"
                  </p>
                </div>
              </div>
            </section>

            {/* Section 15: Disclaimer */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">15</span>
                Disclaimer
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Legal Advice</h3>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        This policy does not constitute legal advice. Users should consult with qualified attorneys regarding their specific copyright questions or concerns.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Service Availability</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We reserve the right to modify or discontinue the Service at any time, which may affect the availability of content subject to DMCA procedures.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Third-Party Rights</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    This policy does not create any third-party rights or obligations beyond those provided by applicable law.
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
                  <strong>Note:</strong> This DMCA Policy is incorporated into and forms part of our Terms of Service. By using the Service, you agree to comply with this policy.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 