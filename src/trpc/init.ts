import { db } from "@/db";
import { users } from "@/db/schema";
import { ratelimit } from "@/lib/ratelimit";
import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import superjson from "superjson";

// el contexto se va a ejecutar en cada procedure, por eso
export const createTRPCContext = cache(async () => {
  // the auth() helper only works on the server-side
  const { userId } = await auth();
  await new Promise((resolve) => setTimeout(resolve, 500));

  // see: https://trpc.io/docs/server/context
  return { clerkUserId: userId };
});
//ReturnType<typeof function> devuelve el tipo del return de una function y como es una Promise hay que usar Awaited.Top
// Si es un método de clase en vez de una función debo hacer ReturnType<typeof Class.prototype.method>
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
const t = initTRPC.context<Context>().create({
  // see: https://trpc.io/docs/server/data-transformers
  transformer: superjson,
});
// export base router and procedure helper functions
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
//
export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const { ctx } = opts;
  /*   if (!ctx.clerkUserId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  } */
  //drizzle ORM no tiene selectOne, siempre va a devolver una Collection
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, ctx.clerkUserId as string));
  /*   if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  } */
  const { success } = await ratelimit.limit(user.id);
  if (!success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
    });
  }
  return opts.next({
    ctx: {
      ...ctx,
      user,
    },
  });
});
