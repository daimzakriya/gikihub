"use client";

import { useState } from "react";
import {
  HOSTELS,
  FLOOR_NAMES,
  searchByRoomNumber,
  searchByHostelAndRoom,
} from "@/lib/hostel-rooms-data";

type Mode = "room" | "hostel";

interface Result {
  hostelKey: string;
  hostelName: string;
  roomNo: string;
  floor: number;
}

export default function RoomFinderPage() {
  const [mode, setMode]           = useState<Mode>("room");
  const [roomInput, setRoomInput] = useState("");
  const [hostelKey, setHostelKey] = useState("H1");
  const [roomInput2, setRoomInput2] = useState("");
  const [results, setResults]     = useState<Result[] | null>(null);
  const [searched, setSearched]   = useState(false);

  function handleRoomSearch() {
    if (!roomInput.trim()) return;
    const matches = searchByRoomNumber(roomInput.trim());
    setResults(
      matches.map((m) => ({
        hostelKey:  m.hostelKey,
        hostelName: m.hostel.name,
        roomNo:     roomInput.trim().toUpperCase(),
        floor:      m.floor,
      }))
    );
    setSearched(true);
  }

  function handleHostelSearch() {
    if (!roomInput2.trim()) return;
    const floor = searchByHostelAndRoom(hostelKey, roomInput2.trim());
    if (floor !== null) {
      setResults([{
        hostelKey,
        hostelName: HOSTELS[hostelKey]!.name,
        roomNo:     roomInput2.trim().toUpperCase(),
        floor,
      }]);
    } else {
      setResults([]);
    }
    setSearched(true);
  }

  function handleKey(e: React.KeyboardEvent, fn: () => void) {
    if (e.key === "Enter") fn();
  }

  const boysHostels  = Object.entries(HOSTELS).filter(([, h]) => h.type === "boys");
  const girlsHostels = Object.entries(HOSTELS).filter(([, h]) => h.type === "girls");

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Hostel Room Finder</h1>
        <p className="page-subtitle">Find your room's hostel and floor instantly.</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setMode("room"); setResults(null); setSearched(false); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors
            ${mode === "room"
              ? "bg-brand-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Search by Room No.
        </button>
        <button
          onClick={() => { setMode("hostel"); setResults(null); setSearched(false); }}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors
            ${mode === "hostel"
              ? "bg-brand-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Hostel + Room No.
        </button>
      </div>

      {/* Search card */}
      <div className="card p-6 mb-6">
        {mode === "room" ? (
          <div className="space-y-4">
            <div>
              <label className="label">Room number</label>
              <input
                type="text"
                value={roomInput}
                onChange={(e) => { setRoomInput(e.target.value); setSearched(false); }}
                onKeyDown={(e) => handleKey(e, handleRoomSearch)}
                placeholder="e.g. 204, 312, G05"
                className="input w-full"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Searches across all hostels for this room number.
              </p>
            </div>
            <button
              onClick={handleRoomSearch}
              disabled={!roomInput.trim()}
              className="btn btn-primary w-full"
            >
              Find Room
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">Hostel</label>
              <select
                value={hostelKey}
                onChange={(e) => { setHostelKey(e.target.value); setSearched(false); }}
                className="input w-full"
              >
                <optgroup label="Boys Hostels">
                  {boysHostels.map(([k, h]) => (
                    <option key={k} value={k}>{h.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Girls Hostels">
                  {girlsHostels.map(([k, h]) => (
                    <option key={k} value={k}>{h.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="label">Room number</label>
              <input
                type="text"
                value={roomInput2}
                onChange={(e) => { setRoomInput2(e.target.value); setSearched(false); }}
                onKeyDown={(e) => handleKey(e, handleHostelSearch)}
                placeholder="e.g. 204, 312, G05"
                className="input w-full"
              />
            </div>
            <button
              onClick={handleHostelSearch}
              disabled={!roomInput2.trim()}
              className="btn btn-primary w-full"
            >
              Find Room
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {searched && results !== null && (
        results.length === 0 ? (
          <div className="card p-8 text-center border-amber-200 bg-amber-50">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-amber-800">Room not found</h3>
            <p className="text-amber-600 text-sm mt-1">
              This room number isn&apos;t in our database yet. Data is being added gradually.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((r, i) => (
              <div key={i} className="card p-5 border-brand-200 bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-lg">{r.hostelKey}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-lg">Room {r.roomNo}</p>
                    <p className="text-brand-600 font-semibold text-sm">{r.hostelName}</p>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {FLOOR_NAMES[r.floor] ?? `Floor ${r.floor}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="inline-flex flex-col items-center justify-center w-12 h-12
                                    rounded-2xl bg-green-50 border border-green-200">
                      <span className="text-green-700 font-black text-xl leading-none">{r.floor}</span>
                      <span className="text-green-600 text-[9px] font-medium leading-none mt-0.5">FLOOR</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Hostel directory */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
          Hostel Directory
        </h2>
        <div className="space-y-2">
          {[
            { label: "Boys Hostels", list: boysHostels },
            { label: "Girls Hostels", list: girlsHostels },
          ].map(({ label, list }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-gray-400 px-1 mb-2">{label}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                {list.map(([k, h]) => {
                  const roomCount = Object.keys(h.rooms).length;
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        setMode("hostel");
                        setHostelKey(k);
                        setResults(null);
                        setSearched(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="card p-3 text-left hover:border-brand-300 hover:bg-brand-50
                                 transition-colors group"
                    >
                      <p className="font-bold text-gray-900 text-sm group-hover:text-brand-700">{k}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{h.floors} floors</p>
                      {roomCount === 0 && (
                        <p className="text-[10px] text-amber-500 mt-1">Data pending</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
