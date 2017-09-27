var cerca = {
    
    init: function() {
        cerca.init_home();
        cerca.init_cerca();
    },
    
    
    // Bottone home
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
    },
    
    
    // Bottone cerca
    
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
    
    
    // Apri scheda
    
    apri_libro: function(codice) {
        window.location.href = '/libro?codice=' + codice;
    },
    
    
    // Esegui ricerca
    
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
                    chiave: chiave.chiave,
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
    
    
    // Formatta risultati ricerca
    
    formatta_risultati: function(risposta) {
        var lista_libri = risposta.lista_libri;
        if (lista_libri) {
            var nuova_lista = [];
            var i, libro, titolo, autore;
            for (i = 0; i < lista_libri.length; i++) {
                libro = lista_libri[i];
                titolo = cerca.formatta_stringa(libro[1]);
                autore = cerca.formatta_stringa(libro[2]);
                nuova_lista[i] = {
                    codice: libro[0],
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
    
    
    // Formatta informazioni
    
    formatta_stringa: function(stringa) {
        if (stringa.length > 12) {
            stringa = stringa.substring(0, 10) + '...';
            stringa.replace(' ...', '...');
        }
        return stringa;
    }
    
};


$(document).ready(cerca.init());
