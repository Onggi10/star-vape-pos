import { Printer, WifiOff } from "lucide-react";
import { useThermalPrinterContext } from "@/contexts/ThermalPrinterContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const PrinterStatus = () => {
  const { isConnected, connect, disconnect } = useThermalPrinterContext();

  const handleClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect();
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          className="relative"
        >
          {isConnected ? (
            <>
              <Printer className="w-5 h-5 text-green-500" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
            </>
          ) : (
            <>
              <Printer className="w-5 h-5 text-muted-foreground" />
              <WifiOff className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-destructive" />
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isConnected ? "Printer Terhubung - Klik untuk putuskan" : "Printer Tidak Terhubung - Klik untuk hubungkan"}</p>
      </TooltipContent>
    </Tooltip>
  );
};
