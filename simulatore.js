// ✅ Leggi e interpreta CSV
function leggiCSV(percorso, callback) {
  fetch(percorso)
    .then(r => r.text())
    .then(text => {
      const risultato = Papa.parse(text, {
        header: true,
        skipEmptyLines: true
      });
      callback(risultato.data);
    });
}

// ✅ Interpreta stringa filtro stile SQL
function parseFiltri(filtroStringa) {
    return filtroStringa.split(";").map(f => {
        const [campo, operatore, valore] = f.split("|");
        return { campo, operatore, valore: valore.replace(/'/g, "").toLowerCase() };
    });
}

// ✅ Applica i filtri ai dati
function filtraDati(dati, clausole) {
  return dati.filter(record => {
    return clausole.every(({ campo, operatore, valore }) => {
      const val = (record[campo] || "").toLowerCase();
      switch (operatore.toUpperCase()) {
        case "=": return val === valore;
        case "LIKE":
          if (valore === "*") return true;
          return val.includes(valore);
        case "IS NULL": return val === "";
        case "IS NOT NULL": return val !== "";
        default: return false;
      }
    });
  });
}


// ✅ Simula il comportamento del ponte Access
function simulaPonte(comando) {
    if (comando === "home:clienti:load") {
        leggiCSV("Q_Clienti.csv", dati => {
            popolaSchedaCliente(dati[0]);
        });
    }

    if (comando.startsWith("Clienti:Cerca:")) {
        const filtroStringa = comando.split(":")[2];
        const clausole = parseFiltri(filtroStringa);

        leggiCSV("Q_Clienti.csv", dati => {
            const risultati = filtraDati(dati, clausole);
            svuotaTabella();
            risultati.forEach(r => aggiungiCliente(r));
        });
    }

    if (comando.startsWith("Clienti:Apri:")) {
        const id = comando.split(":")[2];
        leggiCSV("Q_ClientiScheda.csv", dati => {
            const cliente = dati.find(r => r.ID === id);
            if (cliente) popolaSchedaCliente(cliente);
        });
    }
}
