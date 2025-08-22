import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Edit3,
  Plus,
  Download,
  Eye,
  EyeOff,
  Calendar as CalendarIcon,
} from "lucide-react";
import jsPDF from "jspdf";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface EulaSection {
  id: string;
  title: string;
  content: string;
  isCustom?: boolean;
  isEditing?: boolean;
}

interface EulaVariables {
  // Provider Details
  providerName: string;
  providerABN: string;
  providerAddress: string;
  providerEmail: string;
  providerPhone: string;
  providerWebsite: string;

  // Product/Service Details
  productName: string;
  productType: string;
  version: string;
  description: string;

  // Recipient Details
  recipientName: string;
  recipientAddress: string;
  recipientEmail: string;

  // Agreement Details
  licenseDate: string;
  authorizedUse: string;
  country: string;
  state: string;
}

const defaultSections: EulaSection[] = [
  {
    id: "parties",
    title: "1. PARTIES AND DEFINITIONS",
    content:
      'This End User License Agreement ("Agreement") is entered into on {LICENSE_DATE} between {PROVIDER_NAME} (ABN: {PROVIDER_ABN}) \
    of {PROVIDER_ADDRESS} ("Provider", "Licensor", "we", "us", or "our") and {RECIPIENT_NAME} of {RECIPIENT_ADDRESS} ("User", "Licensee", "you", or "your"). \
    For the purposes of this Agreement: "Intellectual Property" includes but is not limited to copyrights, trademarks, patents, trade secrets, \
    and proprietary information; "Documentation" means any user manuals, technical specifications, and other materials provided; "Confidential Information" \
    means any non-public technical or business information; "Update" means any bug fix, patch, or minor enhancement; "Upgrade" means any major version release requiring additional licensing fees.',
  },
  {
    id: "grant-license",
    title: "2. GRANT OF LICENSE AND SCOPE",
    content:
      "Subject to the terms of this Agreement, compliance with all payment obligations, and Australian law, {PROVIDER_NAME} hereby grants you a limited, \
    non-exclusive, non-transferable, revocable license to use {PRODUCT_NAME} [{PRODUCT_TYPE}] version [{VERSION}] for {AUTHORIZED_USE} within {TERRITORY}. \
    This license is effective from {LICENSE_DATE} and includes the right to: (a) install and use the {PRODUCT_TYPE} on devices under your direct control; \
    (b) make one backup copy for archival purposes; (c) use Documentation in connection with your authorized use. This license does not grant rights to: \
    (i) source code or proprietary algorithms; (ii) patents or patent applications; (iii) future versions unless explicitly stated; (iv) technical support beyond basic installation guidance. \
    For hardware products, this license covers embedded software and firmware components only.",
  },
  {
    id: "scope-use",
    title: "3. SCOPE OF USE AND PERMITTED ACTIVITIES",
    content:
      "You may use the {PRODUCT_TYPE} solely for {AUTHORIZED_USE} as described: {DESCRIPTION}. \
      Permitted activities include: \
      (a) normal operation within specified performance parameters; \
      (b) integration with compatible third-party systems for authorized purposes; \
      (c) reasonable customization of user interfaces and settings; \
      (d) data export in standard formats for backup purposes. \
      You must ensure: \
      (i) compliance with all applicable Australian federal, state, and local laws; \
      (ii) implementation of reasonable security measures to protect access credentials; \
      (iii) prompt installation of critical security updates; \
      (iv) maintenance of accurate usage records if required for licensing compliance. \
      For multi-user environments, you are responsible for ensuring all users comply with this Agreement. \
      Temporary use by contractors or consultants acting on your behalf is permitted provided they agree to these terms.",
  },
  {
    id: "restrictions",
    title: "4. RESTRICTIONS AND PROHIBITED USES",
    content:
      "You expressly agree not to, and will not permit others to: \
    (a) copy, reproduce, or distribute the {PRODUCT_TYPE} except as expressly permitted; \
    (b) modify, adapt, alter, translate, or create derivative works; \
    (c) reverse engineer, decompile, disassemble, or attempt to derive source code or underlying algorithms; \
    (d) remove, alter, or obscure any proprietary notices, labels, or marks; \
    (e) rent, lease, loan, sell, sublicense, or otherwise transfer rights; \
    (f) use the {PRODUCT_TYPE} to develop competing products or services; \
    (g) attempt to circumvent licensing mechanisms or usage limitations; \
    (h) use the {PRODUCT_TYPE} in any manner that violates applicable laws, regulations, or third-party rights; \
    (i) use the {PRODUCT_TYPE} in critical systems where failure could result in death, personal injury, or environmental damage without express written consent; \
    (j) exceed authorized user limits or usage quotas; (k) attempt to gain unauthorized access to Provider systems or other users' data. \
    For hardware products, physical tampering, modification of firmware, or unauthorized repair attempts are strictly prohibited and will void this license.",
  },
  {
    id: "intellectual-property",
    title: "5. INTELLECTUAL PROPERTY RIGHTS AND OWNERSHIP",
    content:
      "{PROVIDER_NAME} retains all right, title, and interest in and to the {PRODUCT_TYPE}, including all intellectual property rights, proprietary technology, \
    trade secrets, know-how, and any improvements, modifications, or derivative works made by Provider. This Agreement grants no ownership rights and conveys only the \
    limited license rights expressly set forth herein. Any feedback, suggestions, or improvements you provide regarding the {PRODUCT_TYPE} become the exclusive property \
    of {PROVIDER_NAME} without compensation. You retain ownership of your data but grant Provider a limited license to process such data solely to provide the licensed services. \
    Third-party components included in the {PRODUCT_TYPE} remain the property of their respective owners and may be subject to separate license terms. \
    You acknowledge that unauthorized use of Provider's intellectual property may cause irreparable harm for which monetary damages would be inadequate, \
    and Provider shall be entitled to equitable relief including injunction and specific performance.",
  },
  {
    id: "consumer-guarantees",
    title: "6. AUSTRALIAN CONSUMER LAW COMPLIANCE",
    content:
      'Nothing in this Agreement excludes, restricts, or modifies any consumer guarantee, right, or remedy under the Competition and Consumer Act 2010 [Cth] \
    or Australian Consumer Law ("ACL") that cannot lawfully be excluded, restricted, or modified. Where the ACL applies and permits limitation of liability, \
    our liability for breach of any non-excludable consumer guarantee is limited to, at our option: \
    (a) for goods: repair, replacement, or refund of the purchase price; \
    (b) for services: re-supply of services or refund of the amount paid. \
    These guarantees include that goods are of acceptable quality, fit for purpose, match their description, and that services are provided with due care and skill. \
    If you acquire the {PRODUCT_TYPE} for business use where the ACL applies, our liability is limited to the maximum extent permitted by law. \
    For international users or business-to-business transactions outside consumer protection, warranties are limited as set forth in Section 8. This Section survives termination of this Agreement.',
  },
  {
    id: "privacy",
    title: "7. PRIVACY, DATA PROTECTION, AND SECURITY",
    content:
      "We collect, use, and disclose personal information in accordance with the Privacy Act 1988 [Cth], Australian Privacy Principles, \
    and our Privacy Policy available at {PROVIDER_WEBSITE}/privacy. Types of information collected may include: personal identifiers, usage data, device information, \
    and technical logs necessary for service provision and improvement. By using the {PRODUCT_TYPE}, you consent to: (a) collection and processing of personal information \
    as described in our Privacy Policy; (b) international transfer of data to jurisdictions with adequate privacy protections; (c) use of cookies and similar technologies \
    for functionality and analytics; (d) automated processing for security, fraud prevention, and service optimization. \
    You have rights under Australian privacy law including access, correction, and complaint procedures detailed in our Privacy Policy. \
    For business users processing personal information of others, you warrant you have appropriate authority and will comply with applicable privacy laws. \
    We implement reasonable security measures but cannot guarantee absolute security. You must promptly notify us of any suspected data breaches or unauthorized access.",
  },
  {
    id: "limitation-liability",
    title: "8. WARRANTY DISCLAIMERS AND LIMITATION OF LIABILITY",
    content: `To the maximum extent permitted by Australian law and subject to Section 6 (Consumer Law): \
    (a) the {PRODUCT_TYPE} is provided "as is" and "as available" without warranties of any kind; \
    (b) {PROVIDER_NAME} disclaims all warranties, express, implied, or statutory, including merchantability, fitness for a \
    particular purpose, non-infringement, accuracy, completeness, and uninterrupted operation; \
    (c) we do not warrant that the {PRODUCT_TYPE} will meet your requirements, be error-free, secure, or continuously available. \
    In no event shall {PROVIDER_NAME} be liable for: \
    (i) indirect, incidental, special, consequential, or punitive damages; \
    (ii) loss of profits, data, use, or goodwill; \
    (iii) business interruption or loss of business opportunities; \
    (iv) damages arising from third-party claims or actions. \
    Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim or AUD $1,000, whichever is greater. \
    These limitations apply regardless of the theory of liability and even if we have been advised of the possibility of such damages. \
    Some jurisdictions do not allow limitation of certain warranties or damages, so some limitations may not apply to you.`,
  },
  {
    id: "support",
    title: "9. SUPPORT, MAINTENANCE, AND UPDATES",
    content:
      "{PROVIDER_NAME} may, but is not obligated to, provide technical support, maintenance, updates, or upgrades for the {PRODUCT_TYPE}. \
    When provided, support is available during Australian business hours (9 AM - 5 PM AWST, Monday-Friday, excluding public holidays) via email at \
    {PROVIDER_EMAIL} or through our support portal at {PROVIDER_WEBSITE}/support. Support services include: \
    (a) assistance with installation and basic configuration; \
    (b) bug fixes and security patches; \
    (c) compatibility updates for major operating system changes; \
    (d) access to documentation and knowledge base. \
    Support does not include: \
    (i) custom development or modifications; \
    (ii) training or consulting services; \
    (iii) support for modified or unauthorized versions; \
    (iv) recovery of lost data or configurations; \
    (v) support for end-of-life versions beyond 24 months. \
    Response times are: \
    (a) Critical issues (system down) - 4 business hours; \
    (b) High priority - 1 business day; \
    (c) Medium priority - 3 business days; \
    (d) Low priority - 5 business days. \
    Updates may be provided automatically or require manual installation. You are responsible for maintaining current versions and implementing security updates promptly.",
  },
  {
    id: "termination",
    title: "10. TERMINATION AND POST-TERMINATION OBLIGATIONS",
    content:
      "This Agreement remains effective until terminated by either party. You may terminate at any time by: \
    (a) providing 30 days written notice; \
    (b) ceasing all use of the {PRODUCT_TYPE}; \
    (c) destroying or deleting all copies in your possession or control. \
    {PROVIDER_NAME} may terminate immediately upon: \
    (i) material breach of this Agreement that remains uncured for 15 days after written notice; \
    (ii) insolvency, bankruptcy, or assignment for creditors; \
    (iii) violation of intellectual property rights; \
    (iv) use for illegal purposes; \
    (v) non-payment of fees beyond 30 days after due date. \
    Upon termination: \
    (A) all rights and licenses granted hereunder immediately cease; \
    (B) you must cease all use and destroy all copies of the {PRODUCT_TYPE}; \
    (C) we may immediately disable access to online services; \
    (D) each party must return or destroy confidential information of the other party; \
    (E) accrued payment obligations survive termination. \
    For subscription services, termination does not entitle you to refunds except as required by law.",
  },
  {
    id: "governing-law",
    title: "11. GOVERNING LAW, JURISDICTION, AND DISPUTE RESOLUTION",
    content:
      "This Agreement is governed by and construed in accordance with the laws of {TERRITORY}, without regard to conflict of law principles. \
    Any dispute arising from or relating to this Agreement shall be subject to the exclusive jurisdiction of the courts of {TERRITORY}, and each party \
    irrevocably consents to such jurisdiction and venue. The parties acknowledge the application of the Australian Consumer Law where applicable. \
    Before commencing formal proceedings, the parties agree to attempt good faith negotiations for 30 days after written notice of dispute. If unresolved, \
    disputes may be referred to mediation through the Australian Disputes Centre or similar recognized mediation service, with costs shared equally. \
    For claims under AUD $40,000, either party may elect binding arbitration under the Commercial Arbitration Act. The United Nations Convention on Contracts for \
    the International Sale of Goods does not apply to this Agreement. If any provision is held invalid or unenforceable, the remainder shall remain in full force and \
    effect, and the invalid provision shall be deemed modified to the minimum extent necessary to make it enforceable. This Agreement constitutes the entire agreement \
    between the parties and supersedes all prior negotiations, representations, or agreements relating to the subject matter herein. Amendments must be in writing and \
    signed by both parties. Waiver of any breach does not waive subsequent breaches. Headings are for convenience only and do not affect interpretation.",
  },
];

// Helper: determine enumeration type
function getEnumType(marker: string) {
  const m = marker.toLowerCase();
  // Roman only when clearly multi-character
  if (/^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/.test(m)) return "roman";
  if (/^[a-z]$/.test(m)) return "alpha";
  if (/^[a-z]+$/.test(m)) return "alpha";
  return "decimal";
}

// Split the content into text and list segments, matching any alphabetical marker
function splitTextIntoSegments(text: string) {
  // Match markers like (a), (b), (i), (ii), (j), (k), (1), (2) …
  const itemRegex = /\(\s*([a-z]+|[1-9]|10)\s*\)\s*([^;.\n]+)\s*(?:[;.]?\s*)/gi;

  const segments: any[] = [];
  let lastIndex = 0;
  let currentList: any[] = [];
  let currentType: string | null = null;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(text)) !== null) {
    const marker = match[1].toLowerCase();
    const itemText = match[2].trim();
    const markerType = getEnumType(marker);
    const start = match.index;

    // Emit preceding text if any
    if (start > lastIndex) {
      const before = text.slice(lastIndex, start).replace(/\s+/g, " ").trim();
      if (before) {
        if (currentList.length) {
          segments.push({
            type: "list",
            listType: currentType,
            items: currentList,
          });
          currentList = [];
          currentType = null;
        }
        segments.push({ type: "text", content: before });
      }
    }

    // Start or continue a list
    // if (!currentType) {
    //   currentType = markerType;
    // } else if (currentType !== markerType) {
    //   // Flush the previous list
    //   segments.push({
    //     type: "list",
    //     listType: currentType,
    //     items: currentList,
    //   });
    //   currentList = [];
    //   currentType = markerType;
    // }
    currentList.push({ marker, text: itemText });
    lastIndex = itemRegex.lastIndex;
  }

  // Flush the final list and any trailing text
  if (currentList.length)
    segments.push({ type: "list", listType: currentType, items: currentList });
  if (lastIndex < text.length) {
    const tail = text.slice(lastIndex).replace(/\s+/g, " ").trim();
    if (tail) segments.push({ type: "text", content: tail });
  }

  return segments;
}

export default function EulaGenerator() {
  const [sections, setSections] = useState<EulaSection[]>(defaultSections);
  const [variables, setVariables] = useState<EulaVariables>({
    // Provider Details
    providerName: "",
    providerABN: "",
    providerAddress: "",
    providerEmail: "",
    providerPhone: "",
    providerWebsite: "",

    // Product/Service Details
    productName: "",
    productType: "",
    version: "",
    description: "",

    // Recipient Details
    recipientName: "",
    recipientAddress: "",
    recipientEmail: "",

    // Agreement Details
    licenseDate: "",
    authorizedUse: "",
    country: "",
    state: "",
  });
  const [showVariables, setShowVariables] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempContent, setTempContent] = useState("");
  const [tempTitle, setTempTitle] = useState("");

  const replacePlaceholders = useCallback(
    (content: string) => {
      const territory = [variables.state, variables.country]
        .filter(Boolean)
        .join(", ");
      return content
        .replace(/\{PROVIDER_NAME\}/g, variables.providerName || "")
        .replace(/\{PROVIDER_ABN\}/g, variables.providerABN || "")
        .replace(/\{PROVIDER_ADDRESS\}/g, variables.providerAddress || "")
        .replace(/\{PROVIDER_EMAIL\}/g, variables.providerEmail || "")
        .replace(/\{PROVIDER_PHONE\}/g, variables.providerPhone || "")
        .replace(/\{PROVIDER_WEBSITE\}/g, variables.providerWebsite || "")
        .replace(/\{PRODUCT_NAME\}/g, variables.productName || "")
        .replace(/\{PRODUCT_TYPE\}/g, variables.productType || "")
        .replace(/\{VERSION\}/g, variables.version || "")
        .replace(/\{DESCRIPTION\}/g, variables.description || "")
        .replace(/\{RECIPIENT_NAME\}/g, variables.recipientName || "")
        .replace(/\{RECIPIENT_ADDRESS\}/g, variables.recipientAddress || "")
        .replace(/\{RECIPIENT_EMAIL\}/g, variables.recipientEmail || "")
        .replace(
          /\{LICENSE_DATE\}/g,
          variables.licenseDate
            ? format(new Date(variables.licenseDate), "PPP")
            : ""
        )
        .replace(/\{AUTHORIZED_USE\}/g, variables.authorizedUse || "")
        .replace(/\{TERRITORY\}/g, territory)
        .replace(/\{COUNTRY\}/g, variables.country || "")
        .replace(/\{STATE\}/g, variables.state || "");
    },
    [variables]
  );

  // Existing helper extractEnumerations remains unchanged

  // Dropdown data
  const countryOptions = [
    "Australia",
    "United States",
    "Canada",
    "United Kingdom",
    "India",
    "New Zealand",
    "Singapore",
  ];

  const statesByCountry: Record<string, string[]> = {
    Australia: [
      "Australian Capital Territory",
      "New South Wales",
      "Northern Territory",
      "Queensland",
      "South Australia",
      "Tasmania",
      "Victoria",
      "Western Australia",
    ],
    "United States": [
      "Alabama",
      "Alaska",
      "Arizona",
      "California",
      "Florida",
      "New York",
      "Texas",
      "Washington",
    ],
    Canada: [
      "Alberta",
      "British Columbia",
      "Manitoba",
      "New Brunswick",
      "Newfoundland and Labrador",
      "Nova Scotia",
      "Ontario",
      "Quebec",
    ],
    India: [
      "Andhra Pradesh",
      "Delhi",
      "Gujarat",
      "Karnataka",
      "Maharashtra",
      "Tamil Nadu",
      "Telangana",
      "Uttar Pradesh",
    ],
    "United Kingdom": ["England", "Northern Ireland", "Scotland", "Wales"],
    "New Zealand": ["Auckland", "Canterbury", "Wellington", "Otago"],
    Singapore: ["Singapore"],
  };

  const authorizedUseOptions = [
    "Internal business use",
    "Personal use",
    "Evaluation / Trial",
    "Education / Academic",
    "Non-commercial use",
    "Commercial SaaS provisioning",
    "OEM / Embedding",
    "Government use",
    "Custom...",
  ];

  const startEditing = (section: EulaSection) => {
    setEditingSection(section.id);
    setTempContent(section.content);
    setTempTitle(section.title);
  };

  const saveSection = () => {
    if (!editingSection) return;

    setSections((prev) =>
      prev.map((section) =>
        section.id === editingSection
          ? { ...section, title: tempTitle, content: tempContent }
          : section
      )
    );
    setEditingSection(null);
    setTempContent("");
    setTempTitle("");
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setTempContent("");
    setTempTitle("");
  };

  const addCustomSection = (afterSectionId?: string) => {
    const newSection: EulaSection = {
      id: `custom-${Date.now()}`,
      title: "New Custom Section",
      content: "Enter your custom clause content here...",
      isCustom: true,
    };

    if (afterSectionId) {
      const index = sections.findIndex((s) => s.id === afterSectionId);
      setSections((prev) => [
        ...prev.slice(0, index + 1),
        newSection,
        ...prev.slice(index + 1),
      ]);
    } else {
      setSections((prev) => [...prev, newSection]);
    }
  };

  const deleteSection = (sectionId: string) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
  };

  const generatePDF = () => {
    const pdf = new jsPDF();

    // Page metrics
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20; // mm
    const usableWidth = pageWidth - margin * 2;
    const lineHeight = 6; // mm

    let y = margin;

    // Document metadata
    pdf.setProperties({
      title: `${variables.productName} EULA`,
      subject: `End User License Agreement for ${variables.productName}`,
      author: variables.providerName,
      creator: variables.providerWebsite || variables.providerName,
    });

    // Helpers for pagination
    const addPageIfNeeded = (heightNeeded = lineHeight) => {
      if (y + heightNeeded > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
    };

    const writeHeading = (text: string, size = 13) => {
      addPageIfNeeded(lineHeight * 2);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(size);
      pdf.text(text, margin, y);
      y += lineHeight * 1.6;
    };

    const writeParagraph = (text: string, size = 11) => {
      const firstLineIndent = 0; // mm
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(size);

      // helper to wrap and justify
      const makeLines = (t: string, firstWidth: number, otherWidth: number) => {
        const words = t.split(/\s+/).filter(Boolean);
        const lines: string[] = [];
        let current = "";
        let currentLimit = firstWidth;

        const fits = (candidate: string, limit: number) =>
          pdf.getTextWidth(candidate) <= limit;

        words.forEach((w) => {
          const cand = current ? current + " " + w : w;
          if (fits(cand, currentLimit)) {
            current = cand;
          } else {
            if (current) lines.push(current);
            current = w;
            currentLimit = otherWidth;
          }
        });
        if (current) lines.push(current);
        return lines;
      };

      const drawJustified = (
        line: string,
        xStart: number,
        yPos: number,
        maxWidth: number,
        isLast: boolean
      ) => {
        if (isLast || !line.includes(" ")) {
          pdf.text(line, xStart, yPos);
          return;
        }
        const words = line.split(" ").filter(Boolean);
        const wordsWidth = words.reduce(
          (acc, w) => acc + pdf.getTextWidth(w),
          0
        );
        const gaps = words.length - 1;
        const extraPerGap = gaps > 0 ? (maxWidth - wordsWidth) / gaps : 0;
        let x = xStart;
        words.forEach((w, i) => {
          pdf.text(w, x, yPos);
          if (i < words.length - 1) {
            x += pdf.getTextWidth(w) + extraPerGap;
          }
        });
      };

      const firstWidth = usableWidth - firstLineIndent;
      const lines = makeLines(text, firstWidth, usableWidth);
      lines.forEach((line: string, idx: number) => {
        addPageIfNeeded();
        const x = margin + (idx === 0 ? firstLineIndent : 0);
        const widthForLine = idx === 0 ? firstWidth : usableWidth;
        const isLast = idx === lines.length - 1;
        drawJustified(line, x, y, widthForLine, isLast);
        y += lineHeight;
      });
      y += 2; // small paragraph spacing
    };

    const writeList = (items: string[], size = 11) => {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(size);
      const bulletIndent = 6; // mm
      items.forEach((item: string) => {
        addPageIfNeeded();
        const wrapped = pdf.splitTextToSize(item, usableWidth - bulletIndent);
        wrapped.forEach((line: string) => {
          const x = margin + bulletIndent;
          pdf.text(line, x, y);
          y += lineHeight;
        });
      });
      y += 2;
    };

    // Title block (first page)
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("END USER LICENSE AGREEMENT (EULA)", pageWidth / 2, y, {
      align: "center",
    });
    y += lineHeight * 2.2;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    if (variables.productName)
      writeParagraph(`Service: ${variables.productName}`);
    if (variables.providerName)
      writeParagraph(`Provider: ${variables.providerName}`);
    if (variables.providerEmail)
      writeParagraph(`Email: ${variables.providerEmail}`);
    if (variables.licenseDate)
      writeParagraph(
        `Effective Date: ${format(new Date(variables.licenseDate), "PPP")}`
      );

    y += 2;

    // Loop through each section and render its segments
    sections.forEach((section) => {
      const processedContent = replacePlaceholders(section.content);

      // Ensure title and text stay together
      addPageIfNeeded(lineHeight * 4);
      writeHeading(section.title);

      const segs = splitTextIntoSegments(processedContent);
      segs.forEach((seg) => {
        if (seg.type === "text") {
          writeParagraph(seg.content!);
        } else {
          // Build list items with original markers
          const formatted = seg.items!.map((it) => {
            const marker = it.marker.toLowerCase();
            return `(${marker}) ${it.text}`;
          });
          writeList(formatted);
        }
      });
    });

    // Signature block
    addPageIfNeeded(lineHeight * 10);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Signatures", margin, y);
    y += lineHeight * 1.5;

    const colGap = 10;
    const colWidth = (usableWidth - colGap) / 2;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    // Left column - Licensee
    pdf.text("Licensee (Recipient):", margin, y);
    y += lineHeight;
    pdf.text(`Name: ${variables.recipientName}`, margin, y);
    y += lineHeight * 1.2;
    pdf.line(margin, y, margin + colWidth, y);
    pdf.text("Signature", margin, y + 5);

    // Right column - Provider
    const rightX = margin + colWidth + colGap;
    let rightY = y - lineHeight * 2.2;
    pdf.text("Provider (Licensor):", rightX, rightY);
    rightY += lineHeight;
    pdf.text(`Name: ${variables.providerName}`, rightX, rightY);
    rightY += lineHeight * 1.2;
    pdf.line(rightX, rightY, rightX + colWidth, rightY);
    pdf.text("Signature", rightX, rightY + 5);

    // Dates
    y += lineHeight * 2.5;
    addPageIfNeeded(lineHeight * 2);
    pdf.text(
      `Agreement Date: ${
        variables.licenseDate
          ? format(new Date(variables.licenseDate), "PPP")
          : "_______________________________"
      }`,
      margin,
      y
    );

    // Header and footer for pages after the first
    const pageCount = pdf.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("End User License Agreement", pageWidth / 2, 10, {
        align: "center",
      });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      if (variables.providerName) {
        pdf.text(variables.providerName, margin, pageHeight - 10);
      }
      const footerText = `Page ${i} of ${pageCount}`;
      pdf.text(footerText, pageWidth / 2, pageHeight - 10, {
        align: "center",
      });
      if (variables.providerEmail) {
        pdf.text(variables.providerEmail, pageWidth/2 + 40, pageHeight - 10);
      }
    }

    pdf.save(`${variables.productName}_EULA.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-document">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">EULA Generator</h1>
              <p className="text-sm text-muted-foreground">
                Create professional license agreements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVariables(!showVariables)}
              className="gap-2"
            >
              {showVariables ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Variables
            </Button>
            <Button onClick={generatePDF} className="gap-2 bg-gradient-primary">
              <Download className="h-4 w-4" />
              Generate PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Variables Sidebar */}
        {showVariables && (
          <div className="w-80 border-r bg-sidebar p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-sidebar-foreground mb-4">
                  Document Variables
                </h2>
                <div className="space-y-6">
                  {/* Provider Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-sidebar-foreground border-b pb-1">
                      Provider Details
                    </h3>
                    <div>
                      <Label htmlFor="providerName">Provider Name</Label>
                      <Input
                        id="providerName"
                        value={variables.providerName}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            providerName: e.target.value,
                          }))
                        }
                        className="mt-1"
                        placeholder="Enter provider name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="providerABN">ABN</Label>
                      <Input
                        id="providerABN"
                        value={variables.providerABN}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            providerABN: e.target.value,
                          }))
                        }
                        className="mt-1"
                        placeholder="ABN (optional)"
                      />
                    </div>

                    <div>
                      <Label htmlFor="providerAddress">Provider Address</Label>
                      <Textarea
                        id="providerAddress"
                        value={variables.providerAddress}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            providerAddress: e.target.value,
                          }))
                        }
                        className="mt-1"
                        rows={2}
                        placeholder="Street, City, State, Postcode"
                      />
                    </div>

                    <div>
                      <Label htmlFor="providerEmail">Provider Email</Label>
                      <Input
                        id="providerEmail"
                        type="email"
                        value={variables.providerEmail}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            providerEmail: e.target.value,
                          }))
                        }
                        className="mt-1"
                        placeholder="name@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="providerPhone">Provider Phone</Label>
                      <Input
                        id="providerPhone"
                        value={variables.providerPhone}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            providerPhone: e.target.value,
                          }))
                        }
                        className="mt-1"
                        placeholder="+61 4xx xxx xxx"
                      />
                    </div>

                    <div>
                      <Label htmlFor="providerWebsite">Provider Website</Label>
                      <Input
                        id="providerWebsite"
                        value={variables.providerWebsite}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            providerWebsite: e.target.value,
                          }))
                        }
                        className="mt-1"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  {/* Product/Service Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-sidebar-foreground border-b pb-1">
                      Product/Service Details
                    </h3>
                    <div>
                      <Label htmlFor="productName">Product/Service Name</Label>
                      <Input
                        id="productName"
                        value={variables.productName}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            productName: e.target.value,
                          }))
                        }
                        className="mt-1"
                        placeholder="Service or product name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="productType">Type</Label>
                      <select
                        id="productType"
                        value={variables.productType}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            productType: e.target.value as any,
                          }))
                        }
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 z-50 relative"
                      >
                        <option value="" disabled>
                          Select type
                        </option>
                        <option value="Software">Software</option>
                        <option value="Service">Service</option>
                        <option value="Hardware">Hardware</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={variables.version}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            version: e.target.value,
                          }))
                        }
                        className="mt-1"
                        placeholder="e.g., 1.0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={variables.description}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="mt-1"
                        rows={2}
                        placeholder="Brief description of the service/product"
                      />
                    </div>
                  </div>

                  {/* Recipient Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-sidebar-foreground border-b pb-1">
                      Recipient Details
                    </h3>
                    <div>
                      <Label htmlFor="recipientName">Recipient Name</Label>
                      <Input
                        id="recipientName"
                        value={variables.recipientName}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            recipientName: e.target.value,
                          }))
                        }
                        className="mt-1"
                        placeholder="Recipient or client name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="recipientAddress">
                        Recipient Address
                      </Label>
                      <Textarea
                        id="recipientAddress"
                        value={variables.recipientAddress}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            recipientAddress: e.target.value,
                          }))
                        }
                        className="mt-1"
                        rows={2}
                        placeholder="Recipient address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="recipientEmail">Recipient Email</Label>
                      <Input
                        id="recipientEmail"
                        type="email"
                        value={variables.recipientEmail}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            recipientEmail: e.target.value,
                          }))
                        }
                        className="mt-1"
                        placeholder="client@example.com"
                      />
                    </div>
                  </div>

                  {/* Agreement Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-sidebar-foreground border-b pb-1">
                      Agreement Details
                    </h3>
                    <div>
                      <Label htmlFor="licenseDate">License Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="mt-1 w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {variables.licenseDate ? (
                              format(new Date(variables.licenseDate), "PPP")
                            ) : (
                              <span>Select a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              variables.licenseDate
                                ? new Date(variables.licenseDate)
                                : undefined
                            }
                            onSelect={(date: Date | undefined) => {
                              setVariables((prev) => ({
                                ...prev,
                                licenseDate: date
                                  ? format(date, "yyyy-MM-dd")
                                  : "",
                              }));
                            }}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="authorizedUse">Authorized Use</Label>
                      <select
                        id="authorizedUse"
                        value={variables.authorizedUse}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            authorizedUse: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 z-50 relative"
                      >
                        <option value="" disabled>
                          Select authorized use
                        </option>
                        {authorizedUseOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <select
                        id="country"
                        value={variables.country}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            country: e.target.value,
                            state: "",
                          }))
                        }
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 z-50 relative"
                      >
                        <option value="" disabled>
                          Select country
                        </option>
                        {countryOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="state">State</Label>
                      <select
                        id="state"
                        value={variables.state}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                        disabled={!variables.country}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 z-50 relative"
                      >
                        <option value="" disabled>
                          {variables.country
                            ? "Select state"
                            : "Select country first"}
                        </option>
                        {(statesByCountry[variables.country] || []).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-4xl mx-auto p-6">
            {/* Document Header */}
            <Card className="p-8 mb-6 shadow-document bg-document border-document-border">
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-document-foreground">
                  END USER LICENSE AGREEMENT (EULA)
                </h1>
                <div className="text-lg space-y-1 text-justify">
                  {variables.productName && (
                    <p className="indent-8">
                      <strong>Service:</strong> {variables.productName}
                    </p>
                  )}
                  {variables.providerName && (
                    <p className="indent-8">
                      {variables.providerName && (
                        <>
                          <strong>Provider:</strong> {variables.providerName}
                        </>
                      )}
                    </p>
                  )}
                  {variables.providerEmail && (
                    <p className="indent-8">
                      <strong>Email:</strong> {variables.providerEmail}
                    </p>
                  )}
                  {variables.licenseDate && (
                    <p className="indent-8">
                      <strong>Effective Date:</strong>{" "}
                      {format(new Date(variables.licenseDate), "PPP")}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => (
                <div key={section.id}>
                  <Card className="p-6 shadow-card bg-document border-document-border">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {editingSection === section.id ? (
                          <Input
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            className="text-xl font-semibold mb-4"
                          />
                        ) : (
                          <h2 className="text-xl font-semibold text-document-foreground">
                            {section.title}
                          </h2>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {section.isCustom && (
                          <Badge variant="secondary" className="text-xs">
                            Custom
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            editingSection === section.id
                              ? cancelEditing()
                              : startEditing(section)
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        {section.isCustom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSection(section.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            x
                          </Button>
                        )}
                      </div>
                    </div>

                    {editingSection === section.id ? (
                      <div className="space-y-4">
                        <Textarea
                          value={tempContent}
                          onChange={(e) => setTempContent(e.target.value)}
                          rows={6}
                          className="text-base leading-relaxed"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEditing}
                          >
                            Cancel
                          </Button>
                          <Button size="sm" onClick={saveSection}>
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(() => {
                          const processed = replacePlaceholders(
                            section.content
                          );
                          const segs = splitTextIntoSegments(processed);
                          return segs.map((seg, idx) =>
                            seg.type === "text" ? (
                              // No indent on plain text
                              <p
                                key={idx}
                                className="text-base leading-relaxed text-document-foreground text-justify"
                              >
                                {seg.content}
                              </p>
                            ) : (
                              // Render each list item manually to ensure markers appear, including j/k
                              <ul key={idx} className="pl-6 space-y-1">
                                {seg.items.map((it, i) => {
                                  const isNumeric = seg.listType === "decimal";
                                  const prefix = isNumeric
                                    ? `${i + 1}.`
                                    : `(${it.marker.toLowerCase()})`;
                                  return (
                                    <li key={i} className="flex">
                                      <span className="mr-2">{prefix}</span>
                                      <span>{it.text}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            )
                          );
                        })()}
                      </div>
                    )}
                  </Card>

                  {/* Add Section Button */}
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addCustomSection(section.id)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Section After
                    </Button>
                  </div>

                  {index < sections.length - 1 && (
                    <Separator className="my-8" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <Card className="p-8 mt-8 shadow-document bg-document border-document-border">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-document-foreground">
                  Agreement Acceptance
                </h3>
                <div className="space-y-4">
                  <p className="text-document-foreground text-left indent-8">
                    By clicking "I Agree" or by installing, copying, or using
                    the Software, you acknowledge that you have read this
                    Agreement and agree to be bound by its terms.
                  </p>

                  <div className="border-t flex justify-between">
                    <div className="pt-4">
                      <p className="font-medium text-document-foreground">
                        Provider Name: {variables.providerName}
                      </p>
                      <p className="font-medium text-document-foreground">
                        Provider Signature: _________________________________
                      </p>
                    </div>
                    <div className="pt-4">
                      <p className="font-medium text-document-foreground">
                        Licensee Name: {variables.recipientName}
                      </p>
                      <p className="font-medium text-document-foreground">
                        Licensee Signature: _________________________________
                      </p>
                    </div>
                  </div>

                  <p className="font-medium text-document-foreground mt-2">
                    Date:{" "}
                    {variables.licenseDate
                      ? format(new Date(variables.licenseDate), "PPP")
                      : "_______________________________"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
