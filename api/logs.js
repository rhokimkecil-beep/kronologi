export default async function handler(req, res) {
  // Pastikan hanya menerima request GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  // Cek apakah Environment Variables di Vercel udah masuk
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Konfigurasi Supabase di Vercel belum lengkap!' });
  }

  try {
    // Ambil semua data dari tabel locations, urutkan dari yang terbaru
    const response = await fetch(`${SUPABASE_URL}/rest/v1/locations?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    // Kalau Supabase ngasih error, tampilin pesannya
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'Supabase Error: ' + errText });
    }

    const data = await response.json();
    
    // Kirim data ke frontend
    res.status(200).json(data);
  } catch (error) {
    // Tangkap error kalau server mati atau internet bermasalah
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
}
