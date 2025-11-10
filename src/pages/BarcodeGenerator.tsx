import { useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { motion } from "framer-motion";

export default function BarcodeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [text, setText] = useState("123456789012");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(60);
  const [displayValue, setDisplayValue] = useState(true);
  const [format, setFormat] = useState("CODE128");
  const [error, setError] = useState("");

  const generate = () => {
    setError("");

    if (!text.trim()) {
      setError("Masukkan teks atau angka untuk dijadikan barcode.");
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ratio = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth || 480;
      const displayHeight = 120;

      // Set ukuran pixel dan scaling
      canvas.width = displayWidth * ratio;
      canvas.height = displayHeight * ratio;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(ratio, ratio);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      JsBarcode(canvas, text, {
        format,
        lineColor: "#000",
        width: Number(width),
        height: Number(height),
        displayValue,
        margin: 10,
      });
    } catch (e: any) {
      console.error(e);
      setError("Gagal generate barcode: " + (e.message || e));
    }
  };

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `barcode_${text || "untitled"}.png`;
    a.click();
  };

  const clearCanvas = () => {
    setText("");
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <motion.h1
        className="text-4xl font-bold mb-8 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🧾 Create a Barcode
      </motion.h1>

      {/* Input teks */}
      <div className="flex justify-center flex-col max-w-md bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
        <div className="mb-6">
          <label className="block font-medium mb-2 text-sm text-gray-600">
            Teks / Nomor
          </label>
          <input
            className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200 outline-none text-gray-600"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Masukkan teks atau angka..."
          />
        </div>

        {/* Pilihan format & tampilan */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <label className="block text-sm font-medium mr-4 text-gray-600">
              Format
            </label>
            <select
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 text-gray-600"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="CODE128">CODE128 (umum)</option>
              <option value="EAN13">EAN13 (13 digit)</option>
              <option value="UPC">UPC</option>
              <option value="CODE39">CODE39</option>
            </select>
          </div>

          <div className="flex items-center p-2">
            <label className="inline-flex items-center text-gray-600">
              <input
                type="checkbox"
                checked={displayValue}
                onChange={(e) => setDisplayValue(e.target.checked)}
                className="mr-2 accent-blue-600 cursor-pointer"
              />
              <span>
                {displayValue ? "Tampilkan nilai" : "Tidak tampilkan nilai"}
              </span>
            </label>
          </div>
        </div>

        {/* Pengaturan ukuran */}
        <div className="grid grid-cols-2 gap-4 mb-6 mt-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-600">
              Width (ketebalan garis)
            </label>
            <input
              type="number"
              min={1}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 text-gray-600 border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-600">
              Height (tinggi)
            </label>
            <input
              type="number"
              min={10}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 text-gray-600 border-gray-300"
            />
          </div>
        </div>

        {/* Tombol */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <button
            onClick={generate}
            className="px-5 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          >
            Generate
          </button>
          <button
            onClick={downloadPNG}
            className="px-5 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
          >
            Download PNG
          </button>
          <button
            onClick={clearCanvas}
            className="px-5 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition"
          >
            Clear
          </button>
        </div>

        {/* Error */}
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}

        {/* Preview */}
        <div className="border-3 p-4 rounded-lg bg-gray-50 border-gray-300 border-dashed">
          <p className="text-sm text-gray-500 mb-2 text-center">
            Preview — klik <b>Generate</b> untuk menampilkan
          </p>
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                maxWidth: 480,
                height: 120,
                background: "#fff",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
