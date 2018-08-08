var libro = {
    
    init: function() {
        libro.codice = libro.leggi_parametro('codice');
        libro.modificando_scheda = false;
        libro.init_home();
        libro.init_chiudi_elimina();
        libro.init_conferma_elimina();
        libro.init_leggi_copertina();
        libro.init_chiudi_copertina();
        libro.init_modifica_scheda();
        libro.init_conferma_modifiche();
        libro.leggi_scheda();
    },
    
    
    // Leggi parametro
    
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
    
    
    // Bottone home
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
    },
    
    
    // Bottone mostra elimina
    
    init_mostra_elimina: function() {
        $('#mostra_elimina').on('click', function() {
            $('#elimina').css('display', 'block');
        });
    },
    
    
    // Bottone chiudi elimina
    
    init_chiudi_elimina: function() {
        $('#chiudi_elimina, #sfondo_elimina').on('click', function() {
            $('#elimina').css('display', 'none');
        });
    },
    
    
    // Bottone conferma elimina
    
    init_conferma_elimina: function() {
        $('#conferma_elimina').on('click', function() {
            $('#attesa').css('display', 'inline');
            $.ajax({
                url: 'elimina_scheda',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    chiave: chiave.chiave,
                    codice: libro.codice
                }),
                success: function(risposta) {
                    if (risposta.non_autorizzato) {
                        window.location.href = '/accedi?errore=1&destinazione=/libro&codice=' + libro.codice;
                    } else {
                        window.location.href = '/home';
                    }
                },
                error: function() {
                    errore.messaggio('Errore del server!');
                }
            });
        });
    },
    
    
    // Immagine copertina
    
    init_copertina: function() {
        $('#immagine_copertina').on('click', function() {
            if (libro.modificando_scheda) {
                $('#seleziona').click();
            } else {
                var copertina = $('#immagine_copertina').attr('src');
                if (copertina.split('?')[0] != '/img/copertina.png') {
                    $('#sorgente_copertina').html('<img src="' + copertina + '" id="copertina_aperta">');
                    $('#mostra_copertina').css('display', 'block');
                }
            }
        });
    },
    
    
    // Input copertina
    
    init_leggi_copertina: function() {
        $('#seleziona').change(function(evento) {
            $('#caricamento').css('display', 'block');
            $('#modifica_scheda, #conferma_modifiche').css('bottom', '65px');
            var lettore = new FileReader();
            lettore.onload = function(e) {
                libro.ridimensiona_mostra(e.target.result, 200, 350);
            };
            lettore.readAsDataURL(evento.target.files[0]);
        });
    },
    
    
    // Bottone chiudi copertina
    
    init_chiudi_copertina: function() {
        $('#chiudi_mostra, #sfondo_mostra').on('click', function() {
            $('#mostra_copertina').css('display', 'none');
        });
    },
    
    
    // Bottone recensioni
    
    init_recensioni: function() {
        $('#recensioni').on('click', function() {
            window.location.href = '/recensioni?libro=' + libro.codice;
        });
    },
    
    
    // Bottone posizione
    
    init_posizione: function() {
        $('#posizione').on('click', function() {
            window.location.href = '/posizione?libro=' + libro.codice;
        });
    },
    
    
    // Bottone modifica scheda
    
    init_modifica_scheda: function() {
        $('#modifica_scheda').on('click', function() {
            libro.modificando_scheda = true;
            $('#modifica_scheda, #mostra_elimina, #recensioni, #posizione').css('display', 'none');
            $('#conferma_modifiche').css('display', 'block');
            $('#titolo, #autore, #descrizione, #genere, #editore, #anno').prop('disabled', false);
        });
    },
    
    
    // Bottone conferma modifiche
    
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
                libro.modifica_scheda(titolo, autore);
            }
        });
    },
    
    
    // Ridimensiona copertina
    
    ridimensiona_mostra: function(sorgente, larghezza_massima, altezza_massima) {
        var immagine = document.createElement('img');
        var canvas = document.createElement('canvas');
        immagine.onload = function() {
            var larghezza = immagine.width;
            var altezza = immagine.height;
            if (larghezza > altezza) {
                if (larghezza > larghezza_massima) {
                    altezza *= larghezza_massima / larghezza;
                    larghezza = larghezza_massima;
                }
            } else {
                if (altezza > altezza_massima) {
                    larghezza *= altezza_massima / altezza;
                    altezza = altezza_massima;
                }
            }
            canvas.width = larghezza;
            canvas.height = altezza;
            var contesto = canvas.getContext('2d');
            contesto.drawImage(immagine, 0, 0, larghezza, altezza);
            libro.modifica_copertina(canvas.toDataURL('image/png'));
        };
        immagine.src = sorgente;
    },
    
    
    // Modifica copertina
    
    modifica_copertina: function(sorgente) {
        $.ajax({
            url: 'modifica_copertina',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                chiave: chiave.chiave,
                codice: libro.codice,
                copertina: sorgente
            }),
            success: function(risposta) {
                if (risposta.non_autorizzato) {
                    window.location.href = '/accedi?errore=1&destinazione=/libro&codice=' + libro.codice;
                } else {
                    $('#immagine_copertina').attr('src', sorgente);
                    $('#caricamento').css('display', 'none');
                    $('#modifica_scheda, #conferma_modifiche').css('bottom', '20px');
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    
    // Modifica scheda
    
    modifica_scheda: function(titolo, autore) {
        libro.modificando_scheda = false;
        $('#titolo, #autore, #descrizione, #genere, #editore, #anno').prop('disabled', true);
        $('#conferma_modifiche').css('display', 'none');
        $('#modifica_scheda, #mostra_elimina, #recensioni, #posizione').css('display', 'block');
        var descrizione = $('#descrizione').val();
        var genere = $('#genere').val();
        var editore = $('#editore').val();
        var anno = $('#anno').val();
        $.ajax({
            url: 'modifica_scheda',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                chiave: chiave.chiave,
                codice: libro.codice,
                titolo: titolo,
                autore: autore,
                descrizione: descrizione,
                genere: genere,
                editore: editore,
                anno: anno
            }),
            success: function(risposta) {
                if (risposta.codice) {
                    if (risposta.codice != libro.codice) {
                        window.location.href = '/libro?codice=' + risposta.codice;
                    }
                } else if (risposta.non_autorizzato) {
                    window.location.href = '/accedi?errore=1&destinazione=/libro&codice=' + libro.codice;
                } else {
                    errore.messaggio('Impossibile modificare la scheda di questo libro!');
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    
    // Leggi scheda
    
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
                    libro.init_mostra_elimina();
                    libro.init_copertina();
                    libro.init_recensioni();
                    libro.init_posizione();
                });
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    
    // Formatta scheda
    
    formatta_scheda: function(risposta) {
        var scheda = risposta.scheda;
        if (scheda) {
            var copertina = scheda[7].replace('http', 'https') + '?nc=' + Date.now();
            var nuova_scheda = {
                codice: scheda[0],
                titolo: scheda[1],
                autore: scheda[2],
                genere: scheda[3],
                descrizione: scheda[4],
                editore: scheda[5],
                anno: scheda[6],
                copertina: copertina
            };
            risposta.scheda = nuova_scheda;
            risposta.spazio = true;
            return risposta;
        }
        return [];
    }
    
};


$(document).ready(libro.init());
