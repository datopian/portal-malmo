import { Button } from "@/components/ui/button";
import CodeViewer from "@/components/ui/code-viewer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiCode } from "@/lib/snippets";
import { Code } from "lucide-react";
import { useTranslations } from "next-intl";

const tabs = [
  { key: "curl", label: "cURL", language: "bash" },
  { key: "python", label: "Python", language: "python" },
  { key: "javascript", label: "JavaScript", language: "javascript" },
  { key: "r", label: "R", language: "r" },
] as const;

const DMS = process.env.NEXT_PUBLIC_DMS;

export default function ApiDialog({
  id = "<id>",
  type = "package",
  includeDatastore = false,
}: {
  id?: string;
  type?: "package" | "resource";
  includeDatastore?: boolean;
}) {
    const t = useTranslations();
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline"><Code/>{t("Common.api")}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>{t("Common.api")}</DialogTitle>
            <DialogDescription>
              {t("API.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-hidden">
            <div className="space-y-4 max-w-full min-w-0 h-full" data-cy="api-tabs">
              <Tabs defaultValue={tabs[0].key} className="max-w-full min-w-0 h-full flex flex-col">
                <TabsList className="flex w-full flex-wrap justify-start bg-transparent" data-cy="api-tabs-list">
                  {tabs.map((tab) => (
                    <TabsTrigger asChild value={tab.key} key={tab.key}>
                      <Button
                        variant="outline"
                        data-cy={`api-tab-${tab.key}`}
                        className="data-[state=active]:bg-theme-green data-[state=active]:!border-theme-green data-[state=active]:!text-white cursor-pointer data-[state=active]:border-secondary hover:bg-muted border-r-0 last:border-r !rounded-none data-[state=active]:text-accent-foreground !text-foreground !shadow-none"
                      >
                        <span>{tab.label}</span>
                      </Button>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="min-h-0 flex-1 overflow-hidden">
                  {tabs.map((tab) => (
                    <TabsContent
                      key={tab.key}
                      className="mt-4 min-w-0 h-full overflow-auto"
                      value={tab.key}
                      data-cy={`api-tab-content-${tab.key}`}
                    >
                      <CodeViewer
                        data={getApiCode({
                          url: DMS ?? "",
                          language: tab.key,
                          type: type,
                          id: id,
                          includeDatastore: includeDatastore,
                        })}
                        language={tab.key}
                      />
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
