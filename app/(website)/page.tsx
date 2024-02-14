import queryClient from "@/utils/getMillData";
import { PalmwatchMap } from "@/components/Map";
import { QueryProvider } from "@/components/QueryProvider";
import { MillInfo } from "@/components/MillInfo";
import { BrandInfoClient } from "@/components/BrandInfoClient";
import Link from "next/link";
import { ScrollToButton } from "@/components/ScrollToButton";
import path from "path";
import cmsClient from "@/sanity/lib/client";
import { PortableText, urlFor } from "@/sanity/lib/components";
import { HomePageMap } from "@/components/HomePageMap";

export const revalidate = 60;

export default async function Home() {
  const dataDir = path.join(process.cwd(), "public", "data");
  await queryClient.init(dataDir);
  const data = queryClient.getFullMillInfo().objects();
  const homeContent = await cmsClient.getHomeContent();
  const { mapDescription, useCases, introContent } = homeContent || {};
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
            {/* search by consumer brand, mill, mill owner, mill group */}
            <p>Explore by</p>
            <div className="flex flex-col space-y-4 mb-4 lg:flex-row lg:space-y-0 lg:space-x-4">
              <Link className="btn btn-outline btn-info" href="/brands">
                Brands
              </Link>
              <Link className="btn btn-outline btn-info" href="/mills">
                Mills
              </Link>
              <Link className="btn btn-outline btn-info" href="/owners">
                Mill Owners
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
              className="btn btn-oultine btn-base mt-4"
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
          // text rotates 90deg
          className="absolute bottom-1 right-1 text-white/50 text-xs z-[1] translate-y-[-25vh] translate-x-[48%]  rotate-90"
        >
          Cover Video by Sum Mayyah Channel | Creative Commons Attribution
        </a>
      </section>
      {!!introContent?.length && (
        <section className="max-w-none w-full py-4 flex flex-col space-y-4 mb-4 prose justify-center items-center lg:py-4 lg:min-h-[50vh] lg:flex-row lg:space-x-4 lg:space-y-0">
          <div className="mx-auto my-0 max-w-[75%]">
            <PortableText value={introContent} />
          </div>
        </section>
      )}
      {!!useCases?.length && (
        <section
          className="
      max-w-none w-full py-10 flex flex-col space-y-4 bg-base-200 mb-4 prose justify-center items-center lg:py-4 lg:min-h-[50vh] lg:flex-row lg:space-x-4 lg:space-y-0"
        >
          {useCases?.map((useCase, index) => (
            <div key={index} className="w-full text-center lg:w-1/3">
              <img  /* @ts-ignore */
                src={urlFor(useCase?.image?.asset?._ref || "")}
                alt={useCase.title + " icon"}
                className="mx-auto my-0"
              />
              <h3>{useCase.title}</h3>
              <div className="mx-auto my-0 max-w-[75%]">
                <PortableText value={useCase.body} />
              </div>
            </div>
          ))}
        </section>
      )}
      <section
        id="homepage-map"
        className="bg-base-200 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto w-[90%] relative block"
      >
        <div className="prose p-4 max-w-none">
          {!!mapDescription?.length && <PortableText value={mapDescription} />}
        </div>
        <QueryProvider>
          <HomePageMap />
          <div className="p-0 w-full flex flex-col space-y-4 lg:flex-row lg:space-x-4">
            <MillInfo />
            <BrandInfoClient />
          </div>
        </QueryProvider>
      </section>
    </main>
  );
}
