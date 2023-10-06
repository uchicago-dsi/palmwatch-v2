import { ColgatePalmolive } from "./Colgate-Palmolive";
import { Ferrero } from "./Ferrero";
import { FrieslandCampina } from "./FrieslandCampina";
import { Mars } from "./Mars";
import { Nestle } from "./Nestle";
import { PepsiCo } from "./PepsiCo";
import { Unilever } from "./Unilever";
import { GeneralMills } from "./GeneralMills";
import { Hershey } from "./Hershey";
import { LOreal } from "./LOreal";
import { Mondelez } from "./Mondelez";
import { ProcterAndGamble } from "./ProctorAndGamble";
import { ReckittBenckiser } from "./ReckittBenckiser";
import { JohnsonAndJohnson } from "./JohnsonAndJohnson";
import { Kellogg } from "./Kellogg";


import { BrandSchema } from "./types";

const brands: {[key:string]: BrandSchema} = {
  "Colgate-Palmolive": ColgatePalmolive,
  "Ferrero": Ferrero,
  "FrielsandCampina": FrieslandCampina,
  "General Mills": GeneralMills,
  "Hershey": Hershey,
  "Johnson & Johnson": JohnsonAndJohnson,
  "Kellogg": Kellogg,
  "L'ORÉAL": LOreal,
  "Mars": Mars,
  "Mondelez": Mondelez,
  "Nestlé": Nestle,
  "PepsiCo": PepsiCo,
  "Procter & Gamble": ProcterAndGamble,
  "Reckitt Benckiser (RB)": ReckittBenckiser,
  "Unilever": Unilever,
};

export default brands;