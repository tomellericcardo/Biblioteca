var liste = {
    
    init: function() {
        liste.init_home();
        liste.init_mostra();
        liste.leggi_lista();
    },
    
    
    // Bottone home
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
    },
    
    
    // Bottone mostra
    
    init_mostra: function() {
        $('#mostra').on('click', function() {
            liste.leggi_lista();
        });
    },
    
    
    // Leggi lista
    
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
    
    
    // Formatta lista autore
    
    formatta_risultati_autore: function(risposta) {
        var lista_libri = risposta.lista_libri;
        if (lista_libri) {
            var lista_autori = [];
            var autore, nuovo_autore;
            for (autore in lista_libri) {
                nuovo_autore = liste.formatta_nome(autore);
                lista_autori.push(nuovo_autore);
                lista_libri[nuovo_autore] = lista_libri[autore];
            }
            lista_autori.sort();
            var nuova_lista = liste.formatta_gruppo(lista_autori, lista_libri)
            risposta.lista_libri = nuova_lista;
            risposta.spazio = true;
            return risposta;
        }
        return [];
    },
    
    
    // Formatta nome
    
    formatta_nome: function(autore) {
        var lista_nomi, nuovo_autore, n, nome;
        lista_nomi = autore.split(' ');
        nuovo_autore = lista_nomi[lista_nomi.length - 1];
        if (lista_nomi.length > 1) {
            nuovo_autore += ' ('
            for (n = 0; n < lista_nomi.length - 1; n++) {
                if (n != 0) {
                    nuovo_autore += ' ';
                }
                nuovo_autore += lista_nomi[n];
            }
            nuovo_autore += ')';
        }
        return nuovo_autore;
    },

    
    // Formatta lista
    
    formatta_risultati: function(risposta) {
        var lista_libri = risposta.lista_libri;
        if (lista_libri) {
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
            var nuova_lista = liste.formatta_gruppo(lista_chiavi, lista_libri)
            risposta.lista_libri = nuova_lista;
            risposta.spazio = true;
            return risposta;
        }
        return [];
    },
    
    
    // Formatta gruppo
    
    formatta_gruppo: function(lista_chiavi, lista_libri) {
        var nuova_lista = [];
        var n = 0;
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
                    titolo: libro[1]
                };
                n += 1;
            }
            nuova_lista[i] = gruppo;
        }
        $('#n').html(n + ' risultati');
        return nuova_lista;
    }
    
};


$(document).ready(liste.init());
