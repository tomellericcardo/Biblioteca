libro = {
    
    init: function() {
        libro.init_home();
        libro.init_modifica();
        libro.init_conferma();
        libro.leggi_scheda();
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
    
   leggi_scheda: function() {
        var codice = libro.leggi_parametro('codice');
        $.ajax({
            url: 'leggi_scheda',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({codice: codice}),
            success: function(risposta) {
                risposta = libro.formatta_scheda(risposta);
                $.get('/html/templates.html', function(contenuto) {
                    var template = $(contenuto).filter('#leggi_scheda').html();
                    $('#scheda').html(Mustache.render(template, risposta));
                });
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    formatta_scheda: function(risposta) {
        var scheda = risposta.scheda[0];
        if (scheda) {
            var nuova_scheda = {
                codice: scheda[0],
                titolo: scheda[1],
                autore: scheda[2],
                genere: scheda[3],
                descrizione: scheda[4],
                editore: scheda[5],
                anno: scheda[6],
                copertina: scheda[7]
            };
            risposta.scheda = nuova_scheda;
            risposta.spazio = true;
            return risposta;
        }
        return [];
    }
    
};


$(document).ready(libro.init());
