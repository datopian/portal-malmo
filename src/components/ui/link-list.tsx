import React from "react";
import { Link } from "@/i18n/navigation";

type Link = {
  id: string;
  title: string;
  href: string;
};

const LinkList = ({ links }: { links: Link[] }) => {
  if (!links || links.length === 0) return null;

  return links.map((t, i) => (
    <React.Fragment key={t.id}>
      <Link className="underline" href={t.href}>
        {t.title}
      </Link>
      {i < links.length - 1 ? ", " : ""}
    </React.Fragment>
  ));
};

export default LinkList;
