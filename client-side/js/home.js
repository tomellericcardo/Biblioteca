home = {
    
    init: function() {
        home.init_nuovo();
        home.leggi_album();
    },
    
    init_nuovo: function() {
        $('#nuovo').on('click', function() {
            window.location.href = '/nuovo';
        });
    },
    
    leggi_album: function() {
        $.ajax({
            url: 'leggi_album',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            success: function(risposta) {
                risposta = home.formatta_album(risposta);
                $.get('/html/templates.html', function(contenuto) {
                    var template = $(contenuto).filter('#carica_album').html();
                    $('#galleria').html(Mustache.render(template, risposta));
                });
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    formatta_album: function(risposta) {
        var lista_album = risposta.lista_album;
        if (lista_album) {
            var nuova_lista = [];
            var i, album;
            for (i = 0; i < lista_album.length; i++) {
                album = lista_album[i];
                nuova_lista[i] = {
                    nome: album[0],
                    copertina: album[1]
                };
            }
            risposta.lista_album = nuova_lista;
            risposta.spazio = true;
            return risposta;
        }
        return [];
    },
    
    apri_album: function(nome) {
        window.location.href = '/album?nome=' + nome;
    }
    
};


$(document).ready(home.init());
