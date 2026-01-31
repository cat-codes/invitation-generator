import { useState } from "react";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./App.scss";
import { TfiEmail } from "react-icons/tfi";
// import { LuDownload } from "react-icons/lu";
import Ornament from './assets/ornament.svg';

/* ---------------- NAME DECLINATION ---------------- */

function toLocative(eventName) {
  if (!eventName) return "";

  const words = eventName.split(" ");
  const lastWord = words[words.length - 1];
  const lower = lastWord.toLowerCase();

  let declined = lower;

  // Masculine nouns
  if (lower.endsWith("as")) declined = lower.slice(0, -2) + "e";
  else if (lower.endsWith("is") || lower.endsWith("ys")) declined = lower.slice(0, -2) + "yje";
  // Feminine nouns
  else if (lower.endsWith("a")) declined = lower.slice(0, -1) + "oje";
  else if (lower.endsWith("ė")) declined = lower.slice(0, -1) + "ėje";

  words[words.length - 1] = declined;
  return words.join(" ");
}

// function toVocative(name, gender) {
//   if (!name) return "";
//   const firstLetter = name[0].toUpperCase();
//   const rest = name.slice(1);
//   let vocative = firstLetter + rest;

//   if (gender === "F") {
//     if (vocative.endsWith("ė")) vocative = vocative.slice(0, -1) + "e";
//   } else {
//     if (vocative.endsWith("as")) vocative = vocative.slice(0, -2) + "ai";
//     else if (vocative.endsWith("is")) vocative = vocative.slice(0, -2) + "i";
//     else if (vocative.endsWith("ys")) vocative = vocative.slice(0, -2) + "y";
//   }
//   return vocative;
// }

/* ---------------- NAME AND SURNAME DECLINATION ---------------- */


function toAccusative(name, gender) {
  if (!name) return "";
  const firstLetter = name[0].toUpperCase();
  let rest = name.slice(1);
  let accusative = firstLetter + rest;

  if (gender === "F") {
    if (accusative.endsWith("a")) {
      accusative = accusative.slice(0, -1) + "ą";
    } else if (accusative.endsWith("ė")) {
      accusative = accusative.slice(0, -1) + "ę";
    }
  } else {
    if (accusative.endsWith("as")) {
      accusative = accusative.slice(0, -2) + "ą";
    } else if (accusative.endsWith("is") || accusative.endsWith("ys")) {
      accusative = accusative.slice(0, -2) + "į";
    }
  }

  return accusative;
}

/* ---------------- EVENT NAME DECLINATION ---------------- */

function toAccusativeDynamic(word) {
  if (!word) return "";

  const firstLetter = word[0].toUpperCase();
  let rest = word.slice(1);
  let accusative = firstLetter + rest;

  const lower = word.toLowerCase();

  // Feminine endings
  if (lower.endsWith("a")) {
    accusative = accusative.slice(0, -1) + "ą";
  } else if (lower.endsWith("ė")) {
    accusative = accusative.slice(0, -1) + "ę";
  } 
  // Masculine endings
  else if (lower.endsWith("as")) {
    accusative = accusative.slice(0, -2) + "ą";
  } else if (lower.endsWith("is") || lower.endsWith("ys")) {
    accusative = accusative.slice(0, -2) + "į";
  }

  return accusative;
}

/* ---------------- DATE FORMATTING ---------------- */

const formatDateLT = (iso) => {
  const d = new Date(iso);
  const months = [
    "sausio", "vasario", "kovo", "balandžio", "gegužės", "birželio",
    "liepos", "rugpjūčio", "rugsėjo", "spalio", "lapkričio", "gruodžio"
  ];
  return `${d.getFullYear()} m. ${months[d.getMonth()]} ${d.getDate()}-ą`;
};

const formatDateDE = (iso) =>
  new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

/* ---------------- EMAIL TEXT ---------------- */

const emailTextLT = (p, link, event) => `
Laba diena, 

maloniai kviečiame ${toAccusative(p.name, p.gender)} ${toAccusative(p.surname, p.gender)} į ${toAccusativeDynamic(event.titleLT)}.

Renginys vyks ${formatDateLT(event.date)} ${event.time} val. Lietuvos Respublikos generaliniame konsulate Miunchene.

Prašome patvirtinti savo dalyvavimą arba atsisakyti pakvietimo užpildant šią formą:

${link}

Pagarbiai
LR generalinis konsulatas Miunchene
`;

const emailTextDE = (p, link, event) => `
Sehr geehrter Damen und Herren,

wir laden ${p.gender === "F" ? "Frau" : "Herrn"} ${p.surname} zur ${event.titleDE} ein.

Die Veranstaltung findet am ${formatDateDE(event.date)} um ${event.time} Uhr im Generalkonsulat der Republik Litauen in München statt.

Bitte bestätigen oder lehnen Sie Ihre Teilnahme über folgendes Formular ab:

${link}

Mit freundlichen Grüßen
Generalkonsulat der Republik Litauen
`;

/* ---------------- INVITATION COMPONENTS ---------------- */

export const InvitationTextLT = ({ person, event }) => (
  <div className="invitation-text">
    <p>
      Maloniai kviečiame dalyvauti <br />
    </p>

      <br />
      
      <p>
        <strong><em>{toAccusative(person.name, person.gender)} {toAccusative(person.surname, person.gender)}</em></strong>
      </p>

      <br />

      <p>
      {toLocative(event.titleLT)}.
      </p>

      <div className="ornament-wrapper">
        <img src={Ornament} alt="Ornament" />
      </div>

    <p>
      Renginys vyks {formatDateLT(event.date)} {event.time} val.<br />
      Lietuvos Respublikos generaliniame konsulate Miunchene.
    </p>

    <br />

    <p>
      Pagarbiai<br />
      LR generalinis konsulatas Miunchene
    </p>
  </div>
);

export const InvitationTextDE = ({ person, event }) => (
  <div className="invitation-text">
    <p>
      Wir laden herzlich ein zur {event.titleDE}
    </p>

    <br />

    <p>
      <strong><em>{person.gender === "F" ? "Frau" : "Herrn"} {person.name} {person.surname}</em></strong>
    </p>

    <br />

    <div className="ornament-wrapper">
      <img src={Ornament} alt="Ornament" />
    </div>

    <p>
      Die Veranstaltung findet am {formatDateDE(event.date)} um {event.time} Uhr 
      im Generalkonsulat der Republik Litauen in München statt.
    </p>

    <br />

    <p>
      Mit freundlichen Grüßen<br />
      Generalkonsulat der Republik Litauen
    </p>
  </div>
);


/* ---------------- MAIN COMPONENT ---------------- */

export default function App() {
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [emailPerson, setEmailPerson] = useState(null);

  const [event, setEvent] = useState({
    titleLT: "",
    titleDE: "",
    date: "",
    time: ""
  });

  /* ---------- EXCEL UPLOAD ---------- */
  const handleExcelUpload = (e) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const raw = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false, blankrows: false });

      const cleaned = raw.map(r => ({
        name: (r.name || "").toString().trim(),
        surname: (r.surname || "").toString().trim(),
        email: (r.email || "").toString().trim(),
        gender: (r.gender || "").toString().trim(),
        language: (r.language || "").toString().trim().toUpperCase()
      }));

      setPeople(cleaned);
    };
    reader.readAsBinaryString(e.target.files[0]);
  };

  /* ---------- GOOGLE FORM LINK ---------- */
  const buildFormLink = (p) => {
    const lang = (p.language || "").toUpperCase();
    const baseUrl =
      lang === "LT"
        ? "https://docs.google.com/forms/d/e/1FAIpQLSc9LjfFCma2QhnoYc5SCaEhr999EuOGXU_zDZlxnpDRiY485w/viewform?usp=pp_url"
        : "https://docs.google.com/forms/d/e/1FAIpQLSc0bmZ-AMFlnvrUhFg46vL_H_SKBK3d2BZg73H27xAt1ZsSLw/viewform?usp=pp_url";

    const url = new URL(baseUrl);

    if (lang === "LT") {
      url.searchParams.set("entry.1896882254", p.name);
      url.searchParams.set("entry.471508015", p.surname);
      url.searchParams.set("entry.1614724266", p.email);
    } else {
      url.searchParams.set("entry.1394455811", p.name);
      url.searchParams.set("entry.1710675518", p.surname);
      url.searchParams.set("entry.1668225483", p.email);
    }

    return url.toString();
  };

  /* ---------- DOWNLOAD HELPER ---------- */
  const downloadInvitation = async (p, format) => {
    const el = document.getElementById("invitation-modal");
    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL("image/jpeg", 1);

    if (format === "jpg") {
      const a = document.createElement("a");
      a.href = img;
      a.download = `${p.name}_${p.surname}.jpg`;
      a.click();
    } else {
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(img, "JPEG", 10, 10, 190, 0);
      pdf.save(`${p.name}_${p.surname}.pdf`);
    }
  };

  return (
    <div className="app">
      <h1>Pakvietimų generatorius</h1>

      {/* EVENT INPUTS */}
      <section className="event-inputs">
        <label>Renginio pavadinimas (LT)
          <input onChange={(e) => setEvent({ ...event, titleLT: e.target.value })} />
        </label>
        <label>Renginio pavadinimas (DE)
          <input onChange={(e) => setEvent({ ...event, titleDE: e.target.value })} />
        </label>
        <label>Data
          <input type="date" onChange={(e) => setEvent({ ...event, date: e.target.value })} />
        </label>
        <label>Laikas
          <input onChange={(e) => setEvent({ ...event, time: e.target.value })} />
        </label>
      </section>

      <input type="file" accept=".xlsx" onChange={handleExcelUpload} />

      {/* PREVIEW GRID */}
      <div className="preview-grid">
        {people.map((p, i) => (
          <div key={i} className="preview-card">
            <div className="preview-main" onClick={() => setSelectedPerson(p)}>
              {p.name} {p.surname}
            </div>

            <div className="preview-actions">
              <button onClick={() => setEmailPerson(p)}><TfiEmail /></button>
              <span>{p.language}</span>
            </div>
          </div>
        ))}
      </div>

      {/* INVITATION MODAL */}
      {selectedPerson && (
        <div className="modal-bg" onClick={() => setSelectedPerson(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelectedPerson(null)}>×</button>

            <div id="invitation-modal" className="invitation">
              <div className="invitation-card">
                <div className="invitation-inner">
                  <h2 className="title">
                    {selectedPerson.language === "LT" ? event.titleLT : event.titleDE}
                  </h2>

                  {selectedPerson.language === "LT" ? (
                    <InvitationTextLT person={selectedPerson} event={event} />
                  ) : (
                    <InvitationTextDE person={selectedPerson} event={event} />
                  )}
                </div>
              </div>
            </div>

            <div className="download">
              <button onClick={() => downloadInvitation(selectedPerson, "pdf")}>PDF</button>
              <button onClick={() => downloadInvitation(selectedPerson, "jpg")}>JPG</button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL MODAL */}
      {emailPerson && (
        <div className="modal-bg" onClick={() => setEmailPerson(null)}>
          <div className="modal wide" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setEmailPerson(null)}>×</button>

            <div className="email-columns">
              {emailPerson.language === "LT" && (
                <div>
                  <h3>LT</h3>
                  <textarea
                    readOnly
                    value={emailTextLT(emailPerson, buildFormLink(emailPerson), event)}
                  />
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        emailTextLT(emailPerson, buildFormLink(emailPerson), event)
                      )
                    }
                  >
                    Kopijuoti
                  </button>
                </div>
              )}

              {emailPerson.language === "DE" && (
                <div>
                  <h3>DE</h3>
                  <textarea
                    readOnly
                    value={emailTextDE(emailPerson, buildFormLink(emailPerson), event)}
                  />
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        emailTextDE(emailPerson, buildFormLink(emailPerson), event)
                      )
                    }
                  >
                    Kopieren
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
