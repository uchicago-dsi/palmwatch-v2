import queryClient from "@/utils/getMillData";
import { PalmwatchMap } from "@/components/Map";
import { QueryProvider } from "@/components/QueryProvider";
import { MillInfo } from "@/components/MillInfo";
import { BrandInfoClient } from "@/components/BrandInfoClient";
import Link from "next/link";
import { ScrollToButton } from "@/components/ScrollToButton";

export default async function Home() {
  await queryClient.init();
  const data = queryClient.stringifyBigInts(
    queryClient.getFullMillInfo().objects()
  );
  return (
    <main className="flex flex-col items-center justify-center h-auto">
      {/* fullheight hero div */}
      <section className="relative w-full h-[100vh] overflow-hidden bg-black">
        <video
          autoPlay
          muted
          loop
          className="absolute top-0 left-0 w-full h-full object-cover opacity-25"
        >
          <source src="cover-video.mp4" type="video/mp4"></source>
          {/* <source src="path/to/video.webm" type="video/webm"></source> */}
          {/* Your browser does not support the video tag. */}
        </video>
        <div className="relative z-[1] flex flex-col justify-center items-center h-full p-4 text-white">
          <h1 className="text-6xl font-bold">PalmWatch</h1>
          <h2 className="text-3xl">
            Explore the impact of palm oil production on deforestation
          </h2>
          <div className="flex flex-col space-y-4 mt-10 items-center">
            {/* search by consumer brand, mill, supplier, group */}
            <p>Explore by</p>
            <div className="flex flex-row space-x-4 mb-4">
              <Link className="btn btn-outline btn-info" href="/brand">
                Brands
              </Link>
              <Link className="btn btn-outline btn-info" href="/mill">
                Mills
              </Link>
              <Link className="btn btn-outline btn-info" href="/group">
                Groups
              </Link>
              <Link className="btn btn-outline btn-info" href="/supplier">
                Suppliers
              </Link>
            </div>
            {/* onclick scroll to #homepage-map div*/}
            <ScrollToButton
              className="btn btn-oultine btn-neutral mt-4"
              target="homepage-map"
            >
              Explore the map now
            </ScrollToButton>
          </div>
        </div>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.youtube.com/watch?v=YKJcN81mZgA"
          className="absolute bottom-1 right-1 text-white/50 text-xs z-[1]"
        >
          Cover Video by Sum Mayyah Channel | Creative Commons Attribution
        </a>
      </section>

      <section className="max-w-none w-full h-[100vh] flex flex-row bg-neutral-200 mb-4 prose space-x-4 justify-center items-center">
        <div className="flex max-w-[25%] p-4 h-[50vh] rounded-xl shadow-xl bg-neutral-100">
          <h3>How is palm oil produced?</h3>
        </div>
        <div className="flex max-w-[25%] p-4 h-[50vh] rounded-xl shadow-xl bg-neutral-100">
          <h3>Why is supply chain transparency important?</h3>
        </div>
        <div className="flex max-w-[25%] p-4 h-[50vh] rounded-xl shadow-xl bg-neutral-100">
          <h3>What can this site help me learn?</h3>
        </div>
      </section>
      <section
        id="homepage-map"
        className="bg-white/30 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto w-[90%] h-[60vh] relative"
      >
        <h3>Palm Oil Mill Deforestation Map</h3>
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
      </section>
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
