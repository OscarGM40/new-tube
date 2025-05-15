// 1- import { trpc } from "@/trpc/server";
// 2 -import { trpc } from "@/trpc/server";
import { HomeView } from "@/modules/home/ui/views/home-view";
import { HydrateClient, trpc } from "@/trpc/server";

// Next siempre piensa que un file es estático,para decirle que es dinámico en los page.tsx hay que poner la siguiente sentencia
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ categoryId?: string }>;
}
const Page = async ({ searchParams }: PageProps) => {
  // 1 -const { data } = trpc.hello.useQuery({ text: "hello", age: 28 });
  // 2 - const data = await trpc.hello({text: 'Antonio', age: 45})
  // esta tercera forma es la que permite mayor interactividad, aunque pierda un poco de velocidad. NO quedó claro si tiene que ser asincrona la función. Ojo, este prefetch lo que hace es popular la caché que hay en el server side y luego el cliente solo tiene que acceder a esa data
  const { categoryId } = await searchParams;
  void trpc.categories.getMany.prefetch();

  return (
    // en donde hagamos un prefetch por consistencia le meteremos el HydrateClient
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
};

export default Page;
