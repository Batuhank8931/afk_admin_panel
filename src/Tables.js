import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./Header";
import "./Tables.css"; // Import a CSS file for custom styles

const downloadObjectAsTxt = (obj, filename) => {
  const element = document.createElement("a");
  const text = Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  const file = new Blob([text], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = `${filename}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

function Tables() {
  const [showBireysel, setShowBireysel] = useState(true);
  const [bireyselData, setBireyselData] = useState([]);
  const [tuzelData, setTuzelData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const [fileLinks, setFileLinks] = useState([]);

  useEffect(() => {
    fetch("https://direct.afkmotorsfinans.com/get_bireysel.php")
      .then((response) => response.json())
      .then((data) => setBireyselData(data))
      .catch((error) => console.error("Error fetching Bireysel data:", error));

    fetch("https://direct.afkmotorsfinans.com/get_tuzel.php")
      .then((response) => response.json())
      .then((data) => setTuzelData(data))
      .catch((error) => console.error("Error fetching Tuzel data:", error));
  }, []);

  const handleDownload = async (directory) => {
    try {
      // POST request to get the list of files
      const response = await fetch(
        "https://direct.afkmotorsfinans.com/download_all.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            directory: directory,
          }),
        }
      );

      const data = await response.json();

      if (!data || data.status === "error") {
        console.error(data ? data.message : "No data returned");
        return;
      }

      // Function to download each file
      const downloadFile = async (file) => {
        const formData = new URLSearchParams();
        formData.append("directory", directory);
        formData.append("file", file.file);

        const fileResponse = await fetch(
          "https://direct.afkmotorsfinans.com/download.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
          }
        );

        if (!fileResponse.ok) {
          console.error(`Failed to download file: ${file.file}`);
          return;
        }

        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = file.file;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      };

      // Download each file one by one
      for (const file of data) {
        if (!file || !file.file) {
          console.error("Invalid file data:", file);
          continue;
        }

        await downloadFile(file);
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
    }
  };

  const sortData = (data, setData, key) => {
    let sortedData = [...data];
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      sortedData.reverse();
      setSortConfig({ key, direction: "descending" });
    } else {
      sortedData.sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
      });
      setSortConfig({ key, direction: "ascending" });
    }
    setData(sortedData);
  };

  const filteredBireyselData = bireyselData.filter((item) =>
    Object.values(item).some((val) =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredTuzelData = tuzelData.filter((item) =>
    Object.values(item).some((val) =>
      val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const renderHeader = (key, displayName) => (
    <th className={`column-${key} ${key === "id" ? "frozen-col" : ""}`}>
      <div className="d-flex align-items-center">
        {displayName}
        <button
          className="btn btn-link p-0 ms-1 d-flex align-items-center"
          onClick={() =>
            sortData(
              showBireysel ? bireyselData : tuzelData,
              showBireysel ? setBireyselData : setTuzelData,
              key
            )
          }
        >
          <img
            src="/sort.png"
            alt="sort icon"
            style={{ width: "16px", height: "16px" }}
          />
        </button>
      </div>
    </th>
  );

  return (
    <div>
      <Header title="Başvurular" />
      <div className="height_class container mt-5" >
        <div className="btn-group mb-3" role="group" aria-label="Basic example">
          <button
            type="button"
            className={`btn rounded btn-primary ${
              showBireysel ? "active" : ""
            }`}
            onClick={() => setShowBireysel(true)}
          >
            Bireysel
          </button>
          <button
            type="button"
            className={`btn rounded mx-2 btn-primary ${
              !showBireysel ? "active" : ""
            }`}
            onClick={() => setShowBireysel(false)}
          >
            Tüzel
          </button>
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search in table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {showBireysel ? (
          <>
            <h3>Bireysel</h3>
            <div className="table-container">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    {renderHeader("id", "ID")}
                    {renderHeader("tarih", "Tarih")}

                    {renderHeader("cinsiyet", "Cinsiyet")}
                    {renderHeader("dogumtarihi", "Doğum Tarihi")}
                    {renderHeader("tckimlikno", "TC Kimlik")}
                    {renderHeader("ad", "Ad")}
                    {renderHeader("soyad", "Soyad")}
                    {renderHeader("medenihal", "Medeni Durum")}
                    {renderHeader("evadresi", "Ev Adresi")}
                    {renderHeader("il", "İl")}
                    {renderHeader("ilce", "İlçe")}
                    {renderHeader("ceptelefonu", "Cep Telefonu")}
                    {renderHeader("acepTelefonu", "Alternatif Cep Telefonu")}
                    {renderHeader("email", "Email")}
                    {renderHeader("calismaSekli", "Çalışma Şekli")}
                    {renderHeader("aylikGelir", "Aylık Gelir")}

                    {renderHeader("kurumAdi", "Çalıştığı Kurum")}
                    {renderHeader("meslek", "Meslek")}
                    {renderHeader("unvan", "Ünvan")}
                    {renderHeader("kurumAdresi", "Kurum Adresi")}
                    {renderHeader("kurumSehir", "Şehir")}
                    {renderHeader("kurumSemt", "Semt")}
                    {renderHeader("kurumTelefon", "Telefon")}

                    {renderHeader("ekGelir", "Ek Gelir")}
                    {renderHeader("ekGelirAciklamasi", "Ek Gelir Açıklaması")}
                    {renderHeader("sigortaTuru", "Sigorta Türü")}
                    {renderHeader("noterSatisBedeli", "Noter Satış Bedeli")}
                    {renderHeader("konsinyeArac", "Konsinye Araç")}
                    {renderHeader("ruhsatSahibiSirket", "Ruhsat Sahibi Şirket")}
                    {renderHeader("plaka", "Plaka")}
                    {renderHeader("kilometre", "Kilometre")}
                    {renderHeader("marka", "Marka")}
                    {renderHeader("aracTipi", "Araç Tipi")}
                    {renderHeader("yil", "Yıl")}
                    {renderHeader("kaskoKodu", "Kasko Kodu")}
                    {renderHeader("kaskoDegeri", "Kasko Değeri")}

                    {renderHeader("yakitBilgisi", "Yakıt Bİlgisi")}
                    {renderHeader("vitesBilgisi", "Vites Bilgisi")}
                    {renderHeader("kasaTipi", "Kasa Tipi")}
                    {renderHeader("motorGucu", "Motor Gücü")}
                    {renderHeader("motorHacmi", "Motor Hacmi")}
                    {renderHeader("ilanNo", "İlan No")}

                    {renderHeader("krediTutari", "Kredi Tutarı")}
                    {renderHeader("krediVadesi", "Kredi Vadesi")}
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBireyselData.map((item) => (
                    <tr key={item.id}>
                      <td className="frozen-col">{item.id}</td>
                      <td className="column-tarih">{item.tarih}</td>
                      <td className="column-cinsiyet">{item.cinsiyet}</td>

                      <td className="column-dogum">{item.dogum}</td>

                      <td className="column-tckimlikno">{item.tckimlikno}</td>
                      <td className="column-ad">{item.ad}</td>
                      <td className="column-soyad">{item.soyad}</td>
                      <td className="column-medenihal">{item.medenihal}</td>
                      <td className="column-evadresi">{item.evadresi}</td>
                      <td className="column-il">{item.il}</td>
                      <td className="column-ilce">{item.ilce}</td>
                      <td className="column-ceptelefonu">{item.ceptelefonu}</td>

                      <td className="column-acepTelefonu">
                        {item.acepTelefonu}
                      </td>

                      <td className="column-email">{item.email}</td>
                      <td className="column-calismaSekli">
                        {item.calismaSekli}
                      </td>
                      <td className="column-aylikGelir">{item.aylikGelir}</td>

                      <td className="column-kurumAdi">{item.kurumAdi}</td>
                      <td className="column-meslek">{item.meslek}</td>
                      <td className="column-unvan">{item.unvan}</td>
                      <td className="column-kurumAdresi">{item.kurumAdresi}</td>
                      <td className="column-kurumSehir">{item.kurumSehir}</td>
                      <td className="column-kurumSemt">{item.kurumSemt}</td>
                      <td className="column-kurumTelefon">
                        {item.kurumTelefon}
                      </td>

                      <td className="column-ekGelir">{item.ekGelir}</td>
                      <td className="column-ekGelirAciklamasi">
                        {item.ekGelirAciklamasi}
                      </td>
                      <td className="column-sigortaTuru">{item.sigortaTuru}</td>
                      <td className="column-noterSatisBedeli">
                        {item.noterSatisBedeli}
                      </td>
                      <td className="column-konsinyeArac">
                        {item.konsinyeArac}
                      </td>
                      <td className="column-ruhsatSahibiSirket">
                        {item.ruhsatSahibiSirket}
                      </td>
                      <td className="column-plaka">{item.plaka}</td>
                      <td className="column-kilometre">{item.kilometre}</td>
                      <td className="column-marka">{item.marka}</td>
                      <td className="column-aracTipi">{item.aracTipi}</td>
                      <td className="column-yil">{item.yil}</td>
                      <td className="column-kaskoKodu">{item.kaskoKodu}</td>
                      <td className="column-kaskoDegeri">{item.kaskoDegeri}</td>

                      <td className="column-yakitBilgisi">
                        {item.yakitBilgisi}
                      </td>
                      <td className="column-vitesBilgisi">
                        {item.vitesBilgisi}
                      </td>
                      <td className="column-kasaTipi">{item.kasaTipi}</td>
                      <td className="column-motorGucu">{item.motorGucu}</td>
                      <td className="column-motorHacmi">{item.motorHacmi}</td>
                      <td className="column-ilanNo">{item.ilanNo}</td>

                      <td className="column-krediTutari">{item.krediTutari}</td>
                      <td className="column-krediVadesi">{item.krediVadesi}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            handleDownload(item.klasor);
                            downloadObjectAsTxt(item, item.klasor);
                          }}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <h3>Tüzel</h3>
            <div className="table-container">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    {renderHeader("id", "ID")}
                    {renderHeader("tarih", "Tarih")}
                    {renderHeader("vergino", "Vergi No")}
                    {renderHeader("sirketunvani", "Şirket Ünvanı")}
                    {renderHeader("faaliyetkonusu", "Faaliyet Konusu")}

                    {renderHeader("aylikkazanc", "Aylık Kazanç")}

                    {renderHeader("isadresi", "İş Adresi")}
                    {renderHeader("telefonfirma", "Telefon Firma")}
                    {renderHeader("emailfirma", "Email Firma")}
                    {renderHeader("il", "İl")}
                    {renderHeader("ilce", "İlçe")}
                    {renderHeader("notersatisbedeli", "Noter Satış Bedeli")}
                    {renderHeader("konsinyearac", "Konsinye Araç")}
                    {renderHeader("ruhsatsahibisirket", "Ruhsat Sahibi Şirket")}
                    {renderHeader("plaka", "Plaka")}
                    {renderHeader("kilometre", "Kilometre")}
                    {renderHeader("marka", "Marka")}
                    {renderHeader("aracTipi", "Araç Tipi")}
                    {renderHeader("yil", "Yıl")}
                    {renderHeader("kaskoKodu", "Kasko Kodu")}
                    {renderHeader("kaskoDegeri", "Kasko Değeri")}

                    {renderHeader("yakitBilgisi", "Yakıt Bİlgisi")}
                    {renderHeader("vitesBilgisi", "Vites Bilgisi")}
                    {renderHeader("kasaTipi", "Kasa Tipi")}
                    {renderHeader("motorGucu", "Motor Gücü")}
                    {renderHeader("motorHacmi", "Motor Hacmi")}
                    {renderHeader("ilanNo", "İlan No")}

                    {renderHeader("kreditutari", "Kredi Tutarı")}
                    {renderHeader("kredivadesi", "Kredi Vadesi")}

                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTuzelData.map((item) => (
                    <tr key={item.id}>
                      <td className="frozen-col">{item.id}</td>
                      <td className="column-tarih">{item.tarih}</td>
                      <td className="column-vergino">{item.vergino}</td>
                      <td className="column-sirketunvani">
                        {item.sirketunvani}
                      </td>
                      <td className="column-faaliyetkonusu">
                        {item.faaliyetkonusu}
                      </td>

                      <td className="column-aylikkazanc">{item.aylikkazanc}</td>

                      <td className="column-isadresi">{item.isadresi}</td>
                      <td className="column-telefonfirma">
                        {item.telefonfirma}
                      </td>
                      <td className="column-emailfirma">{item.emailfirma}</td>
                      <td className="column-il">{item.il}</td>
                      <td className="column-ilce">{item.ilce}</td>
                      <td className="column-notersatisbedeli">
                        {item.notersatisbedeli}
                      </td>
                      <td className="column-konsinyearac">
                        {item.konsinyearac}
                      </td>
                      <td className="column-ruhsatsahibisirket">
                        {item.ruhsatsahibisirket}
                      </td>
                      <td className="column-plaka">{item.plaka}</td>
                      <td className="column-kilometre">{item.kilometre}</td>
                      <td className="column-marka">{item.marka}</td>
                      <td className="column-aracTipi">{item.aracTipi}</td>
                      <td className="column-yil">{item.yil}</td>
                      <td className="column-kaskoKodu">{item.kaskoKodu}</td>
                      <td className="column-kaskoDegeri">{item.kaskoDegeri}</td>

                      <td className="column-yakitBilgisi">
                        {item.yakitBilgisi}
                      </td>
                      <td className="column-vitesBilgisi">
                        {item.vitesBilgisi}
                      </td>
                      <td className="column-kasaTipi">{item.kasaTipi}</td>
                      <td className="column-motorGucu">{item.motorGucu}</td>
                      <td className="column-motorHacmi">{item.motorHacmi}</td>
                      <td className="column-ilanNo">{item.ilanNo}</td>

                      <td className="column-kreditutari">{item.kreditutari}</td>
                      <td className="column-kredivadesi">{item.kredivadesi}</td>

                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            handleDownload(item.klasor);
                            downloadObjectAsTxt(item, item.klasor);
                          }}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Tables;
