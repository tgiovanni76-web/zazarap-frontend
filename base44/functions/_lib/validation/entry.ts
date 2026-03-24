import { z } from 'npm:zod@3.24.2';

// Common schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128)
});

export const signupSchema = loginSchema.extend({ full_name: z.string().min(2).max(100) });

export const listingBase = {
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  price: z.number().nonnegative().max(1_000_000),
  category: z.string().min(2).max(50),
  city: z.string().min(2).max(80).optional(),
  images: z.array(z.string().url()).max(12).optional()
};
export const listingCreateSchema = z.object({ ...listingBase });
export const listingUpdateSchema = z.object({ id: z.string().uuid().optional(), ...listingBase }).partial({ title: true, description: true, price: true, category: true, city: true, images: true });

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(5000)
});

export const newsletterSchema = z.object({ email: z.string().email() });

export const createPayPalOrderSchema = z.object({
  amount: z.number().positive(),
  chatId: z.string().min(1),
  listingId: z.string().min(1)
});

export const capturePayPalOrderSchema = z.object({
  orderId: z.string().min(1),
  chatId: z.string().min(1),
  listingId: z.string().min(1),
  sellerId: z.string().min(1),
  shippingMethod: z.enum(['ritiro_persona', 'corriere', 'posta']),
  shippingAddress: z.string().optional()
});

export const uploadMetadataSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(3).max(100),
  size: z.number().int().nonnegative().max(20 * 1024 * 1024)
});

export const paypalWebhookSchema = z.object({
  id: z.string(),
  event_type: z.string(),
  resource: z.record(z.any())
}).passthrough();

export const sitemapParamsSchema = z.object({
  baseUrl: z.string().url().optional(),
  limit: z.number().int().min(1).max(5000).optional()
});

export const logEventSchema = z.object({
  level: z.enum(['info','warn','error']),
  message: z.string().min(1).max(500),
  details: z.string().max(10000).optional(),
  context: z.any().optional(),
});

export const perfBeaconSchema = z.object({
  metrics: z.object({
    path: z.string(),
    userAgent: z.string().optional(),
    viewport: z.any().optional(),
    connection: z.any().optional(),
    navigation: z.any().optional(),
    fcp: z.number().nullable().optional(),
    lcp: z.number().nullable().optional(),
    cls: z.number().nullable().optional()
  })
});

export function validationErrorResponse(errors) {
  const payload = { error: 'Ungültige Eingabedaten', details: errors };
  return new Response(JSON.stringify(payload), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}