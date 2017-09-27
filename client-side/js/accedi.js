var accedi = {
    
    
    // Bottone accesso
    
    init_accesso: function() {
        $('#accedi').on('click', function() {
            accedi.accedi();
        });
        $('#chiave').on('keyup', function(e) {
            if (e.keyCode == 13) {
                accedi.accedi();
            }
        });
    },
    
    
    // Accesso
    
    accedi: function() {
        $('#chiave').css('border-color', '#757575');
        var chiave = $('#chiave').val();
        if (chiave.length > 0) {
            $('#attesa').css('display', 'inline');
            $.ajax({
                url: 'accedi',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({chiave: chiave}),
                success: function(risposta) {
                    $('#attesa').css('display', 'none');
                    if (risposta.utente_valido) {
                        localStorage.clear();
                        localStorage.setItem('chiave', risposta.hash_chiave);
                        window.location.href = '/home';
                    } else {
                        alert(risposta.hash_chiave);
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
        } else {
            $('#chiave').css('border-color', 'red');
            errore.messaggio('Completa i campi!');
        }
    }
    
};


$(document).ready(accedi.init_accesso());
