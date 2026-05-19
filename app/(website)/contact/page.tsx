import { redirect } from "next/navigation";

/** Contact content lives on About until a dedicated page is restored. */
export default function ContactPage() {
  redirect("/about");
}
