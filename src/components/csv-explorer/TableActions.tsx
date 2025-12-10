import { Button } from "../ui/button";
import { useResourceDataSafe } from "./DataProvider";
import { SettingsDisplayButton } from "./SettingsDisplay";

export default function TableActions() {
  const { data } = useResourceDataSafe();
  const handleDownload = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex  gap-4">
      <SettingsDisplayButton />
      <div className="flex gap-1">
        <div className="relative inline-block">
          <Button
            onClick={handleDownload}
            variant={"outline"}
          >
            ⬇️
            <span className="hidden sm:block">JSON</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
