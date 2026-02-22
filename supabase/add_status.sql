INSERT INTO status_settings (name, color) VALUES 
('Verkauft (Muss versendet werden)', 'bg-purple-500/10 text-purple-400 border border-purple-500/20'),
('Versendet', 'bg-blue-500/10 text-blue-400 border border-blue-500/20'),
('Angekommen (Abgeschlossen)', 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'),
('Reklamation/Support', 'bg-rose-500/10 text-rose-400 border border-rose-500/20')
ON CONFLICT DO NOTHING;
