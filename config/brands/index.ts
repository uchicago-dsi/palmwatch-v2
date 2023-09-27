import { ColgatePalmolive } from "./Colgate-Palmolive";
import { Ferrero } from "./Ferrero";
import { BrandSchema } from "./types";

const brands: {[key:string]: BrandSchema} = {
  "Colgate-Palmolive": ColgatePalmolive,
  "Ferrero": Ferrero,
};

export default brands;