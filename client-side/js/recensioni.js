recensioni = {
    
    init: function() {
        recensioni.codice = recensioni.leggi_parametro('libro');
        recensioni.init_home();
        recensioni.init_mostra_recensione();
        recensioni.init_chiudi_recensione();
        recensioni.init_stelle();
        recensioni.init_invia_recensione();
        recensioni.leggi_recensioni();
    },
    
    leggi_parametro: function(parametro) {
        var indirizzo_pagina = decodeURIComponent(window.location.search.substring(1));
        var variabili = indirizzo_pagina.split('&');
        var nome_parametro, i;
        for (i = 0; i < variabili.length; i++) {
            nome_parametro = variabili[i].split('=');
            if (nome_parametro[0] === parametro) {
                return nome_parametro[1] === undefined ? true : nome_parametro[1];
            }
        }
    },
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
    },
    
    init_mostra_recensione: function() {
        $('#mostra_recensione').on('click', function() {
            $('#nuova_recensione').css('display', 'block');
        });
    },
    
    init_chiudi_recensione: function() {
        $('#chiudi_recensione, #sfondo_recensione').on('click', function() {
            $('#nuova_recensione').css('display', 'none');
        });
    },
    
    init_stelle: function() {
        recensioni.valore_recensione = 0;
        $('#stella1').on('click', function() {
            recensioni.valore_recensione = 1;
            $('#stella1').html('star');
            $('#stella2, #stella3, #stella4, #stella5').html('star_border');
        });
        $('#stella2').on('click', function() {
            recensioni.valore_recensione = 2;
            $('#stella1, #stella2').html('star');
            $('#stella3, #stella4, #stella5').html('star_border');
        });
        $('#stella3').on('click', function() {
            recensioni.valore_recensione = 3;
            $('#stella1, #stella2, #stella3').html('star');
            $('#stella4, #stella4').html('star_border');
        });
        $('#stella4').on('click', function() {
            recensioni.valore_recensione = 4;
            $('#stella1, #stella2, #stella3, #stella4').html('star');
            $('#stella5').html('star_border');
        });
        $('#stella5').on('click', function() {
            recensioni.valore_recensione = 5;
            $('.stella').html('star');
        });
    },
    
    init_invia_recensione: function() {
        $('#invia_recensione').on('click', function() {
            $('#autore, #testo').css('border-color', '#757575');
            var autore = $('#autore').val();
            var testo = $('#testo').val();
            if (recensioni.valore_recensione == 0) {
                errore.messaggio('Devi dare una valutazione per fare la recensione!');
            } else if (autore.length == 0) {
                $('#autore').css('border-color', 'red');
                errore.messaggio('Devi inserire il tuo nome per fare la recensione!');
            } else if (testo.length == 0) {
                $('#testo').css('border-color', 'red');
                errore.messaggio('Devi inserire il testo della recensione!');
            } else {
                $('#attesa').css('display', 'inline');
                $.ajax({
                    url: 'invia_recensione',
                    method: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify({
                        libro: recensioni.codice,
                        valore: recensioni.valore_recensione,
                        autore: autore,
                        testo: testo
                    }),
                    success: function(risposta) {
                        $('#attesa, #nuova_recensione').css('display', 'none');
                        recensioni.valore_recensione = 0;
                        $('.stella').html('star_border');
                        $('#autore, #testo').val('');
                        recensioni.leggi_recensioni();
                    },
                    error: function() {
                        errore.messaggio('Errore del server!');
                    }
                });
            }
        });
    },
    
    leggi_recensioni: function() {
        $.ajax({
            url: 'leggi_recensioni',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({libro: recensioni.codice}),
            success: function(risposta) {
                risposta = recensioni.formatta_recensioni(risposta);
                $.get('/html/templates.html', function(contenuto) {
                    var template1 = $(contenuto).filter('#leggi_sommario').html();
                    $('#sommario').html(Mustache.render(template1, risposta));
                });
                $.get('/html/templates.html', function(contenuto) {
                    var template2 = $(contenuto).filter('#leggi_recensioni').html();
                    $('#recensioni').html(Mustache.render(template2, risposta));
                });
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    formatta_recensioni: function(risposta) {
        var sommario = risposta.sommario;
        if (sommario) {
            var nuovo_sommario = {
                titolo: sommario[0],
                autore: sommario[1],
                copertina: sommario[2],
                voto: sommario[3]
            };
            risposta.sommario = nuovo_sommario;
        } else {
            risposta.sommario = [];
        }
        var lista_recensioni = risposta.recensioni;
        if (lista_recensioni) {
            var nuova_lista = [];
            var i, recensione, codice, autore, testo;
            for (i = 0; i < lista_recensioni.length; i++) {
                recensione = lista_recensioni[i];
                nuova_lista[i] = {
                    id: recensione[0],
                    valore: recensione[1],
                    autore: recensione[2],
                    testo: recensione[3]
                };
            }
            risposta.recensioni = nuova_lista;
            risposta.spazio = true;
        } else {
            risposta.recensioni = [];
        }
        return risposta;
    },
    
    elimina_recensione: function(id) {
        $.ajax({
            url: 'elimina_recensione',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({id: id}),
            success: function(risposta) {
                recensioni.leggi_recensioni();
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    }
    
};


$(document).ready(recensioni.init());
