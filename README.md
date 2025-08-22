# EULA Generator — Detailed README

## Overview

**EULA Generator** is a React-based tool for creating customizable, professional End User License Agreements tailored to Australian law and global requirements. It allows users to input company, product, licensee, and agreement details, dynamically generating document sections. Users can edit predefined sections, add custom clauses, preview the agreement, and export the final EULA as a well-formatted PDF.

***

## Features

- **Dynamic EULA Creation:** Easily define variables for provider, product, licensee, and jurisdiction details.
- **Predefined Sections:** Covers standard legal requirements: parties, license grant, restrictions, IP, consumer law, privacy, warranty, support, termination, governance.
- **Custom Sections:** Add, edit, or remove custom clauses specific to your agreement.
- **Interactive UI:** Sidebar variable inputs and main document view with live preview and edit support.
- **Smart Formatting:** Automated enumeration recognition for lists (e.g., (a), (i)), proper formatting for legal text.
- **PDF Export:** Generate a professional EULA PDF including signature blocks and document metadata.
- **Australian Law Support:** Includes references to Australian Consumer Law, Privacy Act, and territory-specific jurisdiction options.
- **International Support:** Country/state dropdowns support major jurisdictions.
- **Acceptance Clause:** Includes "I Agree" clause suitable for digital acceptance.

***

## Installation

1. **Clone the Repository**

```bash
git clone https://github.com/your-org/eula-generator.git
cd eula-generator
```

2. **Install Dependencies**

```bash
npm install
```

or

```bash
yarn install
```


***

## Usage

1. **Start the Development Server**

```bash
npm run dev
```

or

```bash
yarn dev
```

2. **Open in Browser**

Navigate to `http://localhost:3000` (or the printed port).

***

## How It Works

### 1. Input Variables

- Provider, product/service, and licensee data are entered via sidebar form controls.
- Supported fields:
    - Provider (name, ABN, address, email, phone, website)
    - Product/service (name, type, version, description)
    - Licensee (name, address, email)
    - Agreement details (effective date, authorized use, country, state)


### 2. Document Sections

- Sections are defined in the `defaultSections` array (see source).
- Each section contains:
    - **Title** (e.g., "INTELLECTUAL PROPERTY RIGHTS AND OWNERSHIP")
    - **Content** with placeholders like `{PROVIDER_NAME}`, `{PRODUCT_TYPE}`, automatically replaced via variable values


### 3. Editing and Customization

- Click the edit icon (✎) to change section titles or content.
- Add custom sections after any existing clause.
- Remove custom sections when desired.


### 4. Formatting and Enumeration

- Text and lists are parsed for legal enumeration (e.g., (a), (b), (i), (ii)) for authentic legal formatting.
- Uses helper functions for enumeration type detection and segment splitting.


### 5. PDF Export

- Click **Generate PDF** to export the complete EULA.
- PDF metadata is populated with agreement details (title, provider, subject).
- Each section is rendered with headings and paragraphs, including enumerated lists.
- Signature blocks for both Provider and Licensee.
- Footer on every page after the first with document name, provider, and page numbers.

***

## Customization

- **Clause Logic:** Modify `defaultSections` in the code to adjust, add, or remove standard sections.
- **Country/State Options:** Edit the `countryOptions` and `statesByCountry` objects to support additional jurisdictions.
- **Authorized Uses:** Customize `authorizedUseOptions` for different license types.

***

## Main Components \& Logic

1. **EulaGenerator (Root Component):**
    - Manages state: variables, sections, edit mode
    - Handles placeholder replacement
    - UI for sidebar variables and main document
2. **PDF Generation (`generatePDF`):**
    - Uses [jsPDF library](https://github.com/parallax/jsPDF)
    - Handles pagination, headings, justified text, bullets, and signature panel
    - Sets metadata: author, title, subject, creator
3. **Placeholder Replacement:**
    - Replaces all content `{PLACEHOLDER}` tags with variable values (see `replacePlaceholders` helper)
4. **Legal Enumeration Parsing:**
    - Detects and format list markers to match legal standards
5. **UI Components:**
    - Uses custom-styled UI (Button, Card, Input, Label, Textarea, Badge, Popover, Calendar, Separator)
    - Layout: Sidebar for inputs, main area for document preview and edits

***

## Adding New Clauses

1. Click "Add Section After" below any existing clause.
2. Enter your custom title and content.
3. Save changes.

***

## PDF Export Details

- Automatically adjusts for page size, margins, and section spacing.
- Headings in bold, main content justified.
- Bullet points handle legal enumeration standards.
- Signature blocks for both parties on final page.
- Footer with page numbers for legal use.

***

## Example Supported Variables

| Variable | Example Value |
| :-- | :-- |
| Provider Name | Acme Solutions Pty Ltd |
| Provider ABN | 61 123 456 789 |
| Provider Address | 123 King St, Sydney, NSW |
| Provider Email | support@acme.com |
| Provider Phone | +61 4xx xxx xxx |
| Provider Website | https://acme.com |
| Product Name | AcmeCRM |
| Product Type | Software |
| Version | 3.1 |
| Description | Customer management system |
| Recipient Name | John Doe |
| Recipient Address | 45 Main Rd, Melbourne, VIC |
| Recipient Email | john.doe@email.com |
| License Date | 2025-08-22 |
| Authorized Use | Internal business use |
| Country | Australia |
| State | Victoria |


***

## FAQ

### Can I add my own clauses?

**Yes!** Use "Add Section After" below any existing section.

### Does the PDF include signatures?

It includes signature lines for both Provider and Licensee.

### What jurisdictions are supported?

Australia, US, Canada, UK, Singapore, New Zealand, India – easily expandable.

### Can I change section order?

You can add new sections after any existing one, but rearranging standard sections requires editing the code.

### Does this generate a legally binding contract?

This tool generates formal legal text typical for EULAs. Final enforceability depends on local law and how parties accept/sign.

***

## Dependencies

- **React** (component logic and UI)
- **jsPDF** (PDF generation)
- **date-fns** (date formatting)
- **lucide-react** (icons)
- Custom UI components (Button, Card, etc.)

***

## Styling

- Uses Tailwind CSS utility classes or your preferred CSS framework for layout and theme.
- Gradient backgrounds, shadow effects, bold headings, and indented/justified legal text for professional document appearance.

***

## Accessibility

- Form labels and controls for all input fields
- Responsive layout with sidebar and main content

***

## License

This project is released under the MIT License. See `LICENSE.md` for terms.

***

## Contact / Support

For questions, bug reports, or to contribute, email the maintainer or open an issue on GitHub.

***

## Changelog

See `CHANGELOG.md` for detailed updates.

***

## Contribution

Pull requests are welcome. Please submit issues and suggestions via GitHub.

***

## Acknowledgements

Includes references and compliance with Australian Common Law principles, the Australian Consumer Law, Privacy Act, and common EULA best practices.

***

## Screenshots

*(Add screenshots of sidebar, main document preview, and PDF if desired)*

***

## Example Usage

### Step-by-step:

1. Fill out all details in the sidebar.
2. Edit existing or custom sections as required.
3. Review generated document.
4. Click **Generate PDF**.
5. Download and distribute your EULA.

***

## Troubleshooting

- **PDF not generating?** Check all required fields are filled.
- **Variable not replacing?** Ensure variable placeholders match exactly.
- **Custom section not saving?** Use the Save button after editing.

***

## Future Improvements

- Section reorder support.
- More localization options.
- Clause templates for common industries.
- Bulk PDF generation API.

***

**End of README**



