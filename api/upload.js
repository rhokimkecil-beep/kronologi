export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { lat, lon, kronologi } = req.body;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ status: 'error', message: 'API Key Supabase belum diisi di Vercel!' });
  }

  try {
    // Langsung simpan ke Supabase tanpa nanya alamat ke API luar
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
        address: "Lihat di Google Maps",
        kronologi: kronologi
      })
    });

    if (!dbRes.ok) {
      const errText = await dbRes.text();
      return res.status(500).json({ status: 'error', message: `Database Nolak: ${errText}` });
    }

    res.status(200).json({ status: 'success', message: 'Data tersimpan' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: `Koneksi DB Gagal: ${error.message}` });
  }
}
