const provinceSelect = document.getElementById("province");
const citySelect = document.getElementById("city");
const weatherResult = document.getElementById("weatherResult");
const locationText = document.getElementById("location");
const tempText = document.getElementById("temperature");
const conditionText = document.getElementById("condition");
const geminiPrediction = document.getElementById("geminiPrediction");

const API_BASE = "https://weather-predictor-server.onrender.com"; // Ganti setelah deploy server

async function loadProvinces() {
  const res = await fetch("https://ibnux.github.io/BMKG-importer/cuaca/wilayah.json");
  const provinces = await res.json();
  const uniqueProvinces = [...new Set(provinces.map(p => p.propinsi))];
  provinceSelect.innerHTML = `<option value="">-- Pilih Provinsi --</option>`;
  uniqueProvinces.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    provinceSelect.appendChild(opt);
  });
  provinceSelect.addEventListener("change", () => {
    const filteredCities = provinces.filter(c => c.propinsi === provinceSelect.value);
    citySelect.innerHTML = `<option value="">-- Pilih Kota/Kabupaten --</option>`;
    filteredCities.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.kota;
      citySelect.appendChild(opt);
    });
  });
}

document.getElementById("getWeather").addEventListener("click", async () => {
  const cityId = citySelect.value;
  if (!cityId) return alert("Pilih kota dulu!");

  const res = await fetch(`${API_BASE}/api/weather/${cityId}`);
  const data = await res.json();
  const latest = data[0];

  locationText.textContent = latest.kota;
  tempText.textContent = `Suhu: ${latest.tempC}°C`;
  conditionText.textContent = `Kondisi: ${latest.cuaca}`;
  weatherResult.classList.remove("hidden");

  const aiRes = await fetch(`${API_BASE}/api/gemini`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: `Berdasarkan data BMKG: suhu ${latest.tempC}°C, kondisi ${latest.cuaca}. Buat ringkasan singkat untuk masyarakat Indonesia.`,
    }),
  });
  const aiData = await aiRes.json();
  geminiPrediction.textContent = "🌤️ AI Insight: " + (aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada data AI");
});

loadProvinces();
