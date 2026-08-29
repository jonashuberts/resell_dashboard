export const DEMO_CATEGORIES = [
  { name: "Smartphones", color: "bg-blue-500/10 text-blue-400 border border-blue-500/20", sort_order: 1 },
  { name: "Kameras & Foto", color: "bg-amber-500/10 text-amber-400 border border-amber-500/20", sort_order: 2 },
  { name: "Laptops & PCs", color: "bg-purple-500/10 text-purple-400 border border-purple-500/20", sort_order: 3 },
  { name: "Gaming & Konsolen", color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", sort_order: 4 },
  { name: "Audio & Kopfhörer", color: "bg-rose-500/10 text-rose-400 border border-rose-500/20", sort_order: 5 },
];

export const DEMO_STATUSES = [
  { name: "Auf Lager", color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  { name: "Verkauft", color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  { name: "In Reparatur", color: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  { name: "Verkauft (Muss versendet werden)", color: "bg-orange-500/10 text-orange-400 border border-orange-500/20" },
];

export const DEMO_ITEMS = [
  {
    id: "demo-1",
    name: "iPhone 14 Pro 128GB Space Schwarz",
    category: "Smartphones",
    status: "Verkauft",
    created_at: "2026-08-01T10:00:00Z",
  },
  {
    id: "demo-2",
    name: "Sony Alpha 7 IV Body",
    category: "Kameras & Foto",
    status: "Verkauft",
    created_at: "2026-08-05T12:30:00Z",
  },
  {
    id: "demo-3",
    name: "MacBook Air M2 16GB 512GB Mitternacht",
    category: "Laptops & PCs",
    status: "Verkauft (Muss versendet werden)",
    created_at: "2026-08-12T14:15:00Z",
  },
  {
    id: "demo-4",
    name: "Nintendo Switch OLED Weiß",
    category: "Gaming & Konsolen",
    status: "Auf Lager",
    created_at: "2026-08-18T16:45:00Z",
  },
  {
    id: "demo-5",
    name: "Sony WH-1000XM5 Noise Cancelling",
    category: "Audio & Kopfhörer",
    status: "In Reparatur",
    created_at: "2026-08-20T09:20:00Z",
  },
  {
    id: "demo-6",
    name: "Fujifilm X-T4 + XF 18-55mm Kit",
    category: "Kameras & Foto",
    status: "Auf Lager",
    created_at: "2026-08-24T11:00:00Z",
  },
  {
    id: "demo-7",
    name: "Apple Watch Ultra 2 Titangehäuse",
    category: "Smartphones",
    status: "Auf Lager",
    created_at: "2026-08-27T15:30:00Z",
  }
];

export const DEMO_TRANSACTIONS = [
  // iPhone 14 Pro
  {
    id: "tx-1",
    item_id: "demo-1",
    type: "Einkauf",
    amount: 580.00,
    platform: "eBay Kleinanzeigen",
    date: "2026-08-01",
    notes: "Displaykratzer, gereinigt",
    items: { name: "iPhone 14 Pro 128GB Space Schwarz", category: "Smartphones" },
  },
  {
    id: "tx-2",
    item_id: "demo-1",
    type: "Verkauf",
    amount: 820.00,
    platform: "Vinted",
    date: "2026-08-08",
    notes: "Top Bewertung erhalten",
    items: { name: "iPhone 14 Pro 128GB Space Schwarz", category: "Smartphones" },
  },

  // Sony A7 IV
  {
    id: "tx-3",
    item_id: "demo-2",
    type: "Einkauf",
    amount: 1450.00,
    platform: "eBay Kleinanzeigen",
    date: "2026-08-05",
    notes: "Kaum Auslösungen, OVP dabei",
    items: { name: "Sony Alpha 7 IV Body", category: "Kameras & Foto" },
  },
  {
    id: "tx-4",
    item_id: "demo-2",
    type: "Verkauf",
    amount: 1890.00,
    platform: "eBay",
    date: "2026-08-16",
    notes: "Sofortkauf",
    items: { name: "Sony Alpha 7 IV Body", category: "Kameras & Foto" },
  },

  // MacBook Air M2
  {
    id: "tx-5",
    item_id: "demo-3",
    type: "Einkauf",
    amount: 850.00,
    platform: "Privat",
    date: "2026-08-12",
    notes: "Akku bei 98%",
    items: { name: "MacBook Air M2 16GB 512GB Mitternacht", category: "Laptops & PCs" },
  },
  {
    id: "tx-6",
    item_id: "demo-3",
    type: "Verkauf",
    amount: 1190.00,
    platform: "eBay",
    date: "2026-08-28",
    notes: "Versandlabel erstellt",
    items: { name: "MacBook Air M2 16GB 512GB Mitternacht", category: "Laptops & PCs" },
  },

  // Switch OLED
  {
    id: "tx-7",
    item_id: "demo-4",
    type: "Einkauf",
    amount: 190.00,
    platform: "eBay Kleinanzeigen",
    date: "2026-08-18",
    notes: "Joycon drift behoben",
    items: { name: "Nintendo Switch OLED Weiß", category: "Gaming & Konsolen" },
  },
  {
    id: "tx-8",
    item_id: "demo-4",
    type: "Reparaturkosten",
    amount: 15.00,
    platform: "Amazon",
    date: "2026-08-19",
    notes: "Ersatz-Stick Hall Effect",
    items: { name: "Nintendo Switch OLED Weiß", category: "Gaming & Konsolen" },
  },

  // Sony WH-1000XM5
  {
    id: "tx-9",
    item_id: "demo-5",
    type: "Einkauf",
    amount: 130.00,
    platform: "Vinted",
    date: "2026-08-20",
    notes: "Ohrpolster abgenutzt",
    items: { name: "Sony WH-1000XM5 Noise Cancelling", category: "Audio & Kopfhörer" },
  },
  {
    id: "tx-10",
    item_id: "demo-5",
    type: "Reparaturkosten",
    amount: 18.50,
    platform: "Amazon",
    date: "2026-08-22",
    notes: "Neue Leder-Ohrpolster",
    items: { name: "Sony WH-1000XM5 Noise Cancelling", category: "Audio & Kopfhörer" },
  },

  // Fuji X-T4
  {
    id: "tx-11",
    item_id: "demo-6",
    type: "Einkauf",
    amount: 890.00,
    platform: "eBay Kleinanzeigen",
    date: "2026-08-24",
    notes: "Inklusive 2 Zusatzakkus",
    items: { name: "Fujifilm X-T4 + XF 18-55mm Kit", category: "Kameras & Foto" },
  },

  // Apple Watch Ultra 2
  {
    id: "tx-12",
    item_id: "demo-7",
    type: "Einkauf",
    amount: 540.00,
    platform: "eBay",
    date: "2026-08-27",
    notes: "Sehr guter Zustand, Trail Loop",
    items: { name: "Apple Watch Ultra 2 Titangehäuse", category: "Smartphones" },
  },

  // General Expense
  {
    id: "tx-13",
    item_id: null,
    type: "Werkzeuge/Sonstiges",
    amount: 34.90,
    platform: "Amazon",
    date: "2026-08-10",
    notes: "50x Luftpolstertaschen & Versandetiketten",
    category: null,
  },
];
