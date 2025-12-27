$(document).ready(function() {
    $("#options-window").dialog({
        autoOpen: false,
        modal: true,
        width: 400,
        draggable: true,
        resizable: false,
        show: { effect: "fade", duration: 300 },
        hide: { effect: "fade", duration: 200 },
        dialogClass: "custom-jquery-ui-dialog",
        buttons: {
            "Guardar": function() {
                $("#options-form").submit();
                $(this).dialog("close");
            }
        }
    });
    $("#options-btn").click(function() {
        $("#options-window").dialog("open");
    });

    $('#embed-html-btn').click(function(){
        let embedCode = `<iframe src="https://tom.ar.nf/talking-tune/index.php" width="500" height="600" style="border:none;"></iframe>`;
        $('#embed-html-output').val(embedCode);
    });

    $('#options-form').submit(function(e){
        e.preventDefault();
    });
});
