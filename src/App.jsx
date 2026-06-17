import { useState } from "react";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./App.scss";
import background from "./assets/background.png";

/* ---------------- DECLINATION ---------------- */

function declineWord(word, caseType) {
  const lower = word.toLowerCase();
  let declined = word;

  if (caseType === "accusative") {
    if (lower.endsWith("a")) declined = word.slice(0, -1) + "ą";
    else if (lower.endsWith("ė")) declined = word.slice(0, -1) + "ę";
    else if (lower.endsWith("as")) declined = word.slice(0, -2) + "ą";
    else if (lower.endsWith("is") || lower.endsWith("ys"))
      declined = word.slice(0, -2) + "į";
    else if (lower.endsWith("us"))
      declined = word.slice(0, -2) + "ų";
  } else if (caseType === "locative") {
    if (lower.endsWith("as")) declined = word.slice(0, -2) + "e";
    else if (lower.endsWith("is") || lower.endsWith("ys"))
      declined = word.slice(0, -2) + "yje";
    else if (lower.endsWith("a")) declined = word.slice(0, -1) + "oje";
    else if (lower.endsWith("ė")) declined = word.slice(0, -1) + "ėje";
  } else if (caseType === "vocative") {
    if (lower.endsWith("ė")) declined = word.slice(0, -1) + "e";
    else if (lower.endsWith("as")) declined = word.slice(0, -2) + "ai";
    else if (lower.endsWith("is")) declined = word.slice(0, -2) + "i";
    else if (lower.endsWith("ys")) declined = word.slice(0, -2) + "y";
  }
  
  return declined;
}

function decline(input, caseType = "accusative") {
  if (!input) return "";

  return input
    .split(" ") // split surname parts by space
    .map((word) =>
      word
        .split("-") // split hyphenated parts
        .map((part) => declineWord(part, caseType))
        .join("-"),
    )
    .join(" ");
}

/* ---------------- INVITATION COMPONENTS ---------------- */

export const InvitationTextLT = ({ person }) => (
  <div className="invitation-text">
    <br />
    <p>
      Lietuvos Respublikos nepriklausomybės atkūrimo dienos proga Lietuvos
      Respublikos generalinis konsulas Donatas Kušlys maloniai kviečia <br />
    </p>
    <br />
    <p>
      <strong>
        <em>
          p. {decline(person.additive, "accusative")}{" "}
          {decline(person.name, "accusative")}{" "}
          {decline(person.surname, "accusative")}
        </em>
      </strong>
    </p>
    <br />
    <p>
      dalyvauti priėmime, kuris vyks kovo 11 d., trečiadienį, 18 val. Lietuvos
      Respublikos generaliniame konsulate Miunchene.
    </p>
    <br />
    <div className="details">
      <p className="left">
        Lietuvos Respublikos generalinis konsulatas Miunchene <br />
        Thomas-Wimmer-Ring 1, 80539 Miunchenas
      </p>
      <p className="right">
        R.S.V.P. iki kovo 5 d. <br />
        info-munich@mfa.lt <br />
        Tel.: +49 89 244 298 000 <br />
        Dark Suit
      </p>
    </div>
    <br />
    <p className="note">
      Kvietimas yra asmeninis ir kitiems asmenims neperduodamas; <br />
      maloniai prašome jį turėti atvykstant.
    </p>
    <br /> <br /> <br />
  </div>
);

export const InvitationTextDE = ({ person }) => (
  <div className="invitation-text">
    <br />
    <p>
      Im Gedenken an den 85. Jahrestag der sowjetischen Deportationen aus Litauen gibt sich der
      Generalkonsul der Republik Litauen, Herr Donatas Kušlys, unter der Schirmherrschaft von Frau Dr.
      Petra Loibl, Beauftragte der Bayerischen Staatsregierung für Aussiedler und Vertriebene die Ehre,
      <br />
    </p>
    <br />
    <p>
      <strong>
        {person.address} {person.additive} {person.name} {person.surname} mit Begleitung
      </strong>
    </p>
    <br />
    <p>
      zur Vorführung des Films „Ashes in the Snow“ von Marius A. Markevičius am 15. Juli
      um 18:00 Uhr einzuladen.
    </p>
    <br />
    <div className="details">
      <p className="left">
        <strong>Museum Lichtspiele</strong><br />
        Lilienstraße 2
        81669 München
      </p>
      <p className="right">
        <strong>Bitte bestätigen Sie Ihre Teilnahme bis zum</strong> <br />
        <strong>10. Juli 2026</strong> <br />
        info-munich@mfa.lt<br />
        Tel.: +49 89 244 298 000
      </p>
    </div>
    <br />
    <p className="note">
      Da die Teilnehmerzahl begrenzt ist, empfehlen wir eine frühzeitige Anmeldung. Die Anmeldung kann bereits vor dem Anmeldeschluss geschlossen
      werden, falls alle Plätze vergeben sind. <br />
      Der Film wird in englischer Sprache mit deutschen Untertiteln vorgeführt.
    </p>
    <br /> <br /> <br />
  </div>
);

/* ---------------- MAIN COMPONENT ---------------- */

export default function App() {
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);

  /* ---------- EXCEL UPLOAD ---------- */
  const handleExcelUpload = (e) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const raw = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
        raw: false,
        blankrows: false,
      });

      const cleaned = raw.map((r) => ({
        name: (r.vardas || "").toString().trim(),
        surname: (r.pavardė || "").toString().trim(),
        email: (r.email || "").toString().trim(),
        address:
          (r.kreipinys || "").toString().trim().toLowerCase() === "herr"
            ? "Herrn"
            : (r.kreipinys || "").toString().trim(),
        additive: (r.papildinys || "").toString().trim(),
        language: (r.kalba || "").toString().trim().toUpperCase(),
      }));

      setPeople(cleaned);
    };
    reader.readAsBinaryString(e.target.files[0]);
  };
  /* ---------- DOWNLOAD HELPER ---------- */
  const downloadInvitation = async (p, format) => {
  const el = document.getElementById("invitation-modal");

  const canvas = await html2canvas(el, {
    scale: 3,              // more pixels = sharper pdf
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/jpeg", 1.0);

  if (format === "jpg") {
    const a = document.createElement("a");
    a.href = imgData;
    a.download = `${p.name}_${p.surname}.jpg`;
    a.click();
    return;
  }

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(
    imgData,
    "JPEG",
    0,
    0,
    canvas.width,
    canvas.height
  );

  pdf.save(`${p.name}_${p.surname}.pdf`);
};

const downloadWordInvitation = (p) => {
  const el = document.getElementById("invitation-modal");

  if (!el) return;

  const content = el.innerHTML;

  const htmlDocument = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Invitation</title>
      <style>
        body {
          font-family: serif;
        }
        .invitation {
          width: 100%;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", htmlDocument], {
    type: "application/msword",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${p.name}_${p.surname}.doc`;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
};

  const downloadAllInvitations = async (format) => {
    setSelectedPerson(null);
    
    for (const p of people) {
      setSelectedPerson(p);
  
      // wait for modal + React render + images
      await new Promise((r) => setTimeout(r, 800));
  
      await downloadInvitation(p, format);
  
      // small pause so browser doesn’t block downloads
      await new Promise((r) => setTimeout(r, 300));
    }
  
    setSelectedPerson(null);
  };

  return (
    <div className="app">
      <h1>Pakvietimų generatorius</h1>

      <input type="file" accept=".xlsx" onChange={handleExcelUpload} />

      <div className="bulk-download">
        <button onClick={() => downloadAllInvitations("pdf")}>
          Download ALL as PDF
        </button>
      
        <button onClick={() => downloadAllInvitations("jpg")}>
          Download ALL as JPG
        </button>
      </div>


      {/* PREVIEW GRID */}
      <div className="preview-grid">
        {people.map((p, i) => (
          <div key={i} className="preview-card">
            <div className="preview-main" onClick={() => setSelectedPerson(p)}>
              {p.name} {p.surname}
            </div>

            <div className="preview-actions">
              <span>{p.language}</span>
            </div>
          </div>
        ))}
      </div>

      {/* INVITATION MODAL */}
      {selectedPerson && (
        <div className="modal-bg" onClick={() => setSelectedPerson(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelectedPerson(null)}>
              ×
            </button>

            <div
              id="invitation-modal"
              className="invitation"
              style={{
                backgroundImage: `url(${background})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="invitation-card">
                <div className="invitation-inner">

                  {selectedPerson.language === "LT" ? (
                    <InvitationTextLT person={selectedPerson} />
                  ) : (
                    <InvitationTextDE person={selectedPerson} />
                  )}
                </div>
              </div>
            </div>

            <div className="download">
              <button onClick={() => downloadInvitation(selectedPerson, "pdf")}>
                PDF
              </button>
              <button onClick={() => downloadInvitation(selectedPerson, "jpg")}>
                JPG
              </button>
               <button onClick={() => downloadWordInvitation(selectedPerson)}>
                Word
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
