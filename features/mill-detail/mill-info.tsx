"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type React from "react";
import { Preloader } from "@/components/preloader";
import { millInfoColumns } from "@/config/millInfo";
import type { UmlData } from "@/domain";
import { useActiveUmlStore } from "@/hooks/use-active-uml-store";

const MILL_INFO_SECTION_TITLE = "Mill Information";

type InfoData = {
  info: UmlData;
};
export const MillInfo: React.FC<{
  millOverride?: string;
  dataOverride?: Array<Record<string, unknown>>;
}> = ({ millOverride, dataOverride }) => {
  const _uml = useActiveUmlStore((state) => state.currentUml);
  const uml = millOverride || _uml;
  const { data, isLoading, isError } = useQuery<InfoData>(
    [`mill-${uml}${dataOverride ? "-data-override" : ""}`],
    async () => {
      if (dataOverride) {
        // @ts-expect-error
        return { info: dataOverride } as InfoData;
      }
      return await fetch(`/api/mill/${encodeURIComponent(uml as string)}`).then(
        (res) => res.json()
      );
    },
    { enabled: !!uml }
  );

  if (!uml) {
    return (
      <div className="prose w-full max-w-none [&_h3]:mt-0 [&_h3]:mb-3">
        <h3>{MILL_INFO_SECTION_TITLE}</h3>
        <p className="mt-2 text-center">
          Click a mill on the map to learn more.
        </p>
      </div>
    );
  }

  if (isLoading || isError) {
    return (
      <div className="prose w-full max-w-none [&_h3]:mt-0 [&_h3]:mb-3">
        <h3>{MILL_INFO_SECTION_TITLE}</h3>
        <Preloader />
      </div>
    );
  }
  const info = ((data as any).info?.[0] as UmlData) || null;

  if (!info) {
    return (
      <div className="prose w-full max-w-none [&_h3]:mt-0 [&_h3]:mb-3">
        <h3>{MILL_INFO_SECTION_TITLE}</h3>
        <p className="mt-2">No mill details are available.</p>
      </div>
    );
  }
  return (
    <div className="prose w-full max-w-none [&_h3]:mt-0 [&_h3]:mb-3">
      <h3>{MILL_INFO_SECTION_TITLE}</h3>
      <div className="card not-prose max-h-96 w-full overflow-x-auto bg-base-200 pt-0 shadow-xl">
        <table className="table-pin-rows table">
          <thead>
            <tr>
              <th>Mill Property</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {millInfoColumns.map((infoSpec) => (
              <tr key={infoSpec.column}>
                <td className="pl-2">{infoSpec.label}</td>
                <td className="pl-2">
                  <MillInfoValueCell
                    info={info}
                    infoSpec={infoSpec}
                    uml={uml as string}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const VALUE_LINK_CLASS =
  "font-medium text-[var(--site-nav-accent)] underline underline-offset-2 hover:opacity-90";

function MillInfoValueCell({
  info,
  infoSpec,
  uml,
}: {
  info: UmlData;
  infoSpec: (typeof millInfoColumns)[number];
  uml: string;
}) {
  const col = infoSpec.column as keyof UmlData;
  const raw = info[col];
  const text = raw === null || raw === undefined ? "" : String(raw);

  if (infoSpec.column === "Mill Name" && text) {
    return (
      <Link
        className={VALUE_LINK_CLASS}
        href={`/mill/${encodeURIComponent(uml)}`}
      >
        {text}
      </Link>
    );
  }

  if (infoSpec.linkFormat && text) {
    const href = infoSpec.linkFormat(text);
    return (
      <Link className={VALUE_LINK_CLASS} href={href}>
        {text}
      </Link>
    );
  }

  return <>{text}</>;
}
