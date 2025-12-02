Now create frontend. 
Build a full working dynamic form rendering web application using **Next.js (v14, App Router)** and **shadcn/ui**.  
The form schema must be fetched from ** API**, and the form UI must be generated dynamically at runtime based on this schema.

=====================================================
🔹 SYSTEM REQUIREMENTS
=====================================================

1. TECHNOLOGIES:
   - Next.js 14 (App Router)
   - React Server Components + Client Components
   - TailwindCSS
   - shadcn/ui components
   - Axios or fetch for API calls
   - Zod for validation (optional but recommended)
   - TypeScript required

2. FORM DATA SOURCE:
  - Form schema must come from REST API django backend


3. Form render LOGIC
   - Detect field type from column .
   - Supported field types:
       - text, textarea
       - number
       - email
       - select (enum)
       - boolean (checkbox or switch)
       - date, datetime
       - multi-select
   - Render proper shadcn/ui component for each field.
   - Auto-generate:
       - label
       - placeholder
       - required state
       - descriptions
       - helper text (if included in schema)
       - display name for labeling inputs
       
4. FORM SUBMISSION:
   - On submit, POST data back to django:
   - Form must show:
       - Loading state
       - Success toast
       - Error toast

5. EXTRA:
   - Must include SSR + dynamic fetch (async Server Component)
   - Must include error boundary
   - Form must re-render automatically if schema changes in NocoDB
   - Code must be production-ready & clean.


👉 Provide full project code in file-by-file structure.  
👉 Include all TypeScript types + utilities.  
👉 Code must run “as-is” after npm install.  
👉 Include clear instructions for environment variables:

Generate all code now.
