/// <reference path="../types/web-bluetooth.d.ts" />
import { useState, useCallback } from "react";
import { CartItem } from "@/types/product";

interface PrinterState {
  device: BluetoothDevice | null;
  characteristic: BluetoothRemoteGATTCharacteristic | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

// ESC/POS Commands
const ESC = 0x1b;
const GS = 0x1d;
const COMMANDS = {
  INIT: [ESC, 0x40], // Initialize printer
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],
  BOLD_ON: [ESC, 0x45, 0x01],
  BOLD_OFF: [ESC, 0x45, 0x00],
  DOUBLE_HEIGHT_ON: [GS, 0x21, 0x10],
  DOUBLE_HEIGHT_OFF: [GS, 0x21, 0x00],
  FONT_SMALL: [ESC, 0x4d, 0x01],
  FONT_NORMAL: [ESC, 0x4d, 0x00],
  CUT_PAPER: [GS, 0x56, 0x00],
  FEED_LINE: [0x0a],
  FEED_LINES: (n: number) => [ESC, 0x64, n],
};

export const useThermalPrinter = () => {
  const [state, setState] = useState<PrinterState>({
    device: null,
    characteristic: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setState((prev) => ({
        ...prev,
        error: "Browser tidak mendukung Bluetooth. Gunakan Chrome/Edge.",
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "000018f0-0000-1000-8000-00805f9b34fb", // Common thermal printer service
          "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // Alternative service
          "49535343-fe7d-4ae5-8fa9-9fafd205e455", // Another common service
        ],
      });

      if (!device.gatt) {
        throw new Error("GATT tidak tersedia");
      }

      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();

      let characteristic: BluetoothRemoteGATTCharacteristic | null = null;

      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            characteristic = char;
            break;
          }
        }
        if (characteristic) break;
      }

      if (!characteristic) {
        throw new Error("Karakteristik tulis tidak ditemukan");
      }

      device.addEventListener("gattserverdisconnected", () => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          device: null,
          characteristic: null,
        }));
      });

      setState({
        device,
        characteristic,
        isConnected: true,
        isConnecting: false,
        error: null,
      });

      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menghubungkan printer";
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: message,
      }));
      return false;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (state.device?.gatt?.connected) {
      state.device.gatt.disconnect();
    }
    setState({
      device: null,
      characteristic: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, [state.device]);

  const writeData = async (data: number[]) => {
    if (!state.characteristic) return false;

    try {
      const uint8Array = new Uint8Array(data);
      if (state.characteristic.properties.writeWithoutResponse) {
        await state.characteristic.writeValueWithoutResponse(uint8Array);
      } else {
        await state.characteristic.writeValueWithResponse(uint8Array);
      }
      return true;
    } catch (error) {
      console.error("Error writing to printer:", error);
      return false;
    }
  };

  const textToBytes = (text: string): number[] => {
    const encoder = new TextEncoder();
    return Array.from(encoder.encode(text));
  };

  const printLine = async (text: string) => {
    await writeData([...textToBytes(text), ...COMMANDS.FEED_LINE]);
  };

  const printReceipt = useCallback(
    async (
      items: CartItem[],
      total: number,
      transactionId: string,
      paymentMethod: string
    ) => {
      if (!state.characteristic) {
        setState((prev) => ({ ...prev, error: "Printer tidak terhubung" }));
        return false;
      }

      const getPaymentLabel = (method: string) => {
        switch (method) {
          case "cash":
            return "Tunai (Cash)";
          case "qris":
            return "QRIS";
          case "transfer":
            return "Transfer Bank";
          default:
            return "Lainnya";
        }
      };

      const formatPrice = (price: number) => {
        return `Rp ${price.toLocaleString("id-ID")}`;
      };

      const padRight = (str: string, len: number) => {
        return str.length >= len ? str.substring(0, len) : str + " ".repeat(len - str.length);
      };

      const padLeft = (str: string, len: number) => {
        return str.length >= len ? str.substring(0, len) : " ".repeat(len - str.length) + str;
      };

      const LINE_WIDTH = 32; // Standard 58mm thermal printer
      const SEPARATOR = "-".repeat(LINE_WIDTH);

      try {
        // Initialize printer
        await writeData(COMMANDS.INIT);
        await new Promise((r) => setTimeout(r, 100));

        // Header - Store name
        await writeData(COMMANDS.ALIGN_CENTER);
        await writeData(COMMANDS.BOLD_ON);
        await writeData(COMMANDS.DOUBLE_HEIGHT_ON);
        await printLine("STAR VAPE");
        await writeData(COMMANDS.DOUBLE_HEIGHT_OFF);
        await writeData(COMMANDS.BOLD_OFF);

        // Address
        await writeData(COMMANDS.FONT_SMALL);
        await printLine("Jl. RS. Fatmawati Raya No.1");
        await printLine("Pd. Labu, Cilandak, Jaksel");
        await printLine("Telp: 0895-1446-5010");
        await writeData(COMMANDS.FONT_NORMAL);

        await printLine(SEPARATOR);

        // Transaction info
        await writeData(COMMANDS.ALIGN_LEFT);
        await printLine(`No: ${transactionId}`);
        await printLine(`Tgl: ${new Date().toLocaleString("id-ID")}`);

        await printLine(SEPARATOR);

        // Items
        for (const item of items) {
          const name = item.name.length > LINE_WIDTH - 2 
            ? item.name.substring(0, LINE_WIDTH - 2) 
            : item.name;
          await printLine(name);
          
          const qty = `${item.quantity} x ${formatPrice(item.price)}`;
          const subtotal = formatPrice(item.price * item.quantity);
          const spaces = LINE_WIDTH - qty.length - subtotal.length;
          await printLine(qty + " ".repeat(Math.max(1, spaces)) + subtotal);
        }

        await printLine(SEPARATOR);

        // Total
        await writeData(COMMANDS.BOLD_ON);
        const totalLabel = "TOTAL";
        const totalValue = formatPrice(total);
        const totalSpaces = LINE_WIDTH - totalLabel.length - totalValue.length;
        await printLine(totalLabel + " ".repeat(Math.max(1, totalSpaces)) + totalValue);
        await writeData(COMMANDS.BOLD_OFF);

        // Payment method
        await printLine(`Bayar: ${getPaymentLabel(paymentMethod)}`);

        await printLine(SEPARATOR);

        // Footer
        await writeData(COMMANDS.ALIGN_CENTER);
        await writeData(COMMANDS.FONT_SMALL);
        await printLine("Terima kasih atas kunjungan Anda!");
        await printLine("Barang yang sudah dibeli");
        await printLine("tidak dapat dikembalikan.");
        await printLine("");
        await writeData(COMMANDS.BOLD_ON);
        await printLine("~ STAR VAPE ~");
        await writeData(COMMANDS.BOLD_OFF);
        await writeData(COMMANDS.FONT_NORMAL);

        // Feed and cut
        await writeData(COMMANDS.FEED_LINES(4));
        await writeData(COMMANDS.CUT_PAPER);

        return true;
      } catch (error) {
        console.error("Print error:", error);
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Gagal mencetak",
        }));
        return false;
      }
    },
    [state.characteristic]
  );

  return {
    ...state,
    connect,
    disconnect,
    printReceipt,
  };
};
