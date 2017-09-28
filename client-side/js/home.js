var home = {
    
    init: function() {
        home.init_liste();
        home.init_cerca();
        home.init_aggiungi();
        home.leggi_galleria();
    },
    
    
    // Bottone liste
    
    init_liste: function() {
        $('#liste').on('click', function() {
            window.location.href = '/liste';
        });
    },
    
    
    // Bottone cerca
    
    init_cerca: function() {
        $('#cerca').on('click', function() {
            window.location.href = '/cerca';
        });
    },
    
    
    // Bottone aggiungi
    
    init_aggiungi: function() {
        $('#aggiungi').on('click', function() {
            window.location.href = '/aggiungi';
        });
    },
    
    
    // Apri libro
    
    apri_libro: function(codice) {
        window.location.href = '/libro?codice=' + codice;
    },
    
    
    // Leggi galleria
    
    leggi_galleria: function() {
        $.ajax({
            url: 'leggi_galleria',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            success: function(risposta) {
                risposta = home.formatta_risposta(risposta);
                $.get('/html/templates.html', function(contenuto) {
                    var template = $(contenuto).filter('#leggi_galleria').html();
                    $('#galleria').html(Mustache.render(template, risposta));
                });
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    
    // Formatta risposta
    
    formatta_risposta: function(risposta) {
        var lista_libri = risposta.lista_libri;
        if (lista_libri) {
            var nuova_lista = home.formatta_galleria(lista_libri);
            var classifica = risposta.classifica;
            if (classifica) {
                var nuova_classifica = home.formatta_classifica(classifica);
            }
            risposta.lista_libri = nuova_lista;
            risposta.classifica = nuova_classifica;
            risposta.spazio = true;
            return risposta;
        }
        return [];
    },
    
    
    // Formatta galleria
    
    formatta_galleria: function(lista_libri) {
        var nuova_lista = [];
        var i, libro, titolo, lista_nomi, autore;
        for (i = 0; i < lista_libri.length; i++) {
            libro = lista_libri[i];
            titolo = home.formatta_stringa(libro[1]);
            lista_nomi = libro[2].split(' ');
            autore = lista_nomi[lista_nomi.length - 1];
            autore = home.formatta_stringa(autore);
            nuova_lista[i] = {
                codice: libro[0],
                titolo: titolo,
                autore: autore,
                copertina: libro[3].replace('http', 'https')
            };
        }
        return nuova_lista;
    },
    
    
    // Formatta classifica
    
    formatta_classifica: function(classifica) {
        var nuova_classifica = [];
        var i, libro, titolo, lista_nomi, autore, voto, n, colore;
        for (i = 0; i < classifica.length; i++) {
            libro = classifica[i];
            titolo = home.formatta_stringa(libro[1]);
            lista_nomi = libro[2].split(' ');
            autore = lista_nomi[lista_nomi.length - 1];
            autore = home.formatta_stringa(autore);
            voto = Number((libro[4]).toFixed(1));
            n = Math.round(voto);
            if (n < 3) {
                colore = 'red';
            } else if (n < 5) {
                colore = 'orange';
            } else {
                colore = 'amber';
            }
            nuova_classifica[i] = {
                codice: libro[0],
                titolo: titolo,
                autore: autore,
                copertina: libro[3].replace('http', 'https'),
                voto: voto,
                colore: colore
            };
        }
        return nuova_classifica;
    },
    
    
    // Formatta informazioni
    
    formatta_stringa: function(stringa) {
        if (stringa.length > 12) {
            stringa = stringa.substring(0, 10) + '...';
            stringa.replace(' ...', '...');
        }
        return stringa;
    }
    
};


$(document).ready(home.init());
