liste = {
    
    init: function() {
        liste.init_home();
        liste.init_mostra();
    },
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
    },
    
    init_mostra: function() {
        $('#mostra').on('click', function() {
            $('#attesa').css('display', 'inline');
            var ordine = $('#ordine').val();
            $.ajax({
                url: 'leggi_lista',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({ordine: ordine}),
                success: function(risposta) {
                    risposta = liste.formatta_risultati(risposta);
                    $.get('/html/templates.html', function(contenuto) {
                        var template = $(contenuto).filter('#leggi_lista').html();
                        $('#risultati').html(Mustache.render(template, risposta));
                    }).then(function() {
                        $('#attesa').css('display', 'none');
                    });
                },
                error: function() {
                    errore.messaggio('Errore del server!');
                }
            });
        });
    },
    
    formatta_risultati: function(risposta) {
        var lista_libri = risposta.lista_libri;
        if (lista_libri) {
            var nuova_lista = [];
            var i, libro;
            for (i = 0; i < lista_libri.length; i++) {
                libro = lista_libri[i];
                nuova_lista[i] = {
                    codice: libro[0],
                    titolo: libro[1],
                    autore: libro[2]
                };
            }
            risposta.lista_libri = nuova_lista;
            risposta.spazio = true;
            return risposta;
        }
        return [];
    }
    
};


$(document).ready(liste.init());
