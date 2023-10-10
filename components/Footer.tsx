import Link from "next/link";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="flex flex-col space-y-10 mt-10 p-10 bg-neutral-200 shadow-xl prose w-full max-w-none lg:flex-row lg:space-y-0 lg:space-x-10">
      <div className="flex-1 basis-1/3">
        Copyright {year} (c) University of Chicago Data Science Institute,
        Inclusive Development International (IDI)
      </div>
      <div className="flex-1 basis-1/3">
        {/* brands, mills, suppliers, groups, countries */}
        <ul>
          <li>
            <Link href="/brands">Brands</Link>
          </li>
          <li>
            <Link href="/mills">Mills</Link>
          </li>
          <li>
            <Link href="/suppliers">Suppliers</Link>
          </li>
          <li>
            <Link href="/groups">Groups</Link>
          </li>
          <li>
            <Link href="/countries">Countries</Link>
          </li>
        </ul>
      </div>
      <div className="flex-1 basis-1/3">
        <ul>
          <li>
            <Link href="/about" className="mt-8">
              About
            </Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};
