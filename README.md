# ⚓ TorpedoClash.io - Multiplayer Taktiksel Deniz Savaşı

Agar.io büyüme mekanikleri, arcade shooter dinamikleri ve mk48.io'nun stratejik torpido gerilimini birleştiren gerçek zamanlı deniz savaşı oyunu.

---

## 🎮 Kontroller

* **Fare Hareketi:** Dümen yönü ve taret nişan alma
* **Sol Tık:** Ana top bataryası ateşi
* **Sağ Tık veya Boşluk Tuşu:** **Ölümcül Torpido** fırlatma
* **Shift veya W Tuşu:** Hız takviyesi (Boost)

---

## 🚢 Gemi Sınıfları & Gelişme Basamakları

1. **Tier 1 - PT-Boat (Devriye Torpido Botu):** Hızlı, çevik, 1 adet ölümcül torpido.
2. **Tier 2 - Korvet:** Çift top bataryası, 2'li torpido salvosu.
3. **Tier 3 - Muhrip:** Yüksek dayanıklılık, ağır toplar, 3'lü yaylım torpido salvosu.
4. **Tier 4 - Zırhlı (Dreadnought):** Devasa zırh ve 3'lü ağır top kuleleri, 4'lü torpido salvosu.
   * ⚠️ **mk48 Kuralı:** En güçlü zırhlı bile olsanız, küçük bir torpido botundan gelen **2-3 isabetli torpido** geminizi anında batırır!

---

## 🚀 Yerel Olarak Çalıştırma

Terminalden proje klasöründe şu komutu verin:

```bash
npm start
```

Tarayıcınızda açın:
```
http://localhost:3000
```

---

## 🌐 Ücretsiz Canlıya Yayınlama Rehberi (Render.com)

1. Bu klasörü bir **GitHub** reposuna yükleyin (`git init`, `git add .`, `git commit -m "init"`, `git push`).
2. [Render.com](https://render.com)'a ücretsiz üye olup **New > Web Service** seçin.
3. GitHub reponuzu seçin.
4. Ayarları şu şekilde bırakın:
   * **Runtime:** Node
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
5. **Create Web Service** butonuna basın. 1-2 dakika içinde oyununuz `https://projeniz.onrender.com` adresiyle tüm dünyaya açılacaktır!
