// src/components/SizeGuide.tsx
import { useState } from "react";

export default function SizeGuide() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowGuide(true)}
        className="text-sm text-black underline font-semibold hover:text-gray-700 transition-colors"
      >
        Size Guide
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-black text-white p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-black mb-1">Ring Size Guide</h2>
                <p className="text-gray-300 text-sm">Find your perfect fit</p>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* How to Measure */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-black text-lg mb-4">How to Measure Your Ring Size</h3>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">1</span>
                    <span><strong>Wrap a string</strong> around your finger where you'd wear the ring</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">2</span>
                    <span><strong>Mark the point</strong> where the string overlaps</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">3</span>
                    <span><strong>Measure the length</strong> in millimeters</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">4</span>
                    <span><strong>Match to the size chart</strong> below</span>
                  </li>
                </ol>
              </div>

              {/* Size Chart */}
              <div>
                <h3 className="font-black text-lg mb-4">Size Chart (Pakistan/India Standard)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold">Size</th>
                        <th className="px-4 py-3 text-left font-bold">Circumference (mm)</th>
                        <th className="px-4 py-3 text-left font-bold">Diameter (mm)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[
                        { size: 11, circ: 51.2, dia: 16.3 },
                        { size: 12, circ: 52.8, dia: 16.8 },
                        { size: 13, circ: 54.4, dia: 17.3 },
                        { size: 14, circ: 56.0, dia: 17.8 },
                        { size: 15, circ: 57.6, dia: 18.3 },
                        { size: 16, circ: 59.2, dia: 18.9 },
                        { size: 17, circ: 60.8, dia: 19.4 },
                        { size: 18, circ: 62.4, dia: 19.9 },
                        { size: 19, circ: 64.0, dia: 20.4 },
                        { size: 20, circ: 65.6, dia: 20.9 },
                      ].map((row) => (
                        <tr key={row.size} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-bold">{row.size}</td>
                          <td className="px-4 py-3">{row.circ} mm</td>
                          <td className="px-4 py-3">{row.dia} mm</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Pro Tips
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Measure your finger at the end of the day when it's largest</li>
                  <li>• Make sure the string is snug but comfortable</li>
                  <li>• Wider bands require a larger size (go up 0.5-1 size)</li>
                  <li>• If between sizes, choose the larger one</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

