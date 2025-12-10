import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type PageTabItem = {
  title: string;
  description?: string;
  subtitle?: string;
  content: React.ReactNode;
  id: string;
};
export type PageTabsProps = {
  items: PageTabItem[];
  menuClass?: string;
  contentClass?: string;
  className?: string;
};

export default function PageTabs({
  items,
  className,
  menuClass,
  contentClass,
}: PageTabsProps) {
  return (
    <Tabs defaultValue={items?.[0]?.id} className={cn("w-full", className)}>
      <TabsList className="p-0 bg-transparent h-auto flex justify-start overflow-auto">
        {items.map((item) => (
          <TabsTrigger
            key={item.id}
            className={cn(
              "cursor-pointer data-[state=active]:border-b-white rounded-b-none  data-[state=active]:bg-white data-[state=active]:shadow-none border border-transparent data-[state=active]:border-gray-200 data-[state=active]:border-dashed data-[state=active]:border-b-white rounded-b-none data-[state=active]:border-t data-[state=active]:border-l data-[state=active]:border-r py-3 px-5",
              menuClass
            )}
            value={item.id}
          >
            {item.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent
          key={item.id}
          value={item.id}
          className={`${contentClass}`}
        >
          {item.subtitle && (
            <h2 className="text-xl font-bold mb-4">{item.subtitle}</h2>
          )}
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
