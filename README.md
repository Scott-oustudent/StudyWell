<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1nWEC7ynXVXtidQqL0R2wd-5_jjMtv4Nd

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

Additional local services

Supabase (optional):

- Create a Supabase project and add a table schema for `users`, `notes`, `events`, and `chatMessages` (simple JSON fields are fine for prototyping).
- Create a `.env.local` with the following entries (or use `.env`):
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

PayPal server (for secure order creation/capture):

- Install server dependencies and run the server:

```powershell
cd server; npm install; npm start
```

- Copy `.env.example` to `server/.env` and set `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET`. For sandbox testing use PayPal sandbox credentials and keep `PAYPAL_BASE` pointing to the sandbox API.

- The frontend component `modals/PayPalModal.tsx` will call `/api/paypal/create-order` and `/api/paypal/capture-order`. When running the server locally, run the frontend with a proxy or use Vite's `server.proxy` to forward `/api` to `http://localhost:4000`.

Payments table suggestion (Supabase)

If you enable Supabase persistence, create a `payments` table with fields similar to:

| column | type |
|---|---|
| id | uuid (primary) |
| order_id | text |
| user_email | text |
| amount | numeric |
| currency | text |
| capture_response | jsonb |
| created_at | timestamptz |

The server will insert payment captures into this table when `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set in `server/.env`.

Server-side validation

The server checks the order amount and currency against `SUBSCRIPTION_PRICE` and `SUBSCRIPTION_CURRENCY` env vars before capturing to help prevent client-side tampering. Adjust these values in your `server/.env` for your pricing.

Email confirmation for new signups

To require users to confirm their email on signup, configure SMTP in `server/.env` and set `APP_BASE_URL` to your frontend URL. The server exposes:

- POST `/api/auth/register` — accepts { email, username, password, institution } and sends a confirmation email with a tokenized link.
- GET `/api/auth/confirm?token=...` — consumes the token and inserts the user record (or you can enhance this to redirect to a frontend success page).

If SMTP is not configured, the register endpoint returns a token in the response (dev fallback) which you can visit with `/api/auth/confirm?token=...` to manually confirm.



