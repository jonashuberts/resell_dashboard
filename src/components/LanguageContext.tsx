"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "de" | "en";

interface Translations {
  [key: string]: {
    de: string;
    en: string;
  };
}

// Global translation dictionary (can be split into separate files later if it grows too large)
export const translations: Translations = {
  // Navigation
  "nav.dashboard": { de: "Dashboard", en: "Dashboard" },
  "nav.inventory": { de: "Inventar", en: "Inventory" },
  "nav.transactions": { de: "Transaktionen", en: "Transactions" },
  "nav.settings": { de: "Einstellungen", en: "Settings" },

  // Settings Toggle UI
  "settings.language.title": { de: "Sprache", en: "Language" },
  "settings.language.desc": { de: "Wähle die Anzeigesprache des Dashboards aus.", en: "Choose the display language for the dashboard." },
  "settings.language.de": { de: "Deutsch", en: "German" },
  "settings.language.en": { de: "Englisch", en: "English" },

  // Dashboard
  "dashboard.title": { de: "Dashboard", en: "Dashboard" },
  "dashboard.revenue.title": { de: "Gesamteinnahmen", en: "Total Revenue" },
  "dashboard.revenue.trend": { de: "+Einnahmen aus Verkäufen", en: "+Revenue from sales" },
  "dashboard.expenses.title": { de: "Gesamtausgaben", en: "Total Expenses" },
  "dashboard.expenses.trend": { de: "-Einkäufe & Reparaturen", en: "-Purchases & Repairs" },
  "dashboard.profit.title": { de: "Netto-Gewinn", en: "Net Profit" },
  "dashboard.profit.trend": { de: "Umsatz minus Ausgaben", en: "Revenue minus expenses" },
  "dashboard.roi.title": { de: "Return on Investment (ROI)", en: "Return on Investment (ROI)" },
  "dashboard.roi.trend": { de: "ø €{{amount}} Profit/Artikel", en: "avg €{{amount}} profit/item" },
  "dashboard.categories.title": { de: "Top Kategorien", en: "Top Categories" },
  "dashboard.categories.sales": { de: "{{count}} Verkäufe", en: "{{count}} Sales" },
  "dashboard.categories.margin": { de: "{{margin}}% Marge", en: "{{margin}}% Margin" },
  "dashboard.categories.empty": { de: "Noch keine Verkaufsdaten vorhanden.", en: "No sales data available yet." },
  "dashboard.days.title": { de: "Ø Liegezeit", en: "Avg Days to Sell" },
  "dashboard.days.desc": { de: "Bis zum Verkauf", en: "Until sold" },
  "dashboard.days.unit": { de: "Tage", en: "Days" },
  "dashboard.activity.title": { de: "Verlauf", en: "Activity Feed" },
  "dashboard.activity.viewAll": { de: "Alle ansehen", en: "View all" },
  "dashboard.activity.expense": { de: "Allgemeine Ausgabe", en: "General Expense" },
  "dashboard.activity.unknown": { de: "Unbekannter Artikel", en: "Unknown Item" },
  "dashboard.activity.empty": { de: "Keine aktuellen Transaktionen vorhanden.", en: "No recent transactions available." },
  "dashboard.logistics.title": { de: "Lager & Logistik", en: "Logistics & Stock" },
  "dashboard.logistics.open": { de: "Inventar öffnen", en: "Open Inventory" },
  "dashboard.logistics.value": { de: "Lagerwert", en: "Stock Value" },
  "dashboard.logistics.ship": { de: "Zu Versenden", en: "To Ship" },
  "dashboard.logistics.total": { de: "Gesamte Artikel", en: "Total Items" },
  "dashboard.logistics.sold": { de: "Davon Verkauft", en: "Items Sold" },
  "dashboard.logistics.stock": { de: "Aktueller Bestand", en: "Current Stock" },
  "dashboard.tx.sell": { de: "Verkauf", en: "Sale" },
  "dashboard.tx.buy": { de: "Einkauf", en: "Purchase" },
  "dashboard.tx.repair": { de: "Reparatur", en: "Repair" },
  "dashboard.tx.other": { de: "Werkzeuge / Sonstiges", en: "Tools / Other" },
  "dashboard.chart.empty": { de: "Keine Daten für Diagramm verfügbar.", en: "No data available for chart." },
  "dashboard.chart.revenue": { de: "Einnahmen", en: "Revenue" },
  "dashboard.chart.expenses": { de: "Ausgaben", en: "Expenses" },
  "dashboard.cashflow.title": { de: "Cashflow Übersicht", en: "Cashflow Overview" },
  
  // Filters
  "filter.category.all": { de: "Alle Kategorien", en: "All Categories" },
  "filter.time.all": { de: "Gesamte Zeit", en: "All Time" },
  "filter.time.year": { de: "Dieses Jahr", en: "This Year" },
  "filter.time.last_year": { de: "Letztes Jahr", en: "Last Year" },
  "filter.time.month": { de: "Dieser Monat", en: "This Month" },
  "filter.search": { de: "Suchen nach Name...", en: "Search by name..." },
  "filter.status.all": { de: "Alle Status", en: "All Statuses" },

  // Sell Button
  "sell.button": { de: "Verkaufen", en: "Sell" },
  "sell.modal.title": { de: "Artikel verkaufen", en: "Sell Item" },
  "sell.modal.desc1": { de: "Verkauf erfassen für:", en: "Record sale for:" },
  "sell.modal.desc2": { de: "Der Status wird automatisch aktualisiert.", en: "The status will be updated automatically." },
  "sell.price": { de: "Verkaufspreis (€)", en: "Selling Price (€)" },
  "sell.platform": { de: "Verkauft über", en: "Sold via" },
  "sell.platform.none": { de: "-- Keine --", en: "-- None --" },
  "sell.date": { de: "Verkaufsdatum", en: "Sale Date" },
  "sell.cancel": { de: "Abbrechen", en: "Cancel" },
  "sell.submit": { de: "Verkauf buchen", en: "Record Sale" },
  "sell.error.amount": { de: "Bitte gib einen gültigen Betrag ein.", en: "Please enter a valid amount." },
  "sell.error.process": { de: "Fehler beim Verkaufsprozess.", en: "Error processing sale." },

  // Inventory
  "inventory.title": { de: "Inventar", en: "Inventory" },
  "inventory.desc": { de: "Verwalte deine Artikel, Einkäufe und den aktuellen Bestand.", en: "Manage your items, purchases, and current stock." },
  "inventory.newItem": { de: "Neuer Artikel", en: "New Item" },
  "inventory.table.name": { de: "Name", en: "Name" },
  "inventory.table.category": { de: "Kategorie", en: "Category" },
  "inventory.table.status": { de: "Status", en: "Status" },
  "inventory.table.actions": { de: "Aktionen", en: "Actions" },
  "inventory.table.details": { de: "Detail-Akte", en: "Details" },
  "inventory.table.empty": { de: "Keine passenden Artikel gefunden.", en: "No matching items found." },

  // New Item / Forms
  "item.new.title": { de: "Neuer Artikel", en: "New Item" },
  "item.new.desc": { de: "Erfasse ein neues Gerät oder Zubehör für dein Inventar.", en: "Record a new device or accessory for your inventory." },
  "item.form.error.required": { de: "Name und Kategorie sind Pflichtfelder.", en: "Name and Category are required." },
  "item.form.error.general": { de: "Ein Fehler ist aufgetreten.", en: "An error occurred." },
  "item.form.name": { de: "Artikel Name", en: "Item Name" },
  "item.form.name.placeholder": { de: "z.B. Apple Watch Series 8", en: "e.g., Apple Watch Series 8" },
  "item.form.category": { de: "Kategorie", en: "Category" },
  "item.form.category.select": { de: "Aus Liste wählen", en: "Select from list" },
  "item.form.category.new": { de: "+ Neue Kategorie", en: "+ New Category" },
  "item.form.category.placeholder": { de: "z.B. Kamera, Objektiv...", en: "e.g., Camera, Lens..." },
  "item.form.status": { de: "Aktueller Status", en: "Current Status" },
  "item.form.buyPrice": { de: "Einkaufspreis (€)", en: "Purchase Price (€)" },
  "item.form.buyPrice.hint": { de: "(inkl. Versand & Käuferschutz)", en: "(incl. shipping & buyer protection)" },
  "item.form.buyDate": { de: "Kaufdatum", en: "Purchase Date" },
  "item.form.platform": { de: "Gekauft über (Plattform)", en: "Purchased via (Platform)" },
  "item.form.platform.none": { de: "-- Keine --", en: "-- None --" },
  "item.form.sellDetails": { de: "Verkaufsdetails", en: "Sale Details" },
  "item.form.sellPrice": { de: "Verkaufspreis (€)", en: "Selling Price (€)" },
  "item.form.sellPrice.hint": { de: "(abzgl. Gebühren & Versand)", en: "(excl. fees & shipping)" },
  "item.form.sellDate": { de: "Verkaufsdatum", en: "Sale Date" },
  "item.form.notes": { de: "Notizen", en: "Notes" },
  "item.form.notes.placeholder": { de: "Zustand, Fehlteile...", en: "Condition, missing parts..." },
  "item.form.cancel": { de: "Abbrechen", en: "Cancel" },
  "item.form.save": { de: "Artikel speichern", en: "Save Item" },

  // Edit Item Page / Form
  "item.edit.title": { de: "Artikel-Akte: ", en: "Item File: " },
  "item.edit.desc": { de: "Stammdaten, Finanzen und Transaktionen des Artikels.", en: "Master data, finances, and transactions of the item." },
  "item.edit.buy": { de: "Einkauf", en: "Bought" },
  "item.edit.repair": { de: "Reparaturen", en: "Repairs" },
  "item.edit.sell": { de: "Verkauf", en: "Sold" },
  "item.edit.profit": { de: "Ertrag (Gewinn/Verlust)", en: "Profit/Loss" },
  "item.edit.txTitle": { de: "Transaktionen des Artikels", en: "Item Transactions" },
  "item.edit.deleteConfirm": { de: "Bist du sicher, dass du diesen Artikel löschen möchtest? Alle zugehörigen Transaktionen (Einkauf/Verkauf) werden ebenfalls gelöscht.", en: "Are you sure you want to delete this item? All associated transactions (purchases/sales) will also be deleted." },
  "item.edit.deleteError": { de: "Fehler beim Löschen des Artikels.", en: "Error deleting the item." },
  "item.edit.save": { de: "Änderungen speichern", en: "Save Changes" },
  "item.edit.delete": { de: "Artikel endgültig löschen", en: "Delete Item Permanently" },

  // Placeholders
  "item.form.placeholder.name": { de: "z.B. iPhone 13 Pro", en: "e.g., iPhone 13 Pro" },
  "item.form.placeholder.purchasePrice": { de: "z.B. 450", en: "e.g., 450" },
  "item.form.placeholder.salePrice": { de: "z.B. 600", en: "e.g., 600" },
  "item.form.placeholder.newCategory": { de: "z.B. Smartphones", en: "e.g., Smartphones" },
  "settings.cat.placeholder": { de: "z.B. iPhone", en: "e.g., iPhone" },
  "settings.stat.placeholder": { de: "z.B. Für Export reserviert", en: "e.g., Reserved for export" },

  // Item Transactions
  "item.tx.error.amount": { de: "Bitte gib einen gültigen Betrag ein.", en: "Please enter a valid amount." },
  "item.tx.error.add": { de: "Fehler beim Hinzufügen der Ausgabe.", en: "Error adding the expense." },
  "item.tx.deleteConfirm": { de: "Wirklich löschen? Dies aktualisiert auch die Gewinnrechnung.", en: "Really delete? This also updates the profit calculation." },
  "item.tx.deleteError": { de: "Fehler beim Löschen der Transaktion.", en: "Error deleting the transaction." },
  "item.tx.addBtn": { de: "Ausgabe hinzufügen (Reparatur/Ersatzteil)", en: "Add Expense (Repair/Spare Part)" },
  "item.tx.addTitle": { de: "Neue Ausgabe erfassen", en: "Record New Expense" },
  "item.tx.type": { de: "Typ", en: "Type" },
  "item.tx.type.repair": { de: "Reparaturkosten / Ersatzteil", en: "Repair Costs / Spare Part" },
  "item.tx.type.other": { de: "Versand / Sonstiges", en: "Shipping / Other" },
  "item.tx.amount": { de: "Betrag (€)", en: "Amount (€)" },
  "item.tx.date": { de: "Datum", en: "Date" },
  "item.tx.notes.placeholder": { de: "z.B. Ladekabel", en: "e.g., Charging Cable" },
  "item.tx.save": { de: "Speichern", en: "Save" },
  "item.tx.empty": { de: "Keine Transaktionen für diesen Artikel gefunden.", en: "No transactions found for this item." },
  "item.tx.via": { de: "via ", en: "via " },

  // Transactions Page
  "tx.title": { de: "Transaktionen", en: "Transactions" },
  "tx.desc": { de: "Alle Ein- und Ausgaben im Überblick.", en: "Overview of all income and expenses." },
  "tx.table.date": { de: "Datum", en: "Date" },
  "tx.table.itemNote": { de: "Artikel / Notiz", en: "Item / Note" },
  "tx.table.typePlatform": { de: "Typ & Plattform", en: "Type & Platform" },
  "tx.table.amount": { de: "Betrag", en: "Amount" },
  "tx.table.actions": { de: "Aktionen", en: "Actions" },
  "tx.table.generalExpense": { de: "Allgemeine Ausgabe", en: "General Expense" },
  "tx.table.empty": { de: "Keine Transaktionen gefunden.", en: "No transactions found." },
  "tx.filter.search": { de: "Suchen...", en: "Search..." },
  "tx.filter.type.all": { de: "Alle Typen", en: "All Types" },

  "tx.add.error": { de: "Fehler beim Hinzufügen. Wenn du Kategorien nutzt, musst du erst in Supabase die Spalte 'category' hinzufügen.", en: "Error adding. If using categories, make sure to add the 'category' column in Supabase first." },
  "tx.add.btn": { de: "Allgemeine Ausgabe", en: "General Expense" },
  "tx.add.title": { de: "Allgemeine Ausgabe erfassen", en: "Record General Expense" },
  "tx.add.desc": { de: "Hier kannst du Ausgaben erfassen, die keinem bestimmten Artikel zugeordnet sind (z.B. Versandkartons, Etiketten, Werkzeug).", en: "Record expenses not tied to a specific item (e.g., shipping boxes, labels, tools)." },
  "tx.add.notes.placeholder": { de: "z.B. 50x Versandkartons Groß", en: "e.g., 50x Large Shipping Boxes" },
  "tx.add.category.none": { de: "-- Keine Kategorie --", en: "-- No Category --" },
  "tx.add.save": { de: "Ausgabe speichern", en: "Save Expense" },
  
  "tx.edit.error": { de: "Fehler beim Bearbeiten der Transaktion. Hast du die Spalte 'category' schon in Supabase hinzugefügt?", en: "Error editing transaction. Have you added the 'category' column in Supabase?" },
  "tx.edit.btn": { de: "Transaktion bearbeiten", en: "Edit Transaction" },

  // Settings
  "settings.title": { de: "Einstellungen", en: "Settings" },
  "settings.desc": { de: "Passe Dropdowns, Status-Labels und Kategorien für dein Dashboard an.", en: "Customize dropdowns, status labels, and categories for your dashboard." },
  "settings.db.title": { de: "Datenbank-Update erforderlich", en: "Database Update Required" },
  "settings.db.desc": { de: "Damit diese Einstellungen funktionieren, muss ein kleines Schema-Update in deiner Supabase Datenbank ausgeführt werden. Bitte kopiere den folgenden SQL-Code und führe ihn im SQL Editor in Supabase aus (wie beim ersten Mal):", en: "For these settings to work, a small schema update must be run in your Supabase DB. Please copy the SQL code below and run it in the SQL Editor in Supabase:" },
  "settings.db.hint": { de: "Lade diese Seite einfach neu, sobald du das SQL-Skript ausgeführt hast.", en: "Simply reload this page once you've executed the SQL script." },

  "settings.cat.error.delete": { de: "Fehler beim Löschen der Kategorie.", en: "Error deleting the category." },
  "settings.cat.error.rename": { de: "Fehler beim Umbenennen. Vielleicht existiert der Name schon?", en: "Error renaming. Maybe the name already exists?" },
  "settings.cat.title": { de: "Kategorien verwalten", en: "Manage Categories" },
  "settings.cat.desc": { de: "Hier legst du fest, in welcher Reihenfolge Kategorien erscheinen und welche Farbe sie haben. Du kannst alte Kategorien umbenennen, löschen oder einfärben.", en: "Here you can set the order and colors for categories. You can rename, delete, or recolor existing categories." },
  "settings.cat.renameHint": { de: "Klicken zum Umbenennen", en: "Click to rename" },
  "settings.cat.deleteHint": { de: "Kategorie löschen", en: "Delete Category" },
  "settings.cat.empty": { de: "Keine Kategorien angelegt.", en: "No categories created." },
  "settings.cat.newName": { de: "Neue Kategorie Name", en: "New Category Name" },
  "settings.cat.design": { de: "Design", en: "Design" },
  "settings.addBtn": { de: "Hinzufügen", en: "Add" },
  "settings.cat.deleteConfirm": { de: "Alle Artikel in dieser Kategorie werden auf 'Keine Kategorie' gesetzt. Fortfahren?", en: "All items in this category will be set to 'No Category'. Continue?" },

  "settings.stat.error.systemDelete": { de: "System-Status können nicht gelöscht werden.", en: "System statuses cannot be deleted." },
  "settings.stat.deleteConfirm": { de: "Zugeordnete Artikel fallen evtl. auf leere Werte zurück. Fortfahren?", en: "Assigned items may fall back to empty values. Continue?" },
  "settings.stat.title": { de: "Eigene Status-Labels hinzufügen", en: "Add Custom Status Labels" },
  "settings.stat.desc": { de: "Die Buttons 'Auf Lager' und 'Verkauft' sind fest im Dashboard verankert. Du kannst aber eigene Custom-Status anlegen (wie z.B. 'Unterwegs', 'Ersatzteillager') und ihnen eine bestimmte Farbe geben.", en: "The 'In Stock' and 'Sold' labels are fixed. But you can add your own custom statuses (e.g., 'En Route', 'Parts Bin') and assign them custom colors." },
  "settings.stat.system": { de: "(System)", en: "(System)" },
  "settings.stat.newName": { de: "Neuer Custom Status Name", en: "New Custom Status Name" },
  "settings.stat.color": { de: "Farbe", en: "Color" },

  // Colors
  "color.gray": { de: "Grau", en: "Gray" },
  "color.blue": { de: "Blau", en: "Blue" },
  "color.green": { de: "Grün", en: "Green" },
  "color.yellow": { de: "Gelb", en: "Yellow" },
  "color.orange": { de: "Orange", en: "Orange" },
  "color.red": { de: "Rot", en: "Red" },
  "color.purple": { de: "Lila", en: "Purple" },
  "color.cyan": { de: "Cyan", en: "Cyan" },

  // Data Export Feature
  "settings.export.title": { de: "Daten exportieren", en: "Export Data" },
  "settings.export.desc": { de: "Lade dein gesamtes Inventar und alle Transaktionen als CSV-Dateien für ein Backup herunter.", en: "Download your entire inventory and all transactions as CSV files for a backup." },
  "settings.export.btn": { de: "CSV Backup herunterladen", en: "Download CSV Backup" },
  "settings.export.loading": { de: "Export wird vorbereitet...", en: "Preparing export..." },
  "settings.export.error": { de: "Fehler beim Exportieren der Daten.", en: "Error exporting data." },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    const storedLang = localStorage.getItem("resell_language") as Language | null;
    if (storedLang && (storedLang === "de" || storedLang === "en")) {
      setLanguageState(storedLang);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("resell_language", lang);
  };

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language] || key;
  };

  // Prevent hydration mismatch by not rendering until we have loaded the value from localStorage
  if (!mounted) {
    return <div className="min-h-screen bg-zinc-950" />; // Render empty background while loading to prevent flash
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
