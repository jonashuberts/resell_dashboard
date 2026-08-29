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
  // August Items
  { id: "demo-1", name: "iPhone 15 Pro 128GB Titan Natur", category: "Smartphones", status: "Verkauft", created_at: "2026-08-02T10:00:00Z" },
  { id: "demo-2", name: "Sony Alpha 7 IV Body", category: "Kameras & Foto", status: "Verkauft", created_at: "2026-08-05T12:30:00Z" },
  { id: "demo-3", name: "MacBook Air M2 16GB 512GB Mitternacht", category: "Laptops & PCs", status: "Verkauft (Muss versendet werden)", created_at: "2026-08-12T14:15:00Z" },
  { id: "demo-4", name: "Nintendo Switch OLED Weiß", category: "Gaming & Konsolen", status: "Auf Lager", created_at: "2026-08-18T16:45:00Z" },
  { id: "demo-5", name: "Sony WH-1000XM5 Noise Cancelling", category: "Audio & Kopfhörer", status: "In Reparatur", created_at: "2026-08-20T09:20:00Z" },
  { id: "demo-6", name: "Fujifilm X-T4 + XF 18-55mm Kit", category: "Kameras & Foto", status: "Auf Lager", created_at: "2026-08-24T11:00:00Z" },
  { id: "demo-7", name: "Apple Watch Ultra 2 Titan", category: "Smartphones", status: "Auf Lager", created_at: "2026-08-27T15:30:00Z" },

  // July Items
  { id: "demo-8", name: "Canon EOS R6 Mark II", category: "Kameras & Foto", status: "Verkauft", created_at: "2026-07-04T10:00:00Z" },
  { id: "demo-9", name: "PlayStation 5 Disc Edition (Slim)", category: "Gaming & Konsolen", status: "Verkauft", created_at: "2026-07-11T12:00:00Z" },
  { id: "demo-10", name: "iPad Pro 11\" M2 128GB Wi-Fi Space Grau", category: "Laptops & PCs", status: "Verkauft", created_at: "2026-07-16T14:00:00Z" },
  { id: "demo-11", name: "AirPods Max Space Grau", category: "Audio & Kopfhörer", status: "Verkauft", created_at: "2026-07-22T16:00:00Z" },

  // June Items
  { id: "demo-12", name: "Samsung Galaxy S24 Ultra 256GB", category: "Smartphones", status: "Verkauft", created_at: "2026-06-03T10:00:00Z" },
  { id: "demo-13", name: "Steam Deck OLED 512GB", category: "Gaming & Konsolen", status: "Verkauft", created_at: "2026-06-12T12:00:00Z" },
  { id: "demo-14", name: "MacBook Pro 14\" M3 Pro 18GB 512GB", category: "Laptops & PCs", status: "Verkauft", created_at: "2026-06-18T14:00:00Z" },

  // May Items
  { id: "demo-15", name: "Sony FE 24-70mm F2.8 GM II", category: "Kameras & Foto", status: "Verkauft", created_at: "2026-05-05T10:00:00Z" },
  { id: "demo-16", name: "iPhone 14 128GB Mitternacht", category: "Smartphones", status: "Verkauft", created_at: "2026-05-14T12:00:00Z" },
  { id: "demo-17", name: "Xbox Series X 1TB", category: "Gaming & Konsolen", status: "Verkauft", created_at: "2026-05-20T14:00:00Z" },

  // April Items
  { id: "demo-18", name: "DJI Mini 4 Pro Fly More Combo", category: "Kameras & Foto", status: "Verkauft", created_at: "2026-04-06T10:00:00Z" },
  { id: "demo-19", name: "Dell XPS 15 9530 i7 32GB", category: "Laptops & PCs", status: "Verkauft", created_at: "2026-04-15T12:00:00Z" },
  { id: "demo-20", name: "Bose QuietComfort Ultra Headphones", category: "Audio & Kopfhörer", status: "Verkauft", created_at: "2026-04-23T14:00:00Z" },

  // March Items
  { id: "demo-21", name: "iPhone 13 Pro 128GB Sierrablau", category: "Smartphones", status: "Verkauft", created_at: "2026-03-08T10:00:00Z" },
  { id: "demo-22", name: "Nintendo Switch V2 Neon", category: "Gaming & Konsolen", status: "Verkauft", created_at: "2026-03-17T12:00:00Z" },

  // February Items
  { id: "demo-23", name: "MacBook Air M1 8GB 256GB", category: "Laptops & PCs", status: "Verkauft", created_at: "2026-02-10T10:00:00Z" },
  { id: "demo-24", name: "Sony A6400 + 16-50mm", category: "Kameras & Foto", status: "Verkauft", created_at: "2026-02-21T12:00:00Z" },

  // January Items
  { id: "demo-25", name: "PlayStation 5 Digital Edition", category: "Gaming & Konsolen", status: "Verkauft", created_at: "2026-01-12T10:00:00Z" },
  { id: "demo-26", name: "iPad Air 5 M1 64GB Blau", category: "Laptops & PCs", status: "Verkauft", created_at: "2026-01-20T12:00:00Z" }
];

export const DEMO_TRANSACTIONS = [
  // --- August 2026 ---
  { id: "tx-1", item_id: "demo-1", type: "Einkauf", amount: 680.00, platform: "eBay Kleinanzeigen", date: "2026-08-02", notes: "Wie neu, 100% Akku", items: { name: "iPhone 15 Pro 128GB Titan Natur", category: "Smartphones" } },
  { id: "tx-2", item_id: "demo-1", type: "Verkauf", amount: 930.00, platform: "Vinted", date: "2026-08-09", notes: "Schneller Verkauf", items: { name: "iPhone 15 Pro 128GB Titan Natur", category: "Smartphones" } },

  { id: "tx-3", item_id: "demo-2", type: "Einkauf", amount: 1450.00, platform: "eBay Kleinanzeigen", date: "2026-08-05", notes: "OVP & Rechnung dabei", items: { name: "Sony Alpha 7 IV Body", category: "Kameras & Foto" } },
  { id: "tx-4", item_id: "demo-2", type: "Verkauf", amount: 1890.00, platform: "eBay", date: "2026-08-16", notes: "Sofortkauf", items: { name: "Sony Alpha 7 IV Body", category: "Kameras & Foto" } },

  { id: "tx-5", item_id: "demo-3", type: "Einkauf", amount: 850.00, platform: "Privat", date: "2026-08-12", notes: "Akku bei 98%", items: { name: "MacBook Air M2 16GB 512GB Mitternacht", category: "Laptops & PCs" } },
  { id: "tx-6", item_id: "demo-3", type: "Verkauf", amount: 1190.00, platform: "eBay", date: "2026-08-28", notes: "Versandlabel erstellt", items: { name: "MacBook Air M2 16GB 512GB Mitternacht", category: "Laptops & PCs" } },

  { id: "tx-7", item_id: "demo-4", type: "Einkauf", amount: 190.00, platform: "eBay Kleinanzeigen", date: "2026-08-18", notes: "Joycon Drift", items: { name: "Nintendo Switch OLED Weiß", category: "Gaming & Konsolen" } },
  { id: "tx-8", item_id: "demo-4", type: "Reparaturkosten", amount: 15.00, platform: "Amazon", date: "2026-08-19", notes: "Ersatzstick Hall Effect", items: { name: "Nintendo Switch OLED Weiß", category: "Gaming & Konsolen" } },

  { id: "tx-9", item_id: "demo-5", type: "Einkauf", amount: 130.00, platform: "Vinted", date: "2026-08-20", notes: "Polster abgenutzt", items: { name: "Sony WH-1000XM5 Noise Cancelling", category: "Audio & Kopfhörer" } },
  { id: "tx-10", item_id: "demo-5", type: "Reparaturkosten", amount: 18.50, platform: "Amazon", date: "2026-08-22", notes: "Neue Polster", items: { name: "Sony WH-1000XM5 Noise Cancelling", category: "Audio & Kopfhörer" } },

  { id: "tx-11", item_id: "demo-6", type: "Einkauf", amount: 890.00, platform: "eBay Kleinanzeigen", date: "2026-08-24", notes: "2 Zusatzakkus", items: { name: "Fujifilm X-T4 + XF 18-55mm Kit", category: "Kameras & Foto" } },
  { id: "tx-12", item_id: "demo-7", type: "Einkauf", amount: 540.00, platform: "eBay", date: "2026-08-27", notes: "Top Zustand", items: { name: "Apple Watch Ultra 2 Titan", category: "Smartphones" } },
  { id: "tx-13", item_id: null, type: "Werkzeuge/Sonstiges", amount: 34.90, platform: "Amazon", date: "2026-08-10", notes: "50x Luftpolstertaschen & Etiketten", category: null },

  // --- July 2026 ---
  { id: "tx-14", item_id: "demo-8", type: "Einkauf", amount: 1600.00, platform: "eBay Kleinanzeigen", date: "2026-07-04", notes: "Originalverpackung", items: { name: "Canon EOS R6 Mark II", category: "Kameras & Foto" } },
  { id: "tx-15", item_id: "demo-8", type: "Verkauf", amount: 2080.00, platform: "eBay", date: "2026-07-15", notes: "Guter Gewinn", items: { name: "Canon EOS R6 Mark II", category: "Kameras & Foto" } },
  { id: "tx-16", item_id: "demo-9", type: "Einkauf", amount: 320.00, platform: "Kleinanzeigen", date: "2026-07-11", notes: "Mit 2 Controllern", items: { name: "PlayStation 5 Disc Edition (Slim)", category: "Gaming & Konsolen" } },
  { id: "tx-17", item_id: "demo-9", type: "Verkauf", amount: 440.00, platform: "Kleinanzeigen", date: "2026-07-19", notes: "Barzahlung bei Abholung", items: { name: "PlayStation 5 Disc Edition (Slim)", category: "Gaming & Konsolen" } },
  { id: "tx-18", item_id: "demo-10", type: "Einkauf", amount: 520.00, platform: "Vinted", date: "2026-07-16", notes: "Sehr gepflegt", items: { name: "iPad Pro 11\" M2 128GB Wi-Fi Space Grau", category: "Laptops & PCs" } },
  { id: "tx-19", item_id: "demo-10", type: "Verkauf", amount: 690.00, platform: "eBay", date: "2026-07-28", notes: "Inklusive Case", items: { name: "iPad Pro 11\" M2 128GB Wi-Fi Space Grau", category: "Laptops & PCs" } },
  { id: "tx-20", item_id: "demo-11", type: "Einkauf", amount: 290.00, platform: "eBay Kleinanzeigen", date: "2026-07-22", notes: "Gereinigt", items: { name: "AirPods Max Space Grau", category: "Audio & Kopfhörer" } },
  { id: "tx-21", item_id: "demo-11", type: "Verkauf", amount: 420.00, platform: "Vinted", date: "2026-07-31", notes: "Versand nach AT", items: { name: "AirPods Max Space Grau", category: "Audio & Kopfhörer" } },
  { id: "tx-22", item_id: null, type: "Werkzeuge/Sonstiges", amount: 22.50, platform: "Amazon", date: "2026-07-14", notes: "Paketband & Kartons", category: null },

  // --- June 2026 ---
  { id: "tx-23", item_id: "demo-12", type: "Einkauf", amount: 720.00, platform: "Kleinanzeigen", date: "2026-06-03", notes: "Rechnung von Mai", items: { name: "Samsung Galaxy S24 Ultra 256GB", category: "Smartphones" } },
  { id: "tx-24", item_id: "demo-12", type: "Verkauf", amount: 960.00, platform: "eBay", date: "2026-06-14", notes: "Top Marge", items: { name: "Samsung Galaxy S24 Ultra 256GB", category: "Smartphones" } },
  { id: "tx-25", item_id: "demo-13", type: "Einkauf", amount: 380.00, platform: "Vinted", date: "2026-06-12", notes: "Wie neu", items: { name: "Steam Deck OLED 512GB", category: "Gaming & Konsolen" } },
  { id: "tx-26", item_id: "demo-13", type: "Verkauf", amount: 490.00, platform: "Kleinanzeigen", date: "2026-06-21", notes: "Abholung", items: { name: "Steam Deck OLED 512GB", category: "Gaming & Konsolen" } },
  { id: "tx-27", item_id: "demo-14", type: "Einkauf", amount: 1350.00, platform: "eBay Kleinanzeigen", date: "2026-06-18", notes: "AppleCare+", items: { name: "MacBook Pro 14\" M3 Pro 18GB 512GB", category: "Laptops & PCs" } },
  { id: "tx-28", item_id: "demo-14", type: "Verkauf", amount: 1750.00, platform: "eBay", date: "2026-06-29", notes: "Schneller Käufer", items: { name: "MacBook Pro 14\" M3 Pro 18GB 512GB", category: "Laptops & PCs" } },

  // --- May 2026 ---
  { id: "tx-29", item_id: "demo-15", type: "Einkauf", amount: 1400.00, platform: "Kleinanzeigen", date: "2026-05-05", notes: "Keine Kratzer", items: { name: "Sony FE 24-70mm F2.8 GM II", category: "Kameras & Foto" } },
  { id: "tx-30", item_id: "demo-15", type: "Verkauf", amount: 1780.00, platform: "eBay", date: "2026-05-18", notes: "Top Objektiv", items: { name: "Sony FE 24-70mm F2.8 GM II", category: "Kameras & Foto" } },
  { id: "tx-31", item_id: "demo-16", type: "Einkauf", amount: 410.00, platform: "Vinted", date: "2026-05-14", notes: "Gehäusekratzer", items: { name: "iPhone 14 128GB Mitternacht", category: "Smartphones" } },
  { id: "tx-32", item_id: "demo-16", type: "Verkauf", amount: 560.00, platform: "Vinted", date: "2026-05-25", notes: "Guter Deal", items: { name: "iPhone 14 128GB Mitternacht", category: "Smartphones" } },
  { id: "tx-33", item_id: "demo-17", type: "Einkauf", amount: 290.00, platform: "Kleinanzeigen", date: "2026-05-20", notes: "Lüfter gereinigt", items: { name: "Xbox Series X 1TB", category: "Gaming & Konsolen" } },
  { id: "tx-34", item_id: "demo-17", type: "Verkauf", amount: 395.00, platform: "Kleinanzeigen", date: "2026-05-30", notes: "Bar bezahlt", items: { name: "Xbox Series X 1TB", category: "Gaming & Konsolen" } },

  // --- April 2026 ---
  { id: "tx-35", item_id: "demo-18", type: "Einkauf", amount: 560.00, platform: "eBay Kleinanzeigen", date: "2026-04-06", notes: "3 Akkus & Tasche", items: { name: "DJI Mini 4 Pro Fly More Combo", category: "Kameras & Foto" } },
  { id: "tx-36", item_id: "demo-18", type: "Verkauf", amount: 780.00, platform: "eBay", date: "2026-04-18", notes: "Drohne verkauft", items: { name: "DJI Mini 4 Pro Fly More Combo", category: "Kameras & Foto" } },
  { id: "tx-37", item_id: "demo-19", type: "Einkauf", amount: 820.00, platform: "eBay", date: "2026-04-15", notes: "OLED Display", items: { name: "Dell XPS 15 9530 i7 32GB", category: "Laptops & PCs" } },
  { id: "tx-38", item_id: "demo-19", type: "Verkauf", amount: 1100.00, platform: "Kleinanzeigen", date: "2026-04-27", notes: "Top Workstation", items: { name: "Dell XPS 15 9530 i7 32GB", category: "Laptops & PCs" } },
  { id: "tx-39", item_id: "demo-20", type: "Einkauf", amount: 190.00, platform: "Vinted", date: "2026-04-23", notes: "Kopfhörer OVP", items: { name: "Bose QuietComfort Ultra Headphones", category: "Audio & Kopfhörer" } },
  { id: "tx-40", item_id: "demo-20", type: "Verkauf", amount: 280.00, platform: "Vinted", date: "2026-04-30", notes: "Sehr gefragt", items: { name: "Bose QuietComfort Ultra Headphones", category: "Audio & Kopfhörer" } },

  // --- March 2026 ---
  { id: "tx-41", item_id: "demo-21", type: "Einkauf", amount: 430.00, platform: "Kleinanzeigen", date: "2026-03-08", notes: "Display getauscht", items: { name: "iPhone 13 Pro 128GB Sierrablau", category: "Smartphones" } },
  { id: "tx-42", item_id: "demo-21", type: "Verkauf", amount: 590.00, platform: "eBay", date: "2026-03-22", notes: "Verkauft", items: { name: "iPhone 13 Pro 128GB Sierrablau", category: "Smartphones" } },
  { id: "tx-43", item_id: "demo-22", type: "Einkauf", amount: 120.00, platform: "Kleinanzeigen", date: "2026-03-17", notes: "Günstiges Bundle", items: { name: "Nintendo Switch V2 Neon", category: "Gaming & Konsolen" } },
  { id: "tx-44", item_id: "demo-22", type: "Verkauf", amount: 195.00, platform: "Kleinanzeigen", date: "2026-03-28", notes: "Inklusive Mario Kart", items: { name: "Nintendo Switch V2 Neon", category: "Gaming & Konsolen" } },

  // --- February 2026 ---
  { id: "tx-45", item_id: "demo-23", type: "Einkauf", amount: 480.00, platform: "eBay Kleinanzeigen", date: "2026-02-10", notes: "Guter Zustand", items: { name: "MacBook Air M1 8GB 256GB", category: "Laptops & PCs" } },
  { id: "tx-46", item_id: "demo-23", type: "Verkauf", amount: 650.00, platform: "Vinted", date: "2026-02-23", notes: "Verkauft", items: { name: "MacBook Air M1 8GB 256GB", category: "Laptops & PCs" } },
  { id: "tx-47", item_id: "demo-24", type: "Einkauf", amount: 460.00, platform: "eBay", date: "2026-02-21", notes: "Wenig Shutter Count", items: { name: "Sony A6400 + 16-50mm", category: "Kameras & Foto" } },
  { id: "tx-48", item_id: "demo-24", type: "Verkauf", amount: 620.00, platform: "eBay", date: "2026-03-02", notes: "Verkauft nach AT", items: { name: "Sony A6400 + 16-50mm", category: "Kameras & Foto" } },

  // --- January 2026 ---
  { id: "tx-49", item_id: "demo-25", type: "Einkauf", amount: 280.00, platform: "Kleinanzeigen", date: "2026-01-12", notes: "Bundle mit Spielen", items: { name: "PlayStation 5 Digital Edition", category: "Gaming & Konsolen" } },
  { id: "tx-50", item_id: "demo-25", type: "Verkauf", amount: 390.00, platform: "Kleinanzeigen", date: "2026-01-26", notes: "Abholung", items: { name: "PlayStation 5 Digital Edition", category: "Gaming & Konsolen" } },
  { id: "tx-51", item_id: "demo-26", type: "Einkauf", amount: 370.00, platform: "Vinted", date: "2026-01-20", notes: "Mit Apple Pencil 2", items: { name: "iPad Air 5 M1 64GB Blau", category: "Laptops & PCs" } },
  { id: "tx-52", item_id: "demo-26", type: "Verkauf", amount: 510.00, platform: "eBay", date: "2026-02-04", notes: "Verkauft", items: { name: "iPad Air 5 M1 64GB Blau", category: "Laptops & PCs" } },
];
