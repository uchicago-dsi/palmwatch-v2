import { ColgatePalmolive } from "./colgate-palmolive";
import { Ferrero } from "./ferrero";
import { FrieslandCampina } from "./friesland-campina";
import { GeneralMills } from "./general-mills";
import { Hershey } from "./hershey";
import { JohnsonAndJohnson } from "./johnson-and-johnson";
import { Kellogg } from "./kellogg";
import { LOreal } from "./l-oreal";
import { Mars } from "./mars";
import { Mondelez } from "./mondelez";
import { Nestle } from "./nestle";
import { PepsiCo } from "./pepsi-co";
import { ProcterAndGamble } from "./proctor-and-gamble";
import { ReckittBenckiser } from "./reckitt-benckiser";
import type { BrandSchema } from "./types";
import { Unilever } from "./unilever";

const brands: { [key: string]: BrandSchema } = {
  "Colgate-Palmolive": ColgatePalmolive,
  Ferrero,
  FrieslandCampina,
  "General Mills": GeneralMills,
  Hershey,
  "Johnson & Johnson": JohnsonAndJohnson,
  Kellogg,
  "L'ORÉAL": LOreal,
  Mars,
  Mondelez,
  Nestlé: Nestle,
  PepsiCo,
  "Procter & Gamble": ProcterAndGamble,
  "Reckitt Benckiser (RB)": ReckittBenckiser,
  Unilever,
};

export default brands;
