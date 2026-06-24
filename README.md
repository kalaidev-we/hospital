# CareBridge React login

A responsive React email/password login page connected to Supabase Auth.

## Connect Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Enable Email in **Authentication → Providers**.
3. Copy the project URL and anon/public key from **Project Settings → API**.
4. Copy `.env.example` to `.env` and replace the placeholder values.
5. Install and start the app:

   ```powershell
   npm install
   npm run dev
   ```

6. Add the local Vite URL to **Authentication → URL Configuration → Redirect URLs** in Supabase.

The anon key is intended for browser use. Never expose a Supabase service-role key.
