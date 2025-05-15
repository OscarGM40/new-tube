// import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { Webhook } from "svix";
import { headers } from "next/headers";
import { UserJSON, WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Para crear controladores en Next el file se tiene que llamar route.ts, ojo esta ruta tiene que hacer match con el endpoint para el webhook (que usamos /api/users/webhook) luego tiene que estar aqui. Fijate que este controlador recoge la info que suelta el webhook, está escuchando
export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error("Error: Please add CLERK_SIGNING_SECRET from clerk dashboard ");
  }
  // Create new Svix instance with the token
  const wh = new Webhook(SIGNING_SECRET);

  //Get headers(hay que validar que la request venga de clerk realmente)
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out(no es clerk)
  if (!svix_id || !svix_signature || !svix_timestamp) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook: ", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }
  // if verification is successful continue obtaining the evt.type
  const data = evt.data as UserJSON; // now data will be of UserJSON type
  const eventType = evt.type;
  // if Clerk created a user we save it also in Neon
  if (eventType === "user.created") {
    const fullName = !data.last_name
      ? (data.first_name as string)
      : `${data.first_name} ${data.last_name}`;
    await db.insert(users).values({
      clerkId: data.id,
      name: fullName,
      imageUrl: data.image_url,
    });
  }

  if (eventType === "user.deleted") {
    if (!data.id) {
      return new Response("Missing user id", { status: 400 });
    }
    await db.delete(users).where(eq(users.clerkId, data.id));
  }

  if (eventType === "user.updated") {
    await db
      .update(users)
      .set({
        name: `${data.first_name} ${data.last_name}`,
        imageUrl: data.image_url,
      })
      .where(eq(users.clerkId, data.id));
  }
  return new Response("Webhook received", { status: 200 });
}
