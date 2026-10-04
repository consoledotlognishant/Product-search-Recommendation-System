import React from 'react';
import { Camera, RefreshCw, X, Sparkles, Sliders } from 'lucide-react';
import { VisualQuery } from '../types/product';

interface VisualSearchBannerProps {
  query: VisualQuery;
  resultsCount: number;
  onClear: () => void;
  onChangeImage: () => void;
}

export const VisualSearchBanner: React.FC<VisualSearchBannerProps> = ({
  query,
  resultsCount,
  onClear,
  onChangeImage,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 sm:p-5 shadow-sm mb-8 transition-all">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left: Query image & palette info */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm shrink-0">
            <img
              src={query.imageUrl}
              alt="Visual query"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-neutral-900/80 backdrop-blur-xs text-white text-[9px] font-semibold uppercase rounded">
              Query
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-800 text-[11px] font-medium rounded-full border border-neutral-200">
                <Sparkles className="w-3 h-3 text-neutral-900" />
                Visual Similarity Active
              </span>
              <span className="text-xs text-neutral-600">
                • {resultsCount} recommendations found
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-neutral-900 mt-1">
              Recommendations based on visual features & color harmony
            </h3>

            {/* Extracted dominant palette swatches */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">
                Extracted Palette:
              </span>
              <div className="flex items-center gap-1.5">
                {query.dominantPalette.slice(0, 4).map((c, i) => (
                  <div
                    key={i}
                    className="group relative flex items-center"
                    title={`${c.name} (${c.percentage}%)`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-neutral-300 shadow-2xs cursor-pointer"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-neutral-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-20">
                      {c.name} ({c.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
          <button
            onClick={onChangeImage}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-full transition"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Change Image</span>
          </button>
          <button
            onClick={onClear}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 border border-neutral-200 text-xs font-medium rounded-full transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset to All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
