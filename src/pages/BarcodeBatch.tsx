import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import JsBarcode from "jsbarcode";
import { Upload, FileText, Settings } from "lucide-react";
import { motion } from "framer-motion";

const BarcodeBatch: React.FC = () => {
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [format, setFormat] = useState<string>("CODE128");
  const [manualInput, setManualInput] = useState<string>("");
  const [previews, setPreviews] = useState<string[]>([]);

  /** Generate barcode image dataURL */
  const generateImage = (value: string): string | null => {
    const canvas = document.createElement("canvas");
    try {
      JsBarcode(canvas, value, {
        format,
        displayValue: true,
        fontSize: 14,
        margin: 8,
      });
      return canvas.toDataURL("image/png");
    } catch {
      console.warn(`❌ Gagal buat barcode untuk: ${value}`);
      return null;
    }
  };

  /** Generate zip & download */
  const generateZip = async (values: string[]) => {
    const zip = new JSZip();
    for (const value of values) {
      const dataUrl = generateImage(value);
      if (!dataUrl) continue;
      const imgData = atob(dataUrl.split(",")[1]);
      const arrayBuffer = new Uint8Array(imgData.length);
      for (let i = 0; i < imgData.length; i++) {
        arrayBuffer[i] = imgData.charCodeAt(i);
      }
      zip.file(`${value}.png`, arrayBuffer);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "barcodes.zip");
  };

  /** Generate preview thumbnails */
  const updatePreviews = (values: string[]) => {
    const previewList = values.slice(0, 1).map((v) => generateImage(v));
    setPreviews(previewList.filter(Boolean) as string[]);
  };

  /** Handle Excel Upload */
  const handleFile = async (file: File) => {
    setFileName(file.name);
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

        const joinedValues = jsonData.map((row) => {
          const values = Object.values(row).filter(
            (v) => v !== null && v !== undefined && v !== ""
          );
          return values.join("-");
        });

        setBarcodes(joinedValues);
        updatePreviews(joinedValues);
        await generateZip(joinedValues);
      } catch (error) {
        alert("Gagal membaca file Excel. Pastikan formatnya benar (.xlsx).");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".xlsx")) handleFile(file);
    else alert("Hanya file .xlsx yang didukung.");
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  /** Manual Text Mode */
  const handleManualGenerate = async () => {
    if (!manualInput.trim()) {
      alert("Isi teks terlebih dahulu!");
      return;
    }
    const lines = manualInput
      .split("\n")
      .map((line) => line.trim())
      .filter((l) => l !== "");
    setBarcodes(lines);
    updatePreviews(lines);
    setIsLoading(true);
    await generateZip(lines);
    setIsLoading(false);
  };

  /** Re-render preview when format changes */
  useEffect(() => {
    if (barcodes.length > 0) updatePreviews(barcodes);
  }, [format]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <motion.h1
        className="text-4xl font-bold mb-8 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📦 Batch Barcode Generator
      </motion.h1>
      <p className="text-gray-500 mb-8 text-center max-w-lg">
        Pilih format, lalu upload Excel (.xlsx) atau masukkan teks manual
        (setiap baris = 1 barcode).
      </p>

      {/* Format Selector */}
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow">
        <Settings className="w-5 h-5 text-blue-500" />
        <label className="font-medium text-gray-700">Format:</label>
        <select
          className="border rounded-lg px-3 py-1 text-gray-700 focus:outline-none"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <option value="CODE128">CODE128</option>
          <option value="EAN13">EAN13</option>
          <option value="UPC">UPC</option>
          <option value="CODE39">CODE39</option>
          <option value="ITF14">ITF14</option>
        </select>
      </div>

      {/* Upload Excel */}
      <div
        className="w-full max-w-md border-2 border-dashed border-gray-400 rounded-2xl p-10 flex flex-col items-center justify-center bg-white hover:bg-gray-100 transition cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <Upload className="w-10 h-10 text-blue-500 mb-3" />
        <p className="text-gray-600">
          {fileName ? `📁 ${fileName}` : "Klik atau seret file Excel ke sini"}
        </p>
        <input
          id="fileInput"
          type="file"
          accept=".xlsx"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      <div className="mt-4 mb-4 text-gray-500 font-semibold">— atau —</div>

      {/* Manual Input */}
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-green-500" />
          <h2 className="font-semibold text-gray-700">Input Manual</h2>
        </div>
        <textarea
          className="w-full border rounded-xl p-3 h-40 text-sm text-gray-700 focus:outline-none focus:ring focus:ring-blue-200"
          placeholder={"Contoh:\nRAK1-1234-BEBASPAJAK\nRAK2-5555-PAJAK"}
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
        />
        <button
          onClick={handleManualGenerate}
          disabled={isLoading}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoading ? "⏳ Memproses..." : "Generate dari Teks"}
        </button>
      </div>

      {/* Preview */}
      {previews.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Preview ({previews.length} dari {barcodes.length} barcode)
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {previews.map((src, i) => (
              <div key={i} className="flex flex-col items-center">
                <img
                  src={src}
                  alt={`preview-${i}`}
                  className="max-w-full border rounded"
                />
                {/* <p className="text-xs text-gray-600 mt-1">{barcodes[i]}</p> */}
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-6 text-blue-600 font-semibold animate-pulse">
          Sedang membuat ZIP barcode...
        </div>
      )}
    </div>
  );
};

export default BarcodeBatch;
