import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RootState } from "@/store/store";
import {
  AlertTriangle,
  Banknote,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  FileX,
  Globe,
  Heart,
  Mail,
  MessageCircle,
  RotateCcw,
  Scale,
  Settings,
  Shield,
  UserX,
  XCircle,
} from "lucide-react";
import { useEffect } from "react";
import { useSelector } from "react-redux";

interface RefundPolicyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RefundPolicy({ open, onOpenChange }: RefundPolicyProps) {
  const { theme } = useSelector((state: RootState) => state.ui);
  useEffect(() => {
    if (open) {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [open, theme]);

  const handlePrint = () => {
    try {
      const termsContent = document.getElementById("refund-content");
      if (!termsContent) return;

      const clonedContent = termsContent.cloneNode(true) as HTMLElement;

      // Remove modal-specific elements
      const elementsToRemove = clonedContent.querySelectorAll(
        ".modal-close, .print-button, [data-modal]"
      );
      elementsToRemove.forEach((el) => el.remove());

      // Remove SVG icons and circular badges
      const svgElements = clonedContent.querySelectorAll("svg");
      svgElements.forEach((svg) => svg.remove());

      const badgeElements = clonedContent.querySelectorAll(
        ".bg-purple-100, .bg-green-100, .bg-blue-100, .bg-yellow-100, .bg-red-100"
      );
      badgeElements.forEach((badge) => badge.remove());

      // Remove any inline styles
      const styleElements = clonedContent.querySelectorAll("style");
      styleElements.forEach((style) => style.remove());

      const originalBody = document.body.innerHTML;
      const originalTitle = document.title;

      const printContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Refund Policy - Nymia.ai</title>
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
              color: #1f2937;
              background: #ffffff;
              padding: 20px;
              font-size: 12px;
              max-width: 800px;
              margin: 0 auto;
            }
            
            h1 {
              font-size: 24px;
              font-weight: 700;
              text-align: center;
              margin-bottom: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              letter-spacing: -0.025em;
            }
            
            h2 {
              font-size: 16px;
              font-weight: 600;
              margin: 20px 0 12px 0;
              color: #374151;
              position: relative;
              padding-left: 30px;
            }
            
            h2::before {
              content: counter(section);
              counter-increment: section;
              position: absolute;
              left: 0;
              top: 0;
              width: 24px;
              height: 24px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: 600;
            }
            
            h3 {
              font-size: 13px;
              font-weight: 600;
              margin: 12px 0 8px 0;
              color: #4b5563;
              border-left: 3px solid #667eea;
              padding-left: 12px;
            }
            
            p {
              margin-bottom: 8px;
              color: #6b7280;
              font-size: 11px;
            }
            
            ul {
              margin: 8px 0 8px 20px;
            }
            
            li {
              margin-bottom: 4px;
              color: #6b7280;
              font-size: 11px;
            }
            
            .document-header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              border: 2px solid transparent;
              border-radius: 12px;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              position: relative;
            }
            
            .document-header::after {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 50%;
              transform: translateX(-50%);
              width: 60%;
              height: 2px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 1px;
            }
            
            .header-info {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-top: 15px;
            }
            
            .header-item {
              background: white;
              padding: 12px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              border: 1px solid #e5e7eb;
            }
            
            .section {
              margin-bottom: 25px;
              counter-reset: section;
            }
            
            .content-box {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 15px;
              margin: 12px 0;
              position: relative;
            }
            
            .content-box::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 8px 8px 0 0;
            }
            
            .success-box {
              background: #f0fdf4;
              border-color: #bbf7d0;
            }
            
            .success-box::before {
              background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            }
            
            .warning-box {
              background: #fffbeb;
              border-color: #fde68a;
            }
            
            .warning-box::before {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            }
            
            .info-box {
              background: #eff6ff;
              border-color: #bfdbfe;
            }
            
            .info-box::before {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            }
            
            .alert-box {
              background: #fef2f2;
              border-color: #fecaca;
            }
            
            .alert-box::before {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            }
            
            .highlight-text {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              font-weight: 600;
            }
            
            .important-text {
              color: #dc2626;
              font-weight: 600;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid transparent;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              border-radius: 12px;
              position: relative;
            }
            
            .footer::before {
              content: '';
              position: absolute;
              top: -2px;
              left: 0;
              right: 0;
              height: 2px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 2px 2px 0 0;
            }
            
            .footer-content {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              padding: 20px;
            }
            
            .footer-section {
              background: white;
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              border: 1px solid #e5e7eb;
            }
            
            .footer-section h4 {
              color: #374151;
              font-size: 12px;
              font-weight: 600;
              margin-bottom: 8px;
              position: relative;
              padding-bottom: 6px;
            }
            
            .footer-section h4::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 30px;
              height: 2px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 1px;
            }
            
            .copyright {
              text-align: center;
              padding: 15px;
              color: #6b7280;
              font-size: 10px;
              border-top: 1px solid #e5e7eb;
              margin-top: 15px;
            }
            
            @media print {
              @page {
                margin: 0.5in;
                size: A4;
              }
              
              body {
                font-size: 10px;
                line-height: 1.4;
                height: auto;
                overflow: visible;
              }
              
              h1 {
                font-size: 18px;
                margin-bottom: 15px;
              }
              
              h2 {
                font-size: 12px;
                margin: 15px 0 8px 0;
              }
              
              h3 {
                font-size: 10px;
                margin: 8px 0 6px 0;
              }
              
              p, li {
                font-size: 9px;
                margin-bottom: 4px;
              }
              
              .document-header {
                margin-bottom: 20px;
                padding: 15px;
              }
              
              .header-info {
                gap: 10px;
                margin-top: 10px;
              }
              
              .header-item {
                padding: 8px;
              }
              
              .section {
                margin-bottom: 15px;
              }
              
              .content-box {
                padding: 10px;
                margin: 8px 0;
              }
              
              .footer {
                margin-top: 25px;
                padding-top: 15px;
              }
              
              .footer-content {
                gap: 15px;
                padding: 15px;
              }
              
              .footer-section {
                padding: 10px;
              }
              
              .copyright {
                padding: 10px;
                font-size: 8px;
                margin-top: 10px;
              }
              
              * {
                page-break-before: auto !important;
                page-break-after: auto !important;
                page-break-inside: auto !important;
              }
              
              h1, h2 {
                page-break-after: auto !important;
              }
              
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

      document.body.innerHTML = printContent;
      document.title = "Refund Policy - Nymia.ai";

      window.print();

      setTimeout(() => {
        document.body.innerHTML = originalBody;
        document.title = originalTitle;
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Print error:", error);
      window.print();
    }
  };

  const handleDownload = () => {
    const termsContent = document.getElementById("refund-content");
    if (!termsContent) return;

    const clonedContent = termsContent.cloneNode(true) as HTMLElement;

    // Remove modal-specific elements
    const elementsToRemove = clonedContent.querySelectorAll(
      ".modal-close, .print-button, [data-modal]"
    );
    elementsToRemove.forEach((el) => el.remove());

    // Remove SVG icons and circular badges
    const svgElements = clonedContent.querySelectorAll("svg");
    svgElements.forEach((svg) => svg.remove());

    const badgeElements = clonedContent.querySelectorAll(
      ".bg-purple-100, .bg-green-100, .bg-blue-100, .bg-yellow-100, .bg-red-100"
    );
    badgeElements.forEach((badge) => badge.remove());

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Refund Policy - Nymia.ai</title>
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
            color: #1f2937;
            background: #ffffff;
            padding: 40px;
            font-size: 14px;
            max-width: 900px;
            margin: 0 auto;
          }
          
          h1 {
            font-size: 32px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.025em;
          }
          
          h2 {
            font-size: 20px;
            font-weight: 600;
            margin: 30px 0 20px 0;
            color: #374151;
            position: relative;
            padding-left: 40px;
          }
          
          h2::before {
            content: counter(section);
            counter-increment: section;
            position: absolute;
            left: 0;
            top: 0;
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
          }
          
          h3 {
            font-size: 16px;
            font-weight: 600;
            margin: 20px 0 12px 0;
            color: #4b5563;
            border-left: 4px solid #667eea;
            padding-left: 16px;
          }
          
          p {
            margin-bottom: 12px;
            color: #6b7280;
          }
          
          ul {
            margin: 12px 0 12px 24px;
          }
          
          li {
            margin-bottom: 6px;
            color: #6b7280;
          }
          
          .document-header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            border: 3px solid transparent;
            border-radius: 16px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            position: relative;
          }
          
          .document-header::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 50%;
            transform: translateX(-50%);
            width: 70%;
            height: 3px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2px;
          }
          
          .header-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
          }
          
          .header-item {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
          }
          
          .section {
            margin-bottom: 35px;
            counter-reset: section;
          }
          
          .content-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            margin: 16px 0;
            position: relative;
          }
          
          .content-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px 12px 0 0;
          }
          
          .success-box {
            background: #f0fdf4;
            border-color: #bbf7d0;
          }
          
          .success-box::before {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          }
          
          .warning-box {
            background: #fffbeb;
            border-color: #fde68a;
          }
          
          .warning-box::before {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          }
          
          .info-box {
            background: #eff6ff;
            border-color: #bfdbfe;
          }
          
          .info-box::before {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          }
          
          .alert-box {
            background: #fef2f2;
            border-color: #fecaca;
          }
          
          .alert-box::before {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          }
          
          .highlight-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 600;
          }
          
          .important-text {
            color: #dc2626;
            font-weight: 600;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 3px solid transparent;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 16px;
            position: relative;
          }
          
          .footer::before {
            content: '';
            position: absolute;
            top: -3px;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 3px 3px 0 0;
          }
          
          .footer-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            padding: 30px;
          }
          
          .footer-section {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
          }
          
          .footer-section h4 {
            color: #374151;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            position: relative;
            padding-bottom: 8px;
          }
          
          .footer-section h4::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 40px;
            height: 3px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2px;
          }
          
          .copyright {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        ${clonedContent.innerHTML}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "refund-policy.html";
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
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Refund Policy
                </DialogTitle>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Effective: January 1, 2025</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  >
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
          <div id="refund-content" className="p-6 space-y-8">
            {/* Important Notice */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Important Notice
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This Refund Policy outlines the terms and conditions under
                    which sayasaas llc ("Company," "we," "us," or "our") may
                    provide refunds for purchases made on the Nymia.ai platform
                    (the "Service"). By making a purchase, you acknowledge that
                    you have read, understood, and agree to be bound by this
                    Refund Policy.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1: Overview */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Overview
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  This Refund Policy outlines the terms and conditions under
                  which sayasaas llc ("Company," "we," "us," or "our") may
                  provide refunds for purchases made on the Nymia.ai platform
                  (the "Service"). By making a purchase, you acknowledge that
                  you have read, understood, and agree to be bound by this
                  Refund Policy.
                </p>
                <div className="mt-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        ALL PURCHASES ARE GENERALLY FINAL AND NON-REFUNDABLE.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: General Refund Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  2
                </span>
                General Refund Policy
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        No-Refund Policy
                      </h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        <strong>
                          All purchases are generally final and non-refundable.
                        </strong>{" "}
                        This includes:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• Monthly subscription fees</li>
                        <li>
                          • Additional Gems purchases ($9.95, $19.95, $49.95,
                          $99.95)
                        </li>
                        <li>• Upgrade fees</li>
                        <li>• Premium features</li>
                        <li>• All digital services and content</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Digital Services Nature
                      </h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        Due to the nature of our digital services and
                        AI-generated content, refunds are generally not provided
                        because:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>
                          • Digital content is delivered immediately upon
                          purchase
                        </li>
                        <li>
                          • AI processing resources are consumed upon generation
                        </li>
                        <li>
                          • Generated content cannot be "returned" like physical
                          goods
                        </li>
                        <li>
                          • Service value is provided through access and usage
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Subscription Continuity
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        When you cancel a subscription:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>
                          • You retain access through the end of your current
                          billing period
                        </li>
                        <li>
                          • No prorated refunds are provided for unused time
                        </li>
                        <li>
                          • Unused monthly Gems expire at the end of the billing
                          cycle
                        </li>
                        <li>
                          • Purchased Gems remain in your account (non-expiring)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Limited Refund Exceptions */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  3
                </span>
                Limited Refund Exceptions
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Technical Service Failures
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Refunds may be considered if:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>
                          • The Service is completely unavailable for more than
                          48 consecutive hours due to our technical issues
                        </li>
                        <li>
                          • You are unable to access paid features due to our
                          system errors for more than 72 hours
                        </li>
                        <li>
                          • Critical functionality is broken and cannot be
                          resolved within a reasonable timeframe
                        </li>
                        <li>
                          • We fail to deliver the core service as described
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Billing Errors
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        We will provide refunds for:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>
                          • Duplicate charges due to payment processing errors
                        </li>
                        <li>
                          • Charges made after successful cancellation due to
                          system errors
                        </li>
                        <li>
                          • Unauthorized charges not made by the account holder
                        </li>
                        <li>• Incorrect pricing due to system errors</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                        Fraud Protection
                      </h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        Refunds will be provided for:
                      </p>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                        <li>
                          • Charges resulting from unauthorized account access
                        </li>
                        <li>
                          • Fraudulent transactions not authorized by the
                          account holder
                        </li>
                        <li>
                          • Identity theft-related charges with proper
                          documentation
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: EU Consumer Rights */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  4
                </span>
                EU Consumer Rights
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Right of Withdrawal (EU/UK Users Only)
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Users residing in the European Union or United Kingdom
                        have a 14-day right of withdrawal under consumer
                        protection laws, subject to the following conditions:
                      </p>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                            Withdrawal Period:
                          </h4>
                          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                            <li>
                              • 14 calendar days from the date of purchase
                            </li>
                            <li>
                              • Must be requested before substantial use of the
                              service
                            </li>
                            <li>
                              • Does not apply once digital content delivery has
                              begun with your consent
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                            Consent to Immediate Performance:
                          </h4>
                          <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                            By using the Service, you explicitly consent to:
                          </p>
                          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                            <li>• Immediate delivery of digital content</li>
                            <li>
                              • Waiver of withdrawal rights once service
                              delivery begins
                            </li>
                            <li>
                              • Understanding that withdrawal rights are lost
                              upon service use
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                            How to Exercise Withdrawal Rights:
                          </h4>
                          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                            <li>• Email contact@sayasaas.com within 14 days</li>
                            <li>
                              • Include your order details and reason for
                              withdrawal
                            </li>
                            <li>
                              • Confirm you have not used the purchased services
                            </li>
                            <li>
                              • Provide proof of EU/UK residency if requested
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Withdrawal Limitations
                      </h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        The right of withdrawal does not apply to:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>
                          • Digital content delivered with your express consent
                        </li>
                        <li>
                          • Services fully performed with your prior consent
                        </li>
                        <li>• Customized or personalized digital content</li>
                        <li>• Content that has been accessed or downloaded</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Banknote className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Partial Refunds for EU Users
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        If you exercise withdrawal rights after partial service
                        use:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>
                          • Refunds will be prorated based on unused service
                          value
                        </li>
                        <li>
                          • Consumed Gems will be deducted from refund amount
                        </li>
                        <li>• Processing fees may be deducted</li>
                        <li>• Refund amount cannot exceed original payment</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Refund Request Process */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  5
                </span>
                Refund Request Process
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        How to Request a Refund
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        To request a refund under the limited exceptions above:
                      </p>
                      <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 ml-4">
                        <li>
                          <strong>Email Request:</strong> Send to
                          contact@sayasaas.com
                        </li>
                        <li>
                          <strong>Subject Line:</strong> "Refund Request - [Your
                          Username]"
                        </li>
                        <li>
                          <strong>Required Information:</strong>
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>• Full name and account email</li>
                            <li>• Order/transaction ID</li>
                            <li>• Date of purchase</li>
                            <li>• Detailed reason for refund request</li>
                            <li>• Supporting documentation (if applicable)</li>
                          </ul>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Required Documentation
                      </h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        Depending on your refund reason, provide:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>• Screenshots of technical errors</li>
                        <li>• Bank statements showing duplicate charges</li>
                        <li>• Police reports for fraud cases</li>
                        <li>• Proof of unauthorized access</li>
                        <li>
                          • Medical documentation (for exceptional
                          circumstances)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Review Process
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Our refund review process:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>
                          • <strong>Acknowledgment:</strong> Within 24 hours of
                          request
                        </li>
                        <li>
                          • <strong>Initial Review:</strong> 3-5 business days
                        </li>
                        <li>
                          • <strong>Investigation:</strong> Up to 10 business
                          days for complex cases
                        </li>
                        <li>
                          • <strong>Decision:</strong> Final decision
                          communicated via email
                        </li>
                        <li>
                          • <strong>Processing:</strong> 5-10 business days if
                          approved
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <RotateCcw className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                        Appeal Process
                      </h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        If your refund request is denied:
                      </p>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                        <li>
                          • You may submit additional evidence within 30 days
                        </li>
                        <li>
                          • Provide new information not previously considered
                        </li>
                        <li>• Request escalation to senior management</li>
                        <li>• Final decisions are at our sole discretion</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Refund Processing */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  6
                </span>
                Refund Processing
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Refund Methods
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Approved refunds will be processed to:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Original payment method used for purchase</li>
                        <li>• Same credit card or payment account</li>
                        <li>• Bank account (if original method unavailable)</li>
                        <li>• Store credit (in exceptional circumstances)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Processing Timeline
                      </h3>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>
                          • <strong>Credit Cards:</strong> 5-10 business days
                        </li>
                        <li>
                          • <strong>Bank Transfers:</strong> 7-14 business days
                        </li>
                        <li>
                          • <strong>Digital Wallets:</strong> 3-7 business days
                        </li>
                        <li>
                          • <strong>International Payments:</strong> Up to 21
                          business days
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Processing Fees
                      </h3>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>
                          • Refunds may be subject to payment processing fees
                        </li>
                        <li>
                          • Currency conversion fees may apply for international
                          refunds
                        </li>
                        <li>
                          • Third-party payment processor fees may be deducted
                        </li>
                        <li>
                          • Net refund amount will be clearly communicated
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Banknote className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                        Partial Refunds
                      </h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        When applicable, partial refunds will be calculated
                        based on:
                      </p>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                        <li>• Unused service time (for subscriptions)</li>
                        <li>• Unconsumed Gems or credits</li>
                        <li>• Prorated service value</li>
                        <li>• Applicable taxes and fees</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Chargeback Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  7
                </span>
                Chargeback Policy
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Chargeback Prevention
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Before initiating a chargeback with your bank or credit
                        card company:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Contact our customer support team first</li>
                        <li>• Allow us to investigate and resolve the issue</li>
                        <li>• Provide opportunity for direct resolution</li>
                        <li>• Consider our refund policy and procedures</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        Chargeback Consequences
                      </h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        Initiating chargebacks without contacting us first may
                        result in:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• Immediate account suspension</li>
                        <li>• Permanent account termination</li>
                        <li>• Loss of all account data and content</li>
                        <li>• Prohibition from creating new accounts</li>
                        <li>• Legal action to recover costs</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Legitimate Chargebacks
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        We will not contest chargebacks for:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Confirmed fraudulent transactions</li>
                        <li>• Billing errors we cannot resolve</li>
                        <li>• Service failures meeting refund criteria</li>
                        <li>• Authorized refunds not processed timely</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Chargeback Defense
                      </h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        We will defend against chargebacks when:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>• Services were delivered as promised</li>
                        <li>• User violated Terms of Service</li>
                        <li>• Refund was properly denied under this policy</li>
                        <li>• Chargeback appears fraudulent or abusive</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8: Special Circumstances */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  8
                </span>
                Special Circumstances
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Medical Emergencies
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        In cases of serious medical emergencies preventing
                        service use:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>
                          • Provide medical documentation from licensed
                          physician
                        </li>
                        <li>
                          • Request must be made within 60 days of incident
                        </li>
                        <li>• Refunds limited to unused service periods</li>
                        <li>• Evaluated on case-by-case basis</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Military Deployment
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        For active military personnel facing deployment:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Provide official deployment orders</li>
                        <li>
                          • Request must be made before or within 30 days of
                          deployment
                        </li>
                        <li>
                          • Partial refunds may be available for unused service
                        </li>
                        <li>• Account may be suspended instead of cancelled</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <UserX className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Death or Incapacity
                      </h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        In cases of user death or legal incapacity:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>
                          • Authorized representative must provide legal
                          documentation
                        </li>
                        <li>• Death certificate or court orders required</li>
                        <li>• Refunds limited to recent unused purchases</li>
                        <li>• Account will be permanently closed</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileX className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                        Service Discontinuation
                      </h3>
                      <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                        If we discontinue the Service:
                      </p>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1 ml-4">
                        <li>• Users will receive 30 days advance notice</li>
                        <li>• Prorated refunds for unused subscription time</li>
                        <li>• Opportunity to export data before closure</li>
                        <li>• No refunds for consumed services or content</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9: Gems and Credits Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  9
                </span>
                Gems and Credits Policy
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        Gems Non-Refundable
                      </h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        Purchased Gems are generally non-refundable because:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>
                          • They provide immediate access to AI processing
                        </li>
                        <li>• Value is delivered upon generation request</li>
                        <li>
                          • Cannot be "returned" once processing is complete
                        </li>
                        <li>
                          • Digital currency nature prevents traditional returns
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Unused Gems
                      </h3>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>
                          • Monthly subscription Gems expire at billing cycle
                          end
                        </li>
                        <li>• Purchased Gems do not expire</li>
                        <li>• No refunds for expired monthly Gems</li>
                        <li>• No cash value or transfer options</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Gems Disputes
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        Disputes regarding Gems will be evaluated based on:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Technical errors in Gems allocation</li>
                        <li>• Billing system malfunctions</li>
                        <li>• Unauthorized Gems consumption</li>
                        <li>• Service delivery failures</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10: Subscription-Specific Terms */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  10
                </span>
                Subscription-Specific Terms
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Monthly Subscriptions
                      </h3>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Billed monthly in advance</li>
                        <li>• No prorated refunds for partial months</li>
                        <li>
                          • Cancellation effective at end of billing period
                        </li>
                        <li>• Access continues through paid period</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Subscription Changes
                      </h3>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Upgrades take effect immediately</li>
                        <li>• Downgrades take effect at next billing cycle</li>
                        <li>• No refunds for subscription changes</li>
                        <li>
                          • Price differences handled as credits or charges
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        Failed Payments
                      </h3>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• Service suspended for failed payments</li>
                        <li>• No refunds for suspension periods</li>
                        <li>• Reactivation upon successful payment</li>
                        <li>
                          • Account termination after extended non-payment
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 11: Contact Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  11
                </span>
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Refund Requests
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Email:</strong> contact@sayasaas.com
                        <br />
                        <strong>Subject:</strong> "Refund Request - [Your
                        Username]"
                        <br />
                        <strong>Response Time:</strong> 24-48 hours
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Billing Questions
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Email:</strong> contact@sayasaas.com
                        <br />
                        <strong>Subject:</strong> "Billing Inquiry"
                        <br />
                        <strong>Phone:</strong> Available during business hours
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Dispute Resolution
                      </h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Email:</strong> contact@sayasaas.com
                        <br />
                        <strong>Subject:</strong> "Billing Dispute"
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Mailing Address
                  </h3>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <p>sayasaas llc</p>
                    <p>5203 JUAN TABO BLVD NE SUITE 2B</p>
                    <p>ALBUQUERQUE NM 87111</p>
                    <p>USA</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 12: Policy Updates */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  12
                </span>
                Policy Updates
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Changes to Policy
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        We reserve the right to modify this Refund Policy at any
                        time. Changes will be:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Posted on our website</li>
                        <li>• Effective immediately upon posting</li>
                        <li>• Applied to future purchases only</li>
                        <li>• Communicated to active subscribers</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Grandfathering
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        Existing subscriptions will be subject to:
                      </p>
                      <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 ml-4">
                        <li>• Refund policy in effect at time of purchase</li>
                        <li>• Updated policies for renewal periods</li>
                        <li>• Notice of policy changes before renewal</li>
                        <li>
                          • Option to cancel before policy changes take effect
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 13: Legal Disclaimers */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  13
                </span>
                Legal Disclaimers
              </h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Final Authority
                      </h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        This Refund Policy represents our complete refund terms.
                        We reserve the right to:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li>• Make final decisions on all refund requests</li>
                        <li>
                          • Modify or waive policy terms at our discretion
                        </li>
                        <li>
                          • Refuse refunds that don't meet stated criteria
                        </li>
                        <li>• Terminate accounts for refund abuse</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Governing Law
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        This Refund Policy is governed by:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Laws of New Mexico, United States</li>
                        <li>• Federal consumer protection laws</li>
                        <li>
                          • International consumer rights where applicable
                        </li>
                        <li>
                          • Terms of Service dispute resolution procedures
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        Limitation of Liability
                      </h3>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        Our liability for refunds is limited to:
                      </p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                        <li>• Original purchase amount</li>
                        <li>• No consequential or indirect damages</li>
                        <li>• No compensation for time or effort</li>
                        <li>
                          • Maximum liability as stated in Terms of Service
                        </li>
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
                <p className="mt-2 text-xs">
                  <strong>Important Notice:</strong> This policy is designed to
                  be fair while protecting our business interests. Most refund
                  requests will be denied unless they meet the specific criteria
                  outlined above. Please read carefully before making purchases.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
