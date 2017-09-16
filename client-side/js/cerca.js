cerca = {
    
    init: function() {
        cerca.init_home();
        cerca.init_cerca();
    },
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
    },
    
    init_cerca: function() {
        $('#cerca').on('click', function() {
            cerca.esegui_ricerca();
        });
        $('#richiesta').on('keyup', function(e) {
            if (e.keyCode == 13) {
                cerca.esegui_ricerca();
            }
        });
    },
    
    esegui_ricerca: function() {
        $('#attesa').css('display', 'inline');
        var filtro = $('#filtro').val();
        var richiesta = $('#richiesta').val();
        if (richiesta.length == 0) {
            $('#attesa').css('display', 'none');
            errore.messaggio('Inserisci una parola chiave per eseguire la ricerca!');
        } else {
            $.ajax({
                url: 'esegui_ricerca',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    filtro: filtro,
                    richiesta: richiesta
                }),
                success: function(risposta) {
                    risposta = cerca.formatta_risultati(risposta);
                    $.get('/html/templates.html', function(contenuto) {
                        var template = $(contenuto).filter('#leggi_risultati').html();
                        $('#risultati').html(Mustache.render(template, risposta));
                    }).then(function() {
                        $('#attesa').css('display', 'none');
                    });
                },
                error: function() {
                    errore.messaggio('Errore del server!');
                }
            });
        }
    },
    
    formatta_risultati: function(risposta) {
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
                if (autore.length > 13) {
                    autore = autore.substring(0, 11) + '...';
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


$(document).ready(cerca.init());
