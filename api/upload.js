export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { lat, lon, photo, kronologi } = req.body;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  let alamat = "Alamat tidak tersedia (API Timeout)";

  // 1. Coba ambil alamat pake timeout 4 detik
  try {
    const osmRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
      headers: { 'User-Agent': 'PortalLaporan/1.0' },
      signal: AbortSignal.timeout(4000) // Maksimal tunggu 4 detik
    });
    if (osmRes.ok) {
      const osmData = await osmRes.json();
      alamat = osmData.display_name || alamat;
    }
  } catch (e) {
    console.log("Gagal dapet alamat peta, lanjut simpen koordinat.");
  }

  // 2. Simpan ke Supabase (Ini yang WAJIB jalan)
  try {
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/locations`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ 
        latitude: lat, 
        longitude: lon, 
        address: alamat,
        photo: photo,
        kronologi: kronologi
      })
    });

    if (!dbRes.ok) {
      const errText = await dbRes.text();
      console.log("Error dari Supabase:", errText);
      return res.status(500).json({ status: 'error', message: `Database Nolak: ${errText}` });
    }

    res.status(200).json({ status: 'success', message: 'Data tersimpan' });
  } catch (error) {
    console.log("Error koneksi ke Supabase:", error.message);
    return res.status(500).json({ status: 'error', message: `Koneksi DB Gagal: ${error.message}` });
  }
}
