import { useState } from "react";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "./App.scss";
import { TfiEmail } from "react-icons/tfi";
import herbas from "./assets/herbas.png";

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

/* ---------------- DATE FORMATTING ---------------- */

const formatDateLT = (iso) => {
  // iso - date format: yyyy-mm-dd
  const d = new Date(iso);
  const months = [
    "sausio",
    "vasario",
    "kovo",
    "balandžio",
    "gegužės",
    "birželio",
    "liepos",
    "rugpjūčio",
    "rugsėjo",
    "spalio",
    "lapkričio",
    "gruodžio",
  ];
  return `${d.getFullYear()} m. ${months[d.getMonth()]} ${d.getDate()}-ą`;
};

const formatDateDE = (iso) =>
  new Date(iso).toLocaleDateString("de-DE", {
    // de-DE - german (Germany) formatting
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/* ---------------- EMAIL TEXT ---------------- */

const emailTextLT = (p, link, event) => `
Laba diena, 

maloniai kviečiame ${decline(p.name, "accusative")} ${decline(p.surname, "accusative")} į ${decline(event.titleLT, "accusative")}.

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
    <div className="herbas-wrapper">
      <img src={herbas} alt="herbas" />
    </div>
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

export const InvitationTextDE = ({ person, event }) => (
  <div className="invitation-text">
    <div className="herbas-wrapper">
      <img src={herbas} alt="herbas" />
    </div>
    <br />
    <p>
      Anlässlich des Tages der Wiederherstellung der Unabhängigkeit der Republik
      Litauen hat der Generalkonsul der Republik Litauen, Herr Donatas Kušlys,
      die Ehre,
      <br />
    </p>
    <br />
    <p>
      <strong>
        <em>
          {person.address} {person.additive} {person.name} {person.surname}
        </em>
      </strong>
    </p>
    <br />
    <p>
      zu einem Empfang am Mittwoch, dem 11. März 2026 um 18.00 Uhr im
      Generalkonsulat der Republik Litauen in München einzuladen.
    </p>
    <br />
    <div className="details">
      <p className="left">
        Generalkonsulat der Republik Litauen in München <br />
        Thomas-Wimmer-Ring 1, 80539 München
      </p>
      <p className="right">
        U. A. w. g. bis zum 5. März 2026 <br />
        info-munich@mfa.lt <br />
        Tel.: +49 89 244 298 000 <br />
        Dark Suit
      </p>
    </div>
    <br />
    <p className="note">
      Persönliche Einladung, nicht übertragbar. <br />
      Bitte bringen Sie Ihre Einladung zur Einlasskontrolle mit. <br />
      Bitte beachten Sie, dass am Generalkonsulat keine öffentlichen Parkplätze
      zur Verfügung stehen.
    </p>
    <br /> <br /> <br />
  </div>
);

/* ---------------- MAIN COMPONENT ---------------- */

export default function App() {
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [emailPerson, setEmailPerson] = useState(null);

  const [event, setEvent] = useState({
    // titleLT: "",
    // titleDE: "",
    date: "",
    time: "",
  });

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
              <button onClick={() => setEmailPerson(p)}>
                <TfiEmail />
              </button>
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

            <div id="invitation-modal" className="invitation">
              <div className="invitation-card">
                <div className="invitation-inner">
                  <h2 className="title">
                    {selectedPerson.language === "LT"
                      ? event.titleLT
                      : event.titleDE}
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
              <button onClick={() => downloadInvitation(selectedPerson, "pdf")}>
                PDF
              </button>
              <button onClick={() => downloadInvitation(selectedPerson, "jpg")}>
                JPG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL MODAL */}
      {emailPerson && (
        <div className="modal-bg" onClick={() => setEmailPerson(null)}>
          <div className="modal wide" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setEmailPerson(null)}>
              ×
            </button>

            <div className="email-columns">
              {emailPerson.language === "LT" && (
                <div>
                  <h3>LT</h3>
                  <textarea
                    readOnly
                    value={emailTextLT(
                      emailPerson,
                      buildFormLink(emailPerson),
                      event,
                    )}
                  />
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        emailTextLT(
                          emailPerson,
                          buildFormLink(emailPerson),
                          event,
                        ),
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
                    value={emailTextDE(
                      emailPerson,
                      buildFormLink(emailPerson),
                      event,
                    )}
                  />
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        emailTextDE(
                          emailPerson,
                          buildFormLink(emailPerson),
                          event,
                        ),
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
