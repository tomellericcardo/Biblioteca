home = {
    
    init: function() {
        home.init_liste();
        home.init_cerca();
        home.init_aggiungi();
        home.leggi_galleria();
    },
    
    init_liste: function() {
        $('#liste').on('click', function() {
            window.location.href = '/liste';
        });
    },
    
    init_cerca: function() {
        $('#cerca').on('click', function() {
            window.location.href = '/cerca';
        });
    },
    
    init_aggiungi: function() {
        $('#aggiungi').on('click', function() {
            window.location.href = '/aggiungi';
        });
    },
    
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
    
    formatta_risposta: function(risposta) {
        var lista_libri = risposta.lista_libri;
        if (lista_libri) {
            var nuova_lista = [];
            var i, libro, titolo, lista_nomi, autore;
            for (i = 0; i < lista_libri.length; i++) {
                libro = lista_libri[i];
                titolo = libro[1];
                lista_nomi = libro[2].split(' ');
                autore = lista_nomi[lista_nomi.length - 1];
                if (titolo.length > 12) {
                    titolo = titolo.substring(0, 10) + '...';
                }
                if (autore.length > 13) {
                    autore = autore.substring(0, 11) + '...';
                }
                nuova_lista[i] = {
                    codice: libro[0],
                    titolo: titolo,
                    autore: autore,
                    copertina: libro[3]
                };
            }
            var classifica = risposta.classifica;
            var nuova_classifica = [];
            if (classifica) {
                var voto, n, colore;
                for (i = 0; i < classifica.length; i++) {
                    libro = classifica[i];
                    titolo = libro[1];
                    lista_nomi = libro[2].split(' ');
                    autore = lista_nomi[lista_nomi.length - 1];
                    if (titolo.length > 12) {
                        titolo = titolo.substring(0, 10) + '...';
                    }
                    if (autore.length > 13) {
                        autore = autore.substring(0, 11) + '...';
                    }
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
                        copertina: libro[3],
                        voto: voto,
                        colore: colore
                    };
                }
            }
            risposta.lista_libri = nuova_lista;
            risposta.classifica = nuova_classifica;
            risposta.spazio = true;
            return risposta;
        }
        return [];
    },
    
    apri_libro: function(codice) {
        window.location.href = '/libro?codice=' + codice;
    }
    
};


$(document).ready(home.init());
