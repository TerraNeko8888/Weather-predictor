
const provinceSelect = document.getElementById("province");
const citySelect = document.getElementById("city");
const weatherResult = document.getElementById("weatherResult");
const locationText = document.getElementById("location");
const tempText = document.getElementById("temperature");
const conditionText = document.getElementById("condition");
const geminiPrediction = document.getElementById("geminiPrediction");
const geminiKeyInput = document.getElementById("geminiKey");

async function loadProvinces() {
  try {
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
  } catch (err) {
    console.error("Gagal memuat wilayah:", err);
  }
}

document.getElementById("getWeather").addEventListener("click", async () => {
  const cityId = citySelect.value;
  const geminiKey = geminiKeyInput.value;
  if (!cityId) return alert("Pilih kota/kabupaten dulu!");

  try {
    const res = await fetch(`https://ibnux.github.io/BMKG-importer/cuaca/${cityId}.json`);
    const data = await res.json();
    const latest = data[0];
    locationText.textContent = latest.kota;
    tempText.textContent = `Suhu: ${latest.tempC}°C`;
    conditionText.textContent = `Kondisi: ${latest.cuaca}`;
    weatherResult.classList.remove("hidden");

    if (geminiKey) {
      const prompt = `Berdasarkan data BMKG: suhu ${latest.tempC}°C, kondisi ${latest.cuaca}. Buat ringkasan singkat untuk masyarakat Indonesia.`;
      const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const aiData = await aiResponse.json();
      geminiPrediction.textContent = "🌤️ AI Insight: " + (aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada prediksi");
    } else {
      geminiPrediction.textContent = "Masukkan API Key Gemini untuk menampilkan analisis AI.";
    }
  } catch (err) {
    console.error("Gagal mengambil data:", err);
    alert("Gagal mengambil data cuaca!");
  }
});

loadProvinces();
