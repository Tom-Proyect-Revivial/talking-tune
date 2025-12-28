<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Talking Tune</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="manifest" href="manifest.json">

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="jquery-ui/jquery-ui.min.css">
<link rel="stylesheet" href="css/style.css">

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="jquery-ui/jquery-ui.min.js"></script>
</head>
<body>
<button id="rec-btn" type="button">
  <span class="visually-hidden">Grabar</span>
</button>
<div id="scene">
  <div id="background" aria-hidden="true"></div>
  <img id="cat" src="assets/zeh/cat_zeh0000.png" alt="Gato animado">
</div>
<button id="milk-btn" class="btn btn-primary">
    <span class="visually-hidden">Leche</span>
</button>
<button type="button" id="options-btn" class="btn btn-secondary position-absolute top-0 start-0 m-2"
        aria-label="Abrir opciones">
</button>
<div id="options-window" title="Opciones" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="options-window-title">
  <div class="options-header">
    <h1 id="options-window-title">Opciones</h1>
  </div>
  
  <form id="options-form">
    <section class="option-group mb-3">
      <h2>Embebible</h2>
      <button type="button" id="embed-html-btn" class="btn btn-outline-primary w-100" aria-label="Generar HTML embebible">Generar HTML embebible</button>
      <label for="embed-html-output" class="visually-hidden">Código HTML embebible</label>
      <textarea id="embed-html-output" readonly class="form-control mt-2" rows="3"></textarea>
    </section>
  </form>
</div>
<script src="https://cdn.jsdelivr.net/npm/ccapture.js@1.1.0/build/CCapture.all.min.js"></script>
<script src="https://code.jquery.com/ui/1.13.2/jquery-ui.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="js/app.js"></script>
<script src="js/options.js"></script>
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registrado:', reg))
      .catch(err => console.error('Error registrando SW:', err));
  });
}
</script>

</body>
</html>

