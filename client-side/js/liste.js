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
                if (ordine == 'autore') {
                    risposta = liste.formatta_risultati_autore(risposta);
                    $.get('/html/templates.html', function(contenuto) {
                        var template = $(contenuto).filter('#leggi_lista_autore').html();
                        $('#risultati').html(Mustache.render(template, risposta));
                    }).then(function() {
                        $('#attesa').css('display', 'none');
                    });
                } else {
                    risposta = liste.formatta_risultati(risposta);
                    $.get('/html/templates.html', function(contenuto) {
                        var template = $(contenuto).filter('#leggi_lista').html();
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
    
    formatta_risultati_autore: function(risposta) {
        var lista_libri = risposta.lista_libri;
        if (lista_libri) {
            var n = 0;
            var nuova_lista = [];
            var lista_autori = [];
            var autore, lista_nomi, nuovo_autore;
            for (autore in lista_libri) {
                lista_nomi = autore.split(' ');
                nuovo_autore = lista_nomi[lista_nomi.length - 1].toUpperCase();
                lista_autori.push(nuovo_autore);
                lista_libri[nuovo_autore] = lista_libri[autore];
            }
            lista_autori.sort();
            var i, j, gruppo, chiave, libro;
            for (i = 0; i < lista_autori.length; i++) {
                chiave = lista_autori[i];
                gruppo = {};
                gruppo.chiave = chiave;
                gruppo.libri = [];
                for (j = 0; j < lista_libri[chiave].length; j++) {
                    libro = lista_libri[chiave][j];
                    gruppo.libri[j] = {
                        codice: libro[0],
                        titolo: libro[1]
                    };
                    n += 1;
                }
                nuova_lista[i] = gruppo;
            }
            risposta.lista_libri = nuova_lista;
            risposta.spazio = true;
            $('#n').html(n + ' risultati');
            return risposta;
        }
        return [];
    },
    
    formatta_risultati: function(risposta) {
        var lista_libri = risposta.lista_libri;
        if (lista_libri) {
            var n = 0;
            var nuova_lista = [];
            var lista_chiavi = [];
            var chiave, nuova_chiave;
            for (chiave in lista_libri) {
                if (chiave.length > 0) {
                    nuova_chiave = chiave.toUpperCase();
                    lista_chiavi.push(nuova_chiave);
                    lista_libri[nuova_chiave] = lista_libri[chiave];
                }
            }
            lista_chiavi.sort();
            if (lista_libri['']) {
                lista_chiavi.push('NON SPECIFICATO');
                lista_libri['NON SPECIFICATO'] = lista_libri[''];
            }
            var i, j, gruppo, chiave, libro;
            for (i = 0; i < lista_chiavi.length; i++) {
                chiave = lista_chiavi[i];
                gruppo = {};
                gruppo.chiave = chiave;
                gruppo.libri = [];
                for (j = 0; j < lista_libri[chiave].length; j++) {
                    libro = lista_libri[chiave][j];
                    gruppo.libri[j] = {
                        codice: libro[0],
                        titolo: libro[1],
                        autore: libro[2]
                    };
                    n += 1;
                }
                nuova_lista[i] = gruppo;
            }
            risposta.lista_libri = nuova_lista;
            risposta.spazio = true;
            $('#n').html(n + ' risultati');
            return risposta;
        }
        return [];
    }
    
};


$(document).ready(liste.init());
