import { getApiCode } from "@/lib/utils";
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import CodeViewer from "@/components/ui/code-viewer";
import { envVars } from "@/lib/env";

export default function ApiTabs({
  name,
  action = "package_show",
}: {
  name: string;
  action?: string;
}) {
  const tabsClss =
    "rounded-none text-gray-400 data-[state=active]:shadow-none px-0 cursor-pointer";
  const DMS = envVars.dms ?? "";
  return (
    <div>
      <Tabs
        defaultValue="python"
        className="flex flex-col w-full relative p-0 "
      >
        <TabsList className=" mb-3  bg-transparent p-0 h-auto gap-4 justify-end">
          <TabsTrigger value="python" className={tabsClss}>
            Python
          </TabsTrigger>
          <TabsTrigger value="javascript" className={tabsClss}>
            Javascript
          </TabsTrigger>
        </TabsList>
        <TabsContent value="python">
          <div className="bg-[#002e4d] text-white font-mono text-sm rounded-xl p-2 overflow-x-auto">
            <CodeViewer data={getApiCode(DMS, "python", action, name)}/>
          </div>
        </TabsContent>
        <TabsContent value="javascript">
          <div className="bg-[#002e4d] text-white font-mono text-sm rounded-xl p-2 overflow-x-auto">
            <CodeViewer data={getApiCode(DMS, "javascript", action, name)} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
