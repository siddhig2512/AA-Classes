# AA Classes — Multi-page Website

## Pages
- index.html
- about.html
- courses.html
- study-material.html
- reviews.html
- contact.html
- admin/login.html
- admin/dashboard.html

## Admin features
- Supabase email/password login
- Upload PDF, DOC and DOCX only (max 8 MB)
- Delete study materials
- Review approval/rejection
- Delete reviews
- View enquiries
- Edit "Talk to Our Counsellors" contact details

## Setup
1. Create a Supabase project.
2. Create an Auth user with email/password for the admin.
3. Run `supabase_setup.sql` in Supabase SQL Editor.
4. Copy your Supabase publishable/anon key.
5. Replace `PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE` in:
   - `js/main.js`
   - `js/admin.js`
   - `admin/login.html`
6. If you want public file downloads, either make the `study-materials` bucket public in Supabase Storage or change `downloadMaterial()` to use signed URLs.
7. Open the folder in VS Code and use Live Server.

## Important security note
The browser must only contain the Supabase publishable/anon key, never the service-role key.
For a production deployment with multiple authenticated users, add an admin role/profile table and tighten authenticated RLS policies to admin users only.

## Student reviews
The visual student-review section is kept from the supplied AA Classes design. New reviews are inserted as `pending` and are shown publicly only after an admin changes them to `approved`.
