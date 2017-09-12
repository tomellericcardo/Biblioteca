libro = {
    
    init: function() {
        libro.init_home();
        libro.init_modifica();
        libro.init_conferma();
        libro.carica_scheda();
    },
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
    },
    
    init_modifica: function() {
        $('#modifica').on('click', function() {
            
        });
    },
    
    init_conferma: function() {
        $('#modifica').on('click', function() {
            
        });
    },
    
    carica_scheda: function() {
        $.ajax({
            url: 'leggi_galleria',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            success: function(risposta) {
                risposta = home.formatta_galleria(risposta);
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
    
    formatta_galleria: function(risposta) {
        var lista_libri = risposta.lista_libri;
        if (lista_libri) {
            var nuova_lista = [];
            var i, libro, codice, titolo, autore;
            for (i = 0; i < lista_libri.length; i++) {
                libro = lista_libri[i];
                codice = libro[0];
                titolo = libro[1];
                autore = libro[2];
                if (titolo.length > 12) {
                    titolo = titolo.substring(0, 10) + '...';
                }
                if (autore.length > 14) {
                    autore = autore.substring(0, 12) + '...';
                }
                nuova_lista[i] = {
                    codice: codice,
                    titolo: titolo,
                    autore: autore,
                    copertina: libro[3]
                };
            }
            risposta.lista_libri = nuova_lista;
            risposta.spazio = true;
            return risposta;
        }
        return [];
    },
    
    apri_libro: function(codice) {
        window.location.href = '/libro?codice=' + codice;
    }
    
};


$(document).ready(libro.init());
