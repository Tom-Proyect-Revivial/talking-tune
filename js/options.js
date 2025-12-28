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

$('#embed-html-btn').on('click', () => {
    const src = location.origin + location.pathname;

    const html = `
<figure class="talking-tune-embed">
  <iframe
    src="${src}"
    title="Talking Tune"
    loading="lazy"
    allow="microphone"
    style="border:0; width:100%; height:480px;"
  ></iframe>
  <figcaption class="visually-hidden">
    Talking Tune – gato interactivo
  </figcaption>
</figure>`.trim();

    $('#embed-html-output').val(html);
});


    $('#options-form').submit(function(e){
        e.preventDefault();
    });
});
