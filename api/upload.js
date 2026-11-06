export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { lat, lon, photo, kronologi } = req.body;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  try {
    let alamat = "Alamat tidak ditemukan";
    
    // 1. Coba ambil alamat (dibatesin 5 detik biar gak nge-hang)
    try {
      const osmRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
        headers: { 'User-Agent': 'PortalLaporan/1.0' },
        signal: AbortSignal.timeout(5000) 
      });
      if (osmRes.ok) {
        const osmData = await osmRes.json();
        alamat = osmData.display_name || alamat;
      }
    } catch (e) {
      console.log("Gagal ambil alamat, lanjut simpen koordinat aja.");
    }

    // 2. Simpan ke Supabase
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
      return res.status(500).json({ status: 'error', message: `Database Error: ${errText}` });
    }

    res.status(200).json({ status: 'success', message: 'Data tersimpan' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: `Server Error: ${error.message}` });
  }
}
