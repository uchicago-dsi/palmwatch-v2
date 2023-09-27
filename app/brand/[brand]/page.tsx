import { IqrOverTime } from "@/components/IqrOverTimeLineChart";
import { PalmwatchMap } from "@/components/Map";
import { QueryProvider } from "@/components/QueryProvider";
import { disclosures } from "@/config/disclosures";
import queryClient from "@/utils/getMillData";
import React from "react";

const range = (start: number, end: number) => {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
};
const cols = range(1, 23).map((i) => `km_${i}`);

const getData = async (brand: string) => {
  const data = queryClient.getBrandInfo(brand, cols);
  return data;
};
export default async function Page({ params }: { params: { brand: string } }) {
  const brand = params.brand;
  const data = await getData(brand);
  const disclosurePdfs = disclosures?.[brand as keyof typeof disclosures];
  return <div>asdf</div>
  // return (
  //   <main className="relative flex flex-col items-center justify-center w-[90%] max-w-[1400px] mx-auto">
  //     <div className="p-4 flex flex-row space-x-4 my-8 w-full shadow-xl">
  //       <div>
  //         <h1 className="text-4xl font-bold">{brand}</h1>
  //         <h2 className="text-xl">Palm Oil Usage</h2>
  //       </div>
  //       <p>brand info...</p>
  //     </div>
  //     <div className="flex flex-row space-x-4 w-full">
  //       <div className="bg-white/30 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto  w-full">
  //         <h3 className="text-2xl m-4 font-bold">
  //           2022 Mill Impact (KM<sup>2</sup> of Forest Loss)
  //         </h3>
  //         <div className="h-[60vh] relative w-full">
  //           <QueryProvider>
  //             <PalmwatchMap
  //               geoDataUrl="/data/mill-catchment.geojson"
  //               dataTable={data.umlInfo}
  //               geoIdColumn="UML ID"
  //               dataIdColumn="UML ID"
  //               choroplethColumn="km_22"
  //               choroplethScheme="forestLoss"
  //             />

  //             {/* <div className="p-4 flex flex-row space-x-4">
  //         <MillInfo />
  //         <BrandInfo />
  //       </div> */}
  //           </QueryProvider>
  //         </div>
  //       </div>
  //       <div className="bg-white/30 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg mx-auto w-full">
  //         <h3 className="text-2xl m-4 font-bold">
  //           Forest Loss over time (KM<sup>2</sup>)
  //         </h3>
  //         <div className="h-[60vh] relative w-full">
  //           <IqrOverTime data={data.timeseries} />
  //         </div>
  //       </div>
  //     </div>
  //     {/* {disclosurePdfs && (
  //       <div className="p-4 card shadow-xl bg-base-200 my-4">
  //         <h2 className="text-2xl font-bold">Disclosure PDFs</h2>
  //         <p>Source PDFs for data</p>
  //         <ul>
  //           {disclosurePdfs.map((pdf) => (
  //             <li
  //               key={pdf.filename}
  //             >
  //               <a
  //                 className="link-primary"
  //                 href={`${pdf.filename}`}
  //                 target="_blank"
  //                 rel="noreferrer"
  //                 download
  //               >
  //                 {pdf.year}
  //               </a>
  //             </li>
  //           ))}
  //         </ul>
  //       </div>
  //     )} */}
  //   </main>
  // );
}
