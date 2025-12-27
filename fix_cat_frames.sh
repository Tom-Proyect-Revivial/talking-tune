#!/bin/bash

INPUT="css/style.css"
OUTPUT="css/style.fixed.css"

awk '
{
  line = $0

  if (line ~ /#cat\[data-anim=/ && line ~ /data-frame=/) {

    # extraer anim
    anim = line
    sub(/.*data-anim="/, "", anim)
    sub(/".*/, "", anim)

    # extraer frame
    frame = line
    sub(/.*data-frame="/, "", frame)
    sub(/".*/, "", frame)

    key = anim ":" frame

    if (!(key in seen)) {
      seen[key] = line
      keys[++k] = key
    }

  } else {
    other[++o] = line
  }
}
END {
  # imprimir CSS general
  for (i = 1; i <= o; i++) {
    print other[i]
  }

  print "\n/* === FRAMES ORDENADOS AUTOMÁTICAMENTE === */\n"

  # ordenar claves
  n = asorti(keys, sorted)

  for (i = 1; i <= n; i++) {
    print seen[sorted[i]]
  }
}
' "$INPUT" > "$OUTPUT"

echo "✔ CSS corregido generado en $OUTPUT"
