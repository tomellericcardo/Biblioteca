liste = {
    
    init: function() {
        liste.init_home();
        liste.init_mostra();
        liste.leggi_lista();
    },
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
    },
    
    init_mostra: function() {
        $('#mostra').on('click', function() {
            liste.leggi_lista();
        });
    },
    
    leggi_lista: function() {
        $('#attesa').css('display', 'inline');
        var ordine = $('#ordine').val();
        $.ajax({
            url: 'leggi_lista',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({ordine: ordine}),
            success: function(risposta) {
                if (ordine == 'titolo') {
                    risposta = liste.formatta_risultati_titolo(risposta);
                    $.get('/html/templates.html', function(contenuto) {
                        var template = $(contenuto).filter('#leggi_lista_titolo').html();
                        $('#risultati').html(Mustache.render(template, risposta));
                    }).then(function() {
                        $('#attesa').css('display', 'none');
                    });
                } else if (ordine == 'autore') {
                    risposta = liste.formatta_risultati_autore(risposta);
                    $.get('/html/templates.html', function(contenuto) {
                        var template = $(contenuto).filter('#leggi_lista_autore').html();
                        $('#risultati').html(Mustache.render(template, risposta));
                    }).then(function() {
                        $('#attesa').css('display', 'none');
                    });
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    formatta_risultati_titolo: function(risposta) {
        var lista_libri = risposta.lista_libri;
        if (lista_libri) {
            var nuova_lista = [];
            var lista_chiavi = [];
            for (var chiave in lista_libri) {
                lista_chiavi.push(chiave);
            }
            lista_chiavi.sort();
            var i, j, gruppo, chiave, libro;
            for (i = 0; i < lista_chiavi.length; i++) {
                chiave = lista_chiavi[i];
                gruppo = {};
                gruppo.chiave = chiave.toUpperCase();
                gruppo.libri = [];
                for (j = 0; j < lista_libri[chiave].length; j++) {
                    libro = lista_libri[chiave][j];
                    gruppo.libri[j] = {
                        codice: libro[0],
                        titolo: libro[1],
                        autore: libro[2]
                    };
                }
                nuova_lista[i] = gruppo;
            }
            risposta.lista_libri = nuova_lista;
            risposta.spazio = true;
            return risposta;
        }
        return [];
    },
    
    formatta_risultati_autore: function(risposta) {
        var lista_libri = risposta.lista_libri;
        if (lista_libri) {
            var nuova_lista = [];
            var lista_chiavi = [];
            var lista_nomi
            for (var chiave in lista_libri) {
                lista_chiavi.push(chiave);
            }
            lista_chiavi.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
            var i, j, gruppo, lista_nomi, chiave, libro;
            for (i = 0; i < lista_chiavi.length; i++) {
                chiave = lista_chiavi[i];
                gruppo = {};
                lista_nomi = chiave.split(' ');
                gruppo.chiave = lista_nomi[lista_nomi.length - 1].toUpperCase();
                gruppo.libri = [];
                for (j = 0; j < lista_libri[chiave].length; j++) {
                    libro = lista_libri[chiave][j];
                    gruppo.libri[j] = {
                        codice: libro[0],
                        titolo: libro[1]
                    };
                }
                nuova_lista[i] = gruppo;
            }
            risposta.lista_libri = nuova_lista;
            risposta.spazio = true;
            return risposta;
        }
        return [];
    }
    
};


$(document).ready(liste.init());
