// Replace the placeholder entries below with the real GIKI room list.
// Format for each hostel:
//   rooms: Record<string, number>  →  { "roomNumber": floorNumber }
//   e.g.  "101": 1,  "201": 2,  "G01": 0

export interface HostelInfo {
  name:        string;
  shortName:   string;
  type:        "boys" | "girls";
  floors:      number;         // total floors (excluding ground)
  rooms:       Record<string, number>; // roomNo → floor
}

export const HOSTELS: Record<string, HostelInfo> = {
  H1: {
    name:      "Hostel 1",
    shortName: "H1",
    type:      "boys",
    floors:    4,
    rooms: {
      // TODO: fill in when room list is shared
      "101": 1, "102": 1, "103": 1, "104": 1,
      "201": 2, "202": 2, "203": 2, "204": 2,
      "301": 3, "302": 3, "303": 3, "304": 3,
      "401": 4, "402": 4, "403": 4, "404": 4,
    },
  },
  H2: { name: "Hostel 2", shortName: "H2", type: "boys", floors: 4, rooms: {} },
  H3: { name: "Hostel 3", shortName: "H3", type: "boys", floors: 4, rooms: {} },
  H4: { name: "Hostel 4", shortName: "H4", type: "boys", floors: 4, rooms: {} },
  H5: { name: "Hostel 5", shortName: "H5", type: "boys", floors: 4, rooms: {} },
  H6: { name: "Hostel 6", shortName: "H6", type: "boys", floors: 4, rooms: {} },
  H7: { name: "Hostel 7", shortName: "H7", type: "boys", floors: 4, rooms: {} },
  H8: { name: "Hostel 8", shortName: "H8", type: "boys", floors: 4, rooms: {} },
  H9: { name: "Hostel 9", shortName: "H9", type: "boys", floors: 4, rooms: {} },
  GH1: { name: "Girls Hostel 1", shortName: "GH1", type: "girls", floors: 3, rooms: {} },
  GH2: { name: "Girls Hostel 2", shortName: "GH2", type: "girls", floors: 3, rooms: {} },
  GH3: { name: "Girls Hostel 3", shortName: "GH3", type: "girls", floors: 3, rooms: {} },
};

export const FLOOR_NAMES: Record<number, string> = {
  0: "Ground Floor",
  1: "1st Floor",
  2: "2nd Floor",
  3: "3rd Floor",
  4: "4th Floor",
  5: "5th Floor",
};

/** Search all hostels for a room number. Returns all matches. */
export function searchByRoomNumber(roomNo: string): Array<{ hostel: HostelInfo; hostelKey: string; floor: number }> {
  const q = roomNo.trim().toUpperCase();
  const results: Array<{ hostel: HostelInfo; hostelKey: string; floor: number }> = [];
  for (const [key, hostel] of Object.entries(HOSTELS)) {
    const floor = hostel.rooms[q] ?? hostel.rooms[q.toLowerCase()];
    if (floor !== undefined) {
      results.push({ hostel, hostelKey: key, floor });
    }
  }
  return results;
}

/** Look up a room in a specific hostel. */
export function searchByHostelAndRoom(hostelKey: string, roomNo: string): number | null {
  const hostel = HOSTELS[hostelKey];
  if (!hostel) return null;
  const q = roomNo.trim().toUpperCase();
  const floor = hostel.rooms[q] ?? hostel.rooms[q.toLowerCase()];
  return floor ?? null;
}
