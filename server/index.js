import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(express.json());

const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_BASE = process.env.PAYPAL_BASE || 'https://api-m.sandbox.paypal.com';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// Setup nodemailer if SMTP env vars are present
let mailer = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

// Simple in-memory token store for dev (will be used when Supabase not configured)
const confirmationTokens = new Map();

// Helper: persist confirmation token to Supabase if configured
const persistConfirmationToken = async (token, payload) => {
  if (!supabase) return;
  try {
    // expiry in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('email_confirmations').insert([{ token, email: payload.email, username: payload.username, password_hash: payload.passwordHash, institution: payload.institution, expires_at: expiresAt }]);
    // audit log
    try { await supabase.from('audit_logs').insert([{ action: 'auth.register', actor: payload.email, details: { token }, timestamp: new Date().toISOString() }]); } catch (e) { console.error('Failed to write audit for register', e); }
  } catch (err) {
    console.error('Failed to persist confirmation token to Supabase', err);
  }
};

const consumeConfirmationToken = async (token) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('email_confirmations').select('*').eq('token', token).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    // delete token after reading
    await supabase.from('email_confirmations').delete().eq('token', token);
    return data;
  } catch (err) {
    console.error('Error consuming confirmation token from Supabase', err);
    return null;
  }
};

if (!PAYPAL_CLIENT || !PAYPAL_SECRET) {
  console.warn('PayPal credentials not set in environment. Set PAYPAL_CLIENT_ID and PAYPAL_SECRET');
}

const getAccessToken = async () => {
  const auth = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  const json = await res.json();
  return json.access_token;
};

app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const { amount = '1.00', currency = 'USD', userEmail } = req.body;
    const token = await getAccessToken();
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: currency, value: amount } }]
      })
    });
    const order = await orderRes.json();
    // We may want to associate a pending order with a user in Supabase here in the future.
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Register endpoint - generates confirmation token and (optionally) emails it
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password, institution } = req.body;
    const normalized = (email || '').toLowerCase();
    if (!normalized) return res.status(400).json({ error: 'email required' });
    // If Supabase configured, check users table
    if (supabase) {
      const { data: existing } = await supabase.from('users').select('email').eq('email', normalized).maybeSingle();
      if (existing) return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password before storing/transmitting
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    const token = crypto.randomBytes(20).toString('hex');

    const payload = { email: normalized, username, passwordHash, institution };

    if (supabase) {
      // persist token to Supabase
      await persistConfirmationToken(token, payload);
    } else {
      // keep dev in-memory fallback
      confirmationTokens.set(token, { ...payload, createdAt: Date.now() });
    }

    const confirmUrl = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/confirm-email?token=${token}`;

    if (mailer) {
      await mailer.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: normalized,
        subject: 'Confirm your StudyWell email',
        text: `Please confirm your email by clicking the link: ${confirmUrl}`,
        html: `Please confirm your email by clicking the link: <a href="${confirmUrl}">${confirmUrl}</a>`
      });
      return res.json({ ok: true, message: 'Confirmation email sent' });
    }

    // Dev fallback: return token so frontend can show it
    return res.json({ ok: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Confirm endpoint - consumes token and creates user
app.get('/api/auth/confirm', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send('Invalid or expired token');

    let payload = null;
    if (supabase) {
      // try to consume from Supabase
      payload = await consumeConfirmationToken(token);
    }
    if (!payload) {
      // fallback to in-memory
      if (!confirmationTokens.has(token)) return res.status(400).send('Invalid or expired token');
      payload = confirmationTokens.get(token);
      confirmationTokens.delete(token);
    }

    const newUser = {
      email: payload.email,
      username: payload.username,
      password: payload.passwordHash || null,
      institution: payload.institution,
      role: 'Student',
      subscription: { tier: 'Free' }
    };

    if (supabase) {
      // insert into users table
      await supabase.from('users').insert(newUser);
      try { await supabase.from('audit_logs').insert([{ action: 'auth.confirm', actor: newUser.email, details: { username: newUser.username }, timestamp: new Date().toISOString() }]); } catch (e) { console.error('Failed to write audit for confirm', e); }
    }

    return res.send('Email confirmed. You can now login.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderId, userEmail } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId required' });
    const token = await getAccessToken();

    // Validate order details before capture to protect against tampering.
    const orderDetailsRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const orderDetails = await orderDetailsRes.json();
    // expected amount (env or default)
    const EXPECTED_AMOUNT = process.env.SUBSCRIPTION_PRICE || '9.99';
    const EXPECTED_CURRENCY = process.env.SUBSCRIPTION_CURRENCY || 'GBP';
    const purchaseUnit = orderDetails.purchase_units && orderDetails.purchase_units[0];
    const amountValue = purchaseUnit && purchaseUnit.amount && purchaseUnit.amount.value;
    const currencyCode = purchaseUnit && purchaseUnit.amount && purchaseUnit.amount.currency_code;

    if (!amountValue || !currencyCode) {
      return res.status(400).json({ error: 'Invalid order details' });
    }
    if (amountValue !== EXPECTED_AMOUNT || currencyCode !== EXPECTED_CURRENCY) {
      console.error('Order amount/currency mismatch', { amountValue, currencyCode, EXPECTED_AMOUNT, EXPECTED_CURRENCY });
      return res.status(400).json({ error: 'Order amount or currency mismatch' });
    }

    const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const capture = await captureRes.json();
    // Optionally persist capture to Supabase
    if (supabase) {
      try {
        const record = {
          order_id: orderId,
          user_email: userEmail || null,
          amount: amountValue,
          currency: currencyCode,
          capture_response: capture,
          created_at: new Date().toISOString()
        };
        await supabase.from('payments').insert(record);
        try { await supabase.from('audit_logs').insert([{ action: 'payment.capture', actor: userEmail || null, details: { orderId, amount: amountValue, currency: currencyCode }, timestamp: new Date().toISOString() }]); } catch (e) { console.error('Failed to write audit for capture', e); }
        // If we have a user email, also upsert the user's subscription to Premium
        if (userEmail) {
          try {
            const expiry = new Date();
            expiry.setFullYear(expiry.getFullYear() + 1);
            await supabase.from('users').upsert({
              email: userEmail,
              subscription: {
                tier: 'Premium',
                startDate: new Date().toISOString(),
                endDate: expiry.toISOString()
              }
            }, { onConflict: ['email'] });
          } catch (err) {
            console.error('Failed to upsert user subscription', err);
          }
        }
      } catch (err) {
        console.error('Failed to save capture to Supabase', err);
      }
    }
    res.json(capture);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));
