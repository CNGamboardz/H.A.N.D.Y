// =========================================================================
// ZONA DE PRUEBA MANUAL MEJORADA
// =========================================================================
// Ahora puedes probar el guante simplemente ESCRIBIENDO EN TU TECLADO.
// Presiona cualquier letra en esta página (sin necesidad de recargar) y
// se simulará que el Arduino acaba de enviar esa letra.
// Presiona "Espacio" para agregar espacios entre palabras.
// =========================================================================

let textoAcumulado = '';
let vocesDisponibles = [];

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // CONEXIÓN CON ARDUINO VÍA WEB SERIAL API
    // =========================================================================
    const btnConectar = document.getElementById('btn-conectar');
    
    if (btnConectar) {
        // Verificamos si el navegador soporta Web Serial API
        if ('serial' in navigator) {
            btnConectar.addEventListener('click', async () => {
                try {
                    // Solicita al usuario seleccionar el puerto USB del Arduino
                    const port = await navigator.serial.requestPort();
                    
                    // Abre el puerto a 9600 baudios (igual que el Serial.begin de tu código)
                    await port.open({ baudRate: 9600 });
                    
                    // Actualiza UI para mostrar conexión exitosa
                    const statusIndicator = document.getElementById('status-indicator');
                    const statusText = document.getElementById('status-text');
                    if(statusIndicator && statusText) {
                        statusIndicator.classList.remove('waiting');
                        statusIndicator.classList.add('connected');
                        statusText.textContent = "¡Conectado al Guante H.A.N.D.Y.!";
                        statusText.style.color = "#2ecc71";
                    }
                    btnConectar.style.display = 'none'; // Oculta el botón

                    // Inicia el bucle para leer los datos enviados desde Arduino
                    leerDatosSerial(port);
                    
                } catch (error) {
                    console.error("Error al conectar el puerto serial:", error);
                    alert("No se pudo conectar al Arduino. Asegúrate de seleccionarlo en la lista desplegable y dar permisos.");
                }
            });
        } else {
            alert("Tu navegador no soporta la conexión directa con Arduino (Web Serial API). Por favor, usa Google Chrome o Microsoft Edge en tu computadora.");
            btnConectar.style.display = 'none';
        }
    }

    // =========================================================================
    // EVENTO DE TECLADO PARA SIMULAR EL ARDUINO
    // =========================================================================
    document.addEventListener('keypress', (event) => {
        // Obtenemos la tecla presionada (convertida a mayúscula)
        let letra = event.key.toUpperCase();

        // Si es la barra espaciadora, la reemplazamos por un espacio real
        if (event.code === 'Space') {
            letra = ' ';
        }

        // Enviamos la letra a la misma función que usará el Arduino
        procesarDatoArduino(letra);
    });

    // =========================================================================
    // BOTONES DE ACCIÓN
    // =========================================================================

    // Botón de Retroceso (Backspace)
    const btnBackspace = document.getElementById('btn-backspace');
    if (btnBackspace) {
        btnBackspace.addEventListener('click', () => {
            if (textoAcumulado.length > 0) {
                // Quitamos la última letra
                textoAcumulado = textoAcumulado.slice(0, -1);
                
                // Actualizamos el display de texto
                const displayTexto = document.getElementById('texto-traducido');
                if (displayTexto) {
                    displayTexto.innerHTML = textoAcumulado === '' ? '<span class="placeholder">Esperando datos para traducir...</span>' : textoAcumulado;
                }
                
                // Actualizamos la secuencia de imágenes
                renderizarSecuenciaImagenes();
            }
        });
    }

    // Botón de Borrar Todo (Basurero)
    const btnBorrar = document.getElementById('btn-borrar');
    if (btnBorrar) {
        btnBorrar.addEventListener('click', () => {
            document.getElementById('texto-traducido').innerHTML = '<span class="placeholder">Esperando datos para traducir...</span>';
            document.getElementById('valor-arduino').innerHTML = '<span class="placeholder">--</span>';
            textoAcumulado = '';
            
            const contenedorSecuencia = document.getElementById('secuencia-imagenes');
            if(contenedorSecuencia) contenedorSecuencia.innerHTML = '';
            
            const imagenSena = document.getElementById('imagen-sena');
            if(imagenSena) imagenSena.classList.remove('active');
        });
    }

    // Botón de Audio (Escuchar)
    const btnAudio = document.getElementById('btn-audio');
    if (btnAudio) {
        btnAudio.addEventListener('click', () => {
            if (textoAcumulado.trim() !== '') {
                window.speechSynthesis.cancel(); // Detenemos audios anteriores
                
                const speech = new SpeechSynthesisUtterance(textoAcumulado);
                speech.lang = 'es-MX'; // Español de México
                
                // Buscamos una voz humana fluida si existe
                let vozElegida = vocesDisponibles.find(voz => 
                    voz.name.includes('Google español') || 
                    voz.name.includes('Sabina') || 
                    voz.name.includes('Helena') || 
                    voz.name.includes('Paulina')
                );

                if (!vozElegida) {
                    vozElegida = vocesDisponibles.find(voz => voz.lang.startsWith('es'));
                }

                if (vozElegida) {
                    speech.voice = vozElegida;
                }

                // Ajustes para hacerla más lenta, suave, expresiva y llamativa
                speech.rate = 0.58; // Mucho más lenta y deliberada
                speech.pitch = 1.20; // Tono más suave y expresivo
                
                window.speechSynthesis.speak(speech);
            } else {
                alert("No hay texto para reproducir todavía. Escribe algunas letras primero.");
            }
        });
    }
});

// =========================================================================
// FUNCIÓN PRINCIPAL QUE PROCESA LOS DATOS (Esta la usarás con el Arduino real)
// =========================================================================
function procesarDatoArduino(letra) {
    // 1. Mostrar la letra individual en el cuadro pequeño
    const displayValor = document.getElementById('valor-arduino');
    if (displayValor) {
        // Si es un espacio, mostramos un símbolo visual para que se note
        displayValor.innerHTML = letra === ' ' ? '␣' : letra;
        
        // Pequeña animación al recibir el dato
        displayValor.style.transform = "scale(1.1)";
        setTimeout(() => displayValor.style.transform = "scale(1)", 200);
    }

    // 1.5. Mostrar la imagen de la seña correspondiente
    const imagenSena = document.getElementById('imagen-sena');
    if (imagenSena) {
        if (letra !== ' ') {
            // Asumimos que guardaste las imágenes en "public/img/senas/A.png", etc.
            imagenSena.src = `img/senas/${letra}.png`;
            imagenSena.classList.add('active');
            
            // Animación pop para la imagen
            imagenSena.style.transform = "scale(0.9)";
            setTimeout(() => imagenSena.style.transform = "scale(1)", 150);
            
            // Si la imagen de esa letra no existe, se oculta para no mostrar error
            imagenSena.onerror = () => {
                imagenSena.classList.remove('active');
            };
        } else {
            // Si es un espacio, ocultamos la imagen
            imagenSena.classList.remove('active');
        }
    }

    // 2. Añadir la letra al texto traducido grande para formar palabras y oraciones
    const displayTexto = document.getElementById('texto-traducido');
    if (displayTexto) {
        // Si es la primera letra, borramos el placeholder "Esperando datos..."
        if (textoAcumulado === '') {
            displayTexto.innerHTML = '';
        }

        // Concatenamos la nueva letra a lo que ya estaba escrito (sin borrar lo anterior)
        textoAcumulado += letra;
        displayTexto.innerHTML = textoAcumulado;
    }

    // 3. Renderizar la secuencia de imágenes para todas las letras
    renderizarSecuenciaImagenes();
}

// =========================================================================
// FUNCIÓN PARA LEER DATOS DEL ARDUINO EN TIEMPO REAL
// =========================================================================
async function leerDatosSerial(port) {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    let bufferString = "";

    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            bufferString += value;
            
            // Separamos por saltos de línea (ya que el Arduino usa Serial.println)
            let lines = bufferString.split('\n');
            
            // El último elemento puede estar incompleto, lo dejamos en el buffer
            bufferString = lines.pop();

            for (let line of lines) {
                line = line.trim();
                
                // Buscamos específicamente el texto ">>> LETRA: " que imprime tu Arduino
                if (line.startsWith(">>> LETRA: ")) {
                    // Extraemos solo la letra
                    let letraReal = line.replace(">>> LETRA: ", "").trim();
                    
                    // Nos aseguramos de que sea válida y no sea "-"
                    if (letraReal.length > 0 && letraReal !== "-") {
                        // Enviamos la letra detectada a la misma función que actualiza la pantalla
                        procesarDatoArduino(letraReal);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error leyendo datos del Arduino:", error);
        
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        if(statusIndicator && statusText) {
            statusIndicator.classList.remove('connected');
            statusIndicator.classList.add('waiting');
            statusText.textContent = "Desconectado. Error de lectura.";
            statusText.style.color = "#e74c3c";
        }
    } finally {
        reader.releaseLock();
    }
}

// =========================================================================
// FUNCIÓN PARA ACTUALIZAR EL CONTENEDOR DE IMÁGENES
// =========================================================================
function renderizarSecuenciaImagenes() {
    const contenedor = document.getElementById('secuencia-imagenes');
    if (!contenedor) return;
    
    contenedor.innerHTML = ''; // Limpiamos las imágenes previas
    
    // Iteramos sobre todas las letras acumuladas para recrear la secuencia de imágenes
    for (let i = 0; i < textoAcumulado.length; i++) {
        const letraActual = textoAcumulado[i].toUpperCase();
        
        if (letraActual === ' ') {
            const divEspacio = document.createElement('div');
            divEspacio.className = 'img-espacio';
            contenedor.appendChild(divEspacio);
        } else {
            const img = document.createElement('img');
            img.src = `img/senas/${letraActual}.png`;
            img.alt = letraActual;
            
            // Si la imagen no existe, no mostramos un ícono roto
            img.onerror = function() {
                this.style.display = 'none';
            };
            
            contenedor.appendChild(img);
        }
    }
}
