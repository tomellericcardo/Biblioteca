posizione = {
    
    init: function() {
        posizione.codice = posizione.leggi_parametro('libro');
        posizione.init_indietro();
        posizione.init_modifica_posizione();
        posizione.init_conferma_modifiche();
        posizione.leggi_posizione();
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
    
    init_indietro: function() {
        $('#indietro').on('click', function() {
            window.location.href = '/libro?codice=' + posizione.codice;
        });
    },
    
    init_stato: function() {
        $('#stato').on('change', function() {
            var stato = $('#stato').val();
            if (stato == 'casa') {
                $('#testo').attr('placeholder', 'Dove?');
            } else if (stato == 'prestito') {
                $('#testo').attr('placeholder', 'A chi?');
            } else {
                $('#testo').attr('placeholder', '');
            }
        });
    },
    
    init_modifica_posizione: function() {
        $('#modifica_posizione').on('click', function() {
            $('#modifica_posizione').css('display', 'none');
            $('#conferma_modifiche').css('display', 'block');
            $('#stato, #testo').prop('disabled', false);
        });
    },
    
    init_conferma_modifiche: function() {
        $('#conferma_modifiche').on('click', function() {
            $('#testo').css('border-color', '#757575');
            var stato = $('#stato').val();
            var testo = $('#testo').val();
            if (stato.length == 0) {
                errore.messaggio('Devi inserire lo stato del libro per modificarne la posizione!');
            } else if (testo.length == 0) {
                $('#testo').css('border-color', 'red');
                if (stato = 'casa') {
                    errore.messaggio('Devi specificare dove si trova il libro all\'interno della casa!');
                } else {
                    errore.messaggio('Devi specificare a chi � stato dato in prestito il libro!');
                }
            } else {
                $('#stato, #testo').prop('disabled', true);
                $('#conferma_modifiche').css('display', 'none');
                $('#modifica_posizione').css('display', 'block');
                var richiesta = {
                    libro: posizione.codice,
                    stato: stato,
                    testo: testo
                };
                $.ajax({
                    url: 'modifica_posizione',
                    method: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(richiesta),
                    success: function(risposta) {
                        posizione.leggi_posizione();
                    },
                    error: function() {
                        errore.messaggio('Errore del server!');
                    }
                });
            }
        });
    },
    
    leggi_posizione: function() {
        $.ajax({
            url: 'leggi_posizione',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({libro: posizione.codice}),
            success: function(risposta) {
                risposta = posizione.formatta_posizione(risposta);
                $.get('/html/templates.html', function(contenuto) {
                    var template = $(contenuto).filter('#leggi_posizione').html();
                    $('#posizione').html(Mustache.render(template, risposta));
                }).then(function() {
                    $('#stato').val(risposta.posizione.stato);
                    posizione.init_stato();
                });
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    formatta_posizione: function(risposta) {
        var posizione = risposta.posizione;
        if (posizione) {
            var nuova_posizione = {
                codice: posizione[0],
                titolo: posizione[1],
                autore: posizione[2],
                stato: posizione[3],
                testo: posizione[4]
            };
            risposta.posizione = nuova_posizione;
            return risposta;
        }
        return [];
    }
    
};


$(document).ready(posizione.init());