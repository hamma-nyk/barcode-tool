import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Barcode, Boxes } from "lucide-react";

interface ButtonOption {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const buttons: ButtonOption[] = [
    {
      title: "Create Barcode",
      description:
        "Generate a single 1D barcode easily with custom text input.",
      icon: <Barcode className="w-10 h-10 text-blue-600 mb-3" />,
      path: "/barcode",
    },
    {
      title: "Create Barcode Batch",
      description:
        "Upload or input multiple values to generate multiple barcodes.",
      icon: <Boxes className="w-10 h-10 text-green-600 mb-3" />,
      path: "/barcode/batch",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <motion.h1
        className="text-4xl font-bold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🧠 Barcode Generator App
      </motion.h1>

      <motion.p
        className="text-gray-600 mb-10 text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Pilih mode yang kamu butuhkan di bawah ini — buat satu barcode atau
        batch sekaligus.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buttons.map((btn, i) => (
          <motion.div
            key={btn.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <div
              onClick={() => navigate(btn.path)}
              className="cursor-pointer bg-white p-6 rounded-2xl shadow hover:shadow-lg transition flex flex-col items-center text-center"
            >
              {btn.icon}
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                {btn.title}
              </h2>
              <p className="text-gray-500 text-sm">{btn.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <footer className="mt-16 text-gray-400 text-sm">
        © {new Date().getFullYear()} Barcode Generator — Made with 💻 by{" "}
        <a
          className="underline text-blue-600 hover:text-blue-800 transition"
          href="https://www.linkedin.com/in/myikos/"
          target="_blank"
        >
          hamma-nyk
        </a>
      </footer>
    </div>
  );
};

export default HomePage;
