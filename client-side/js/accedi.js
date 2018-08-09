var accedi = {
    
    // Inizializzazione
    init: function() {
        accedi.init_accesso();
        accedi.leggi_errore();
    },
    
    // Lettura parametro
    leggi_parametro: function(parametro) {
        var indirizzo_pagina = decodeURIComponent(window.location.search.substring(1));
        var variabili = indirizzo_pagina.split('&');
        var nome_parametro, i;
        for (i = 0; i < variabili.length; i++) {
            nome_parametro = variabili[i].split('=');
            if (nome_parametro[0] === parametro)
                return nome_parametro[1] === undefined ? true : nome_parametro[1];
        }
    },
    
    // Lettura errore
    leggi_errore: function() {
        var messaggio = accedi.leggi_parametro('errore');
        if (messaggio)
            errore.messaggio('Devi inserire la chiave d\'accesso per eseguire questa operazione!');
    },
    
    
    /*** ACCESSO ***/
    
    init_accesso: function() {
        $('#accedi').on('click', function() {
            accedi.accesso();
        });
        $('#chiave').on('keyup', function(e) {
            if (e.keyCode == 13)
                accedi.accesso();
        });
    },
    
    accesso: function() {
        $('#chiave').css('border-color', '#757575');
        var chiave = $('#chiave').val();
        if (chiave.length > 0) {
            $('#attesa').css('display', 'inline');
            accedi.richesta_accesso(chiave);
        } else {
            $('#chiave').css('border-color', 'red');
            errore.messaggio('Completa i campi!');
        }
    },
    
    richesta_accesso: function(chiave) {
        $.ajax({
            url: 'accedi',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({chiave: chiave}),
            success: function(risposta) {
                $('#attesa').css('display', 'none');
                if (risposta.utente_valido)
                    accedi.utente_valido(risposta);
                else {
                    $('#chiave').val('');
                    $('#chiave').css('border-color', 'red');
                    errore.messaggio('Chiave non valida!');
                }
            },
            error: function() {
                $('#attesa').css('display', 'none');
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    utente_valido: function(risposta) {
        localStorage.clear();
        localStorage.setItem('chiave', risposta.hash_chiave);
        var destinazione = accedi.leggi_parametro('destinazione');
        if (destinazione) {
            if (destinazione == '/libro') {
                var codice = accedi.leggi_parametro('codice');
                destinazione += '?codice=' + codice;
            } else if ((destinazione == '/recensioni') || (destinazione == '/posizione')) {
                var codice = accedi.leggi_parametro('codice');
                destinazione += '?libro=' + codice;
            }
            window.location.href = destinazione;
        } else
            window.location.href = '/home';
    }
    
};


$(document).ready(accedi.init());
