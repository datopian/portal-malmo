import { Link } from "@/i18n/navigation";
import { Group } from "@/schemas/ckan";
import Image from "next/image";

type Props = {
  group: Group;
  colorClass: string;
};

const GroupCard = ({ group, colorClass = "bg-gray-600" }: Props) => {
  return (
    <Link
      href={`/data/?groups=${group.name}`}
      className={`relative flex flex-col justify-between p-4 text-white md:aspect-square ${colorClass} hover:brightness-90 focus-visible:brightness-90 transition`}
    >
      <div className="mb-4">
        <Image
          width={32}
          height={32}
          src={group.image_display_url || "/graphics/group-default-group.svg"}
          alt={group.display_name}
          className="invert"
        />
      </div>
      <div className="mt-auto">
        <span className="inline-block bg-theme-green/50 px-3 py-1 text-sm font-bold">
          {group.package_count ?? 0}
        </span>
        <p className="mt-3 font-semibold leading-snug line-clamp-2 text-[14px] min-h-[38px]">
          {group.display_name}
        </p>
      </div>
    </Link>
  );
};

export default GroupCard;
