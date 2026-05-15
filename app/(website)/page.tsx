import Image from "next/image";
import Link from "next/link";
import { BrandInfoClient } from "@/components/brand-info-client";
import { QueryProvider } from "@/components/query-provider";
import { ScrollToButton } from "@/components/scroll-to-button";
import { HomePageMap } from "@/features/map";
import { MillInfo } from "@/features/mill-detail";
import cmsClient from "@/sanity/lib/client";
import { PortableText, urlFor } from "@/sanity/lib/components";

export const revalidate = 60;

export default async function Home() {
  const homeContent = await cmsClient.getHomeContent();
  const { mapDescription, useCases, introContent, heroSubtitle, heroTitle } =
    homeContent || {};

  return (
    <main className="flex h-auto flex-col items-center justify-center">
      {/* fullheight hero div */}
      <section className="relative h-[100vh] w-full overflow-hidden bg-black">
        <video
          autoPlay
          className="absolute top-0 left-0 h-full w-full object-cover opacity-25"
          loop
          muted
        >
          <source src="cover-video.mp4" type="video/mp4" />
          {/* <source src="path/to/video.webm" type="video/webm"></source> */}
          {/* Your browser does not support the video tag. */}
        </video>
        <div className="relative z-[0] flex h-full flex-col items-center justify-center p-4 text-white">
          <h1 className="font-bold text-6xl">{heroTitle || "PalmWatch"}</h1>
          <h2 className="text-3xl">
            {heroSubtitle ||
              "Explore the impact of palm oil production on deforestation"}
          </h2>
          <div className="mt-10 flex flex-col items-center space-y-4">
            {/* search by consumer brand, mill, mill owner, mill group */}
            <p>Explore by</p>
            <div className="mb-4 flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
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
                Mill Groups
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
          // text rotates 90deg
          className="absolute right-1 bottom-1 z-[1] translate-x-[48%] translate-y-[-25vh] rotate-90 text-white/50 text-xs"
          href="https://www.youtube.com/watch?v=YKJcN81mZgA"
          rel="noopener noreferrer"
          target="_blank"
        >
          Cover Video by Sum Mayyah Channel | Creative Commons Attribution
        </a>
      </section>
      {!!introContent?.length && (
        <section className="prose mb-4 flex w-full max-w-none flex-col items-center justify-center space-y-4 py-4 lg:min-h-[50vh] lg:flex-row lg:space-x-4 lg:space-y-0 lg:py-4">
          <div className="mx-auto my-0 max-w-[75%]">
            <PortableText value={introContent} />
          </div>
        </section>
      )}
      {!!useCases?.length && (
        <section className="prose mb-4 flex w-full max-w-none flex-col items-center justify-center space-y-4 bg-base-200 py-10 lg:min-h-[50vh] lg:flex-row lg:space-x-4 lg:space-y-0 lg:py-4">
          {useCases?.map((useCase: any, index: number) => (
            <div className="w-full text-center lg:w-1/3" key={index}>
              <Image
                alt={`${useCase.title} icon`}
                className="mx-auto my-0 h-auto max-h-40 w-auto"
                height={160}
                src={urlFor(useCase?.image?.asset?._ref || "")}
                width={160}
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
        className="relative mx-auto block w-[90%] rounded-lg bg-base-200 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-lg"
        id="homepage-map"
      >
        <div className="prose max-w-none p-4">
          {!!mapDescription?.length && <PortableText value={mapDescription} />}
        </div>
        <QueryProvider>
          <HomePageMap />
          <div className="flex w-full flex-col space-y-4 p-0 lg:flex-row lg:space-x-4">
            <MillInfo />
            <BrandInfoClient />
          </div>
        </QueryProvider>
      </section>
    </main>
  );
}
