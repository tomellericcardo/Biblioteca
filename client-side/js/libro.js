libro = {
    
    init: function() {
        libro.codice = libro.leggi_parametro('codice');
        libro.modificando_scheda = false;
        libro.init_home();
        libro.init_chiudi_elimina();
        libro.init_conferma_elimina();
        libro.init_chiudi_copertina();
        libro.init_modifica_scheda();
        libro.init_conferma_modifiche();
        libro.leggi_scheda();
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
    
    init_mostra_elimina: function() {
        $('#mostra_elimina').on('click', function() {
            $('#elimina').css('display', 'block');
        });
    },
    
    init_chiudi_elimina: function() {
        $('#chiudi_elimina, #sfondo_elimina').on('click', function() {
            $('#elimina').css('display', 'none');
        });
    },
    
    init_conferma_elimina: function() {
        $('#conferma_elimina').on('click', function() {
            $('#attesa').css('display', 'inline');
            $.ajax({
                url: 'elimina_scheda',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({codice: libro.codice}),
                success: function(risposta) {
                    $('#elimina').css('display', 'none');
                    $('#attesa').css('display', 'none');
                    if (risposta.successo) {
                        window.location.href = '/home';
                    } else {
                        errore.messaggio('Impossibile eliminare questo libro!');
                    }
                },
                error: function() {
                    errore.messaggio('Errore del server!');
                }
            });
        });
    },
    
    init_copertina: function() {
        $('#immagine_copertina').on('click', function() {
            if (libro.modificando_scheda) {
                alert('Modifica');
            } else {
                var copertina = $('#immagine_copertina').attr('src');
                if (copertina != '/img/copertina.png') {
                    $('#sorgente_copertina').html('<img src="' + copertina + '" id="copertina_aperta">');
                    $('#mostra_copertina').css('display', 'block');
                }
            }
        });
    },
    
    init_chiudi_copertina: function() {
        $('#chiudi_mostra, #sfondo_mostra').on('click', function() {
            $('#mostra_copertina').css('display', 'none');
        });
    },
    
    init_recensioni: function() {
        $('#recensioni').on('click', function() {
            window.location.href = '/recensioni?libro=' + libro.codice;
        });
    },
    
    init_modifica_scheda: function() {
        $('#modifica_scheda').on('click', function() {
            libro.modificando_scheda = true;
            $('#modifica_scheda, #recensioni, #mostra_elimina').css('display', 'none');
            $('#conferma_modifiche').css('display', 'block');
            $('#titolo, #autore, #descrizione, #genere, #editore, #anno').prop('disabled', false);
        });
    },
    
    init_conferma_modifiche: function() {
        $('#conferma_modifiche').on('click', function() {
            $('#titolo, #autore').css('border-color', '#757575');
            var titolo = $('#titolo').val();
            var autore = $('#autore').val();
            if (titolo.length == 0) {
                $('#titolo').css('border-color', 'red');
                errore.messaggio('Devi inserire il titolo del libro per poterlo catalogare!');
            } else if (autore.length == 0) {
                $('#autore').css('border-color', 'red');
                errore.messaggio('Devi inserire l\'autore del libro per poterlo catalogare!');
            } else {
                libro.modificando_scheda = false;
                $('#titolo, #autore, #descrizione, #genere, #editore, #anno').prop('disabled', true);
                $('#conferma_modifiche').css('display', 'none');
                $('#modifica_scheda, #recensioni, #mostra_elimina').css('display', 'block');
                var descrizione = $('#descrizione').val();
                var genere = $('#genere').val();
                var editore = $('#editore').val();
                var anno = $('#anno').val();
                var richiesta = {
                    codice: libro.codice,
                    titolo: titolo,
                    autore: autore,
                    descrizione: descrizione,
                    genere: genere,
                    editore: editore,
                    anno: anno
                };
                $.ajax({
                    url: 'modifica_scheda',
                    method: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(richiesta),
                    success: function(risposta) {
                        if (risposta.codice) {
                            if (risposta.codice != libro.codice) {
                                window.location.href = '/libro?codice=' + risposta.codice;
                            }
                        } else {
                            errore.messaggio('Impossibile modificare la scheda di questo libro!');
                        }
                    },
                    error: function() {
                        errore.messaggio('Errore del server!');
                    }
                });
            }
        });
    },
    
    leggi_scheda: function() {
        $.ajax({
            url: 'leggi_scheda',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({codice: libro.codice}),
            success: function(risposta) {
                risposta = libro.formatta_scheda(risposta);
                $.get('/html/templates.html', function(contenuto) {
                    var template = $(contenuto).filter('#leggi_scheda').html();
                    $('#scheda').html(Mustache.render(template, risposta));
                }).then(function() {
                    libro.init_copertina();
                    libro.init_recensioni();
                    libro.init_mostra_elimina();
                });
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    formatta_scheda: function(risposta) {
        var scheda = risposta.scheda;
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
