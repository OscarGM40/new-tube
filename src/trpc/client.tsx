"use client";

import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

let clientQueryClientSingleton: QueryClient;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  //nullish coalescing assignment(??=, this operator only evaluates the right operand and assigns to the left it the left operand is nullish, that is, null or undefined)
  // x ??= y is the same as (x ?? (x = y), pero la expression x es evaluada solo una vez)
  /*  es útil para aplicar valores por defecto a propiedades de objetos (pero yo diría que es para extender propiedades??)
  function config(options){
    options.duration ??= 100;
    options.speed ??= 25;
    return options; 
  }
    config({duration: 125}) // duration: 125, speed: 25
    config({}) // duration: 100, speed 25
    Fijate que el operador ??, que es el operador nullish coalescing operator no es el operador ??=, que es el nullish coalescing assignment
    La diferencia es que el operador retorna el lado derecho si el izdo es nullish, y el asigment asigna al lado izdo si es nullish el valor del derecho
   */
  return (clientQueryClientSingleton ??= makeQueryClient());
}

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") {
      return "";
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return "http://localhost:3000";
  })();
  return `${base}/api/trpc`;
}

export function TRPCProvider(props: Readonly<{ children: React.ReactNode }>) {
  
  const queryClient = getQueryClient();
  
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
          async headers(){
            // Author says that this header can improve login speed
            // la clase Headers es de la API fetch, tengo visión global sobre ella y obviamente es un Set
            const headers = new Headers();
            headers.set("x-trpc-source",'nextjs-react')
            return headers;
          }
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
    </trpc.Provider>
  );
}
