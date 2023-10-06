import queryClient from "@/utils/getMillData";
import { PalmwatchMap } from "@/components/Map";
import { QueryProvider } from "@/components/QueryProvider";
import { MillInfo } from "@/components/MillInfo";
import { BrandInfoClient } from "@/components/BrandInfoClient";

export default async function Home() {
  await queryClient.init()
  const data = queryClient.stringifyBigInts(queryClient.getFullMillInfo().objects());
  return (
    <main className="relative flex flex-col items-center justify-center">
      <div className="bg-white/30 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto w-[90%] h-[60vh] relative">
        <QueryProvider>
          <PalmwatchMap
            geoDataUrl="/data/mill-catchment.geojson"
            dataTable={data!}
            geoIdColumn="UML ID"
            dataIdColumn="UML ID"
            choroplethColumn="treeloss_km_2022"
            choroplethScheme="forestLoss"
          />
          <div className="p-4 flex flex-row space-x-4">
            <MillInfo />
            <BrandInfoClient />
          </div>
        </QueryProvider>
      </div>
      {/* <div className="w-full px-20 py-10 flex justify-between">
        <p>
          Built by UChicago{" "}
          <Link
            href="https://datascience.uchicago.edu/"
            className="font-medium underline underline-offset-4 hover:text-black transition-colors"
          >
            DSI
          </Link>{" "}
          in partnership with{" "}
          <Link
            href="https://www.inclusivedevelopment.net/"
            className="font-medium underline underline-offset-4 hover:text-black transition-colors"
          >
            IDI
          </Link>
          .
        </p>
        <Link
          href="https://github.com/vercel/examples/tree/main/storage/blob-starter"
          className="flex items-center space-x-2"
        >
          <Image
            src="/github.svg"
            alt="GitHub Logo"
            width={24}
            height={24}
            priority
          />
          <p className="font-light">Source</p>
        </Link>
      </div> */}
    </main>
  );
}
