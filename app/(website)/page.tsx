import queryClient from "@/utils/getMillData";
import { PalmwatchMap } from "@/components/Map";
import { QueryProvider } from "@/components/QueryProvider";
import { MillInfo } from "@/components/MillInfo";
import { BrandInfoClient } from "@/components/BrandInfoClient";
import Link from "next/link";
import { ScrollToButton } from "@/components/ScrollToButton";
import path from "path";
import cmsClient from "@/sanity/lib/client";
import { PortableText } from "@portabletext/react";

export const revalidate = 60

export default async function Home() {
  const dataDir = path.join(process.cwd(), "public", "data");
  await queryClient.init(dataDir);
  const data = queryClient.getFullMillInfo().objects();
  const homeContent = await cmsClient.getHomeContent();
  const {
    mapDescription,
    useCases,
    introContent
  } = homeContent || {}

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
        <div className="relative z-[0] flex flex-col justify-center items-center h-full p-4 text-white">
          <h1 className="text-6xl font-bold">PalmWatch</h1>
          <h2 className="text-3xl">
            Explore the impact of palm oil production on deforestation
          </h2>
          <div className="flex flex-col space-y-4 mt-10 items-center">
            {/* search by consumer brand, mill, supplier, group */}
            <p>Explore by</p>
            <div className="flex flex-col space-y-4 mb-4 lg:flex-row lg:space-y-0 lg:space-x-4">
              <Link className="btn btn-outline btn-info" href="/brands">
                Brands
              </Link>
              <Link className="btn btn-outline btn-info" href="/mills">
                Mills
              </Link>
              <Link className="btn btn-outline btn-info" href="/suppliers">
                Suppliers
              </Link>
              <Link className="btn btn-outline btn-info" href="/groups">
                Groups
              </Link>
              <Link className="btn btn-outline btn-info" href="/countries">
                Countries
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
      {!!useCases?.length && <section className="
      max-w-none w-full  flex flex-col space-y-4 bg-neutral-200 mb-4 prose justify-center items-center lg:h-[100vh] lg:flex-row lg:space-x-4 lg:space-y-0">
        {useCases?.map((useCase, index) => (
          <div key={index} className="w-full lg:w-1/2">
            <PortableText value={useCase.body} />
          </div>
        ))}
        </section>}
      {!!introContent?.length && <section className="max-w-none w-full  flex flex-col space-y-4 bg-neutral-200 mb-4 prose justify-center items-center lg:h-[100vh] lg:flex-row lg:space-x-4 lg:space-y-0">
        <PortableText value={introContent} />
      </section>}
      <section
        id="homepage-map"
        className="bg-white/30 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto w-[90%] relative block"
      >
       {!!mapDescription?.length && <PortableText value={mapDescription} />}
        <QueryProvider>
          <div className="h-[80vh] relative w-full">
            <PalmwatchMap
              geoDataUrl="/data/mill-catchment.geojson"
              dataTable={data!}
              geoIdColumn="UML ID"
              dataIdColumn="UML ID"
              choroplethColumn="treeloss_km_2022"
              choroplethScheme="forestLoss"
            />
          </div>
          <div className="p-4 w-full flex flex-col space-y-4 lg:flex-row lg:space-x-4">
            <MillInfo />
            <BrandInfoClient />
          </div>
        </QueryProvider>
      </section>
    </main>
  );
}
