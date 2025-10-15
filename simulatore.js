// ✅ Leggi e interpreta CSV
function leggiCSV(percorso, callback) {
    fetch(percorso)
        .then(r => r.text())
        .then(text => {
            const righe = text.trim().split("\n");
            const intestazioni = righe[0]
                .split(";")
                .map(h => h.replace(/(^"|"$)/g, "").trim());

            const dati = righe.slice(1).map(riga => {
                const valori = riga.split(";").map(v => v.replace(/(^"|"$)/g, "").trim());
                const obj = {};
                intestazioni.forEach((col, i) => obj[col] = valori[i] || "");
                return obj;
            });

            callback(dati);
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
                case "LIKE": return val.includes(valore);
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
        leggiCSV("Q_Clienti.csv", dati => {
            const cliente = dati.find(r => r.ID === id);
            if (cliente) popolaSchedaCliente(cliente);
        });
    }
}
