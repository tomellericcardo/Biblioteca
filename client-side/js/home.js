home = {
    
    init: function() {
        home.init_cerca();
        home.init_aggiungi();
        home.leggi_galleria();
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
                if (titolo.length > 10) {
                    titolo = titolo.substring(0, 8) + '...';
                }
                if (autore.length > 10) {
                    autore = autore.substring(0, 8) + '...';
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


$(document).ready(home.init());
