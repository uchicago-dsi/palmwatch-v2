export const millInfoColumns = [
  {
    column: "Mill Name",
    label: "Mill Name",
    formatter: undefined,
  },
  {
    label: "Recent Deforestation Score",
    column: "risk_score_current",
  },
  {
    label: "Past Deforestation Score",
    column: "risk_score_past",
  },
  {
    label: "Future Deforestation Risk Score",
    column: "risk_score_future",
  },
  {
    column: "Alternative name",
    label: "Alternative name",
    formatter: undefined,
  },
  {
    column: "Group Name",
    label: "Group Name",
    formatter: undefined,
    linkFormat: (value: string) => `/group/${value}`,
  },
  {
    column: "Parent Company",
    label: "Parent Company",
    formatter: undefined,
    linkFormat: (value: string) => `/owner/${value}`,
  },
  {
    column: "RSPO Status",
    label: "RSPO Status",
    formatter: undefined,
  },
  {
    column: "RSPO Type",
    label: "RSPO Type",
    formatter: undefined,
  },
  {
    column: "Confidence level",
    label: "Confidence level",
    formatter: undefined,
  },
  {
    column: "Date RSPO Certification Status",
    label: "Date RSPO Certification Status",
    formatter: undefined,
  },
  {
    column: "Country",
    label: "Country",
    formatter: undefined,
    linkFormat: (value: string) => `/country/${value}`,
  },
  {
    column: "Province",
    label: "Province",
    formatter: undefined,
  },
  {
    column: "District",
    label: "District",
    formatter: undefined,
  },
  {
    column: "UML ID",
    label: "UML ID",
    formatter: undefined,
  },
];
