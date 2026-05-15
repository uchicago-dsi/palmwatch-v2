import { ColgatePalmolive } from "./Colgate-Palmolive";
import { Ferrero } from "./Ferrero";
import { FrieslandCampina } from "./FrieslandCampina";
import { GeneralMills } from "./GeneralMills";
import { Hershey } from "./Hershey";
import { JohnsonAndJohnson } from "./JohnsonAndJohnson";
import { Kellogg } from "./Kellogg";
import { LOreal } from "./LOreal";
import { Mars } from "./Mars";
import { Mondelez } from "./Mondelez";
import { Nestle } from "./Nestle";
import { PepsiCo } from "./PepsiCo";
import { ProcterAndGamble } from "./ProctorAndGamble";
import { ReckittBenckiser } from "./ReckittBenckiser";
import type { BrandSchema } from "./types";
import { Unilever } from "./Unilever";

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
