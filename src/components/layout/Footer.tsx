import Container from "../ui/container";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-5 mt-10">
      <Container>
        <div className="flex gap-4 flex-col md:flex-row">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-bold  text-lg  "
            >
              <span>🌀 PortalJS</span>
            </Link>
            <p className="text-sm">
              Lorem ipsum dolor sit amed porsperus morabi
            </p>
          </div>
          <div className="md:ml-auto ">
            <ul className="flex flex-col md:items-end">
              <li>
                <span className="uppercase font-bold">Contact Us</span>
              </li>
              <li className="text-sm">
                <Link href="mailto:contact@email.com">contact@email.com</Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
