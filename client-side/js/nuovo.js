nuovo = {
    
    init_conferma: function() {
        $('#conferma').on('click', function() {
        $('#nome').css('border-color', '#757575');
            var nome = $('#nome').val();
            var descrizione = $('#descrizione').val();
            if (nome.length == 0) {
                $('#nome').css('border-color', 'red');
                errore.messaggio('Devi dare un nome all\'album!');
            } else {
                $.ajax({
                    url: 'nuovo_album',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        nome: nome,
                        descrizione: descrizione
                    }),
                    success: function(risposta) {
                        if (risposta.nome_presente) {
                            errore.messaggio('Nome album gi&agrave; presente!');
                        } else if (risposta.successo) {
                            window.location.href = '/album?nome=' + nome;
                        }
                    },
                    error: function() {
                        errore.messaggio('Errore del server!');
                    }
                });
            }
        });
    }
    
};


$(document).ready(nuovo.init_conferma());
