// ==========================================================
// 👉 FORMATOS Y UTILIDADES
// ==========================================================

// Formatea automáticamente el valor del campo como COP al escribir
function formatearCOP(input) {
    let valor = input.value.replace(/\D/g, '');
    input.value = new Intl.NumberFormat('es-CO').format(valor);
}

// Extrae número limpio de un campo input formateado
function obtenerValorNumerico(id) {
    let valor = document.getElementById(id).value.replace(/\./g, '').replace(/,/g, '');
    return parseInt(valor) || 0;
}

// Mapeo de periodicidad a número de meses por periodo académico
const mapPeriodicidadMeses = {
    mensual: 1,
    bimestral: 2,
    trimestral: 3,
    cuatrimestral: 4,
    semestral: 6,
    anual: 12
};

// Diccionario: porcentaje del desembolso a amortizar durante estudios por línea
const condicionesLineaCredito = {
    "Plan flexible": 0.30,
    "Plan equilibrio": 0.60,
    "Plan ágil": 1.00,
    "Plan posgrado para medicina en Colombia": 0.00,
    "Plan para Educación para el Trabajo": 0.30,
    "Plan posgrado en el país": 0.20,
    "Plan posgrado para fuera de Colombia": 0.00,
    "Plan segundo idioma": 0.30,
    "Plan para Bienestar fuera de Colombia": 0.00,
    "Plan Saber Más": 0.30
};



// Formatea un número como COP
function formatearNumero(num) {
    return num.toLocaleString('es-CO');
}

function verificarBotonPostEstudios() {
    const linea = document.getElementById("linea_credito").value;
    const boton = document.getElementById("btnPostEstudios");

    if (linea === "Plan ágil") {
        boton.style.display = "none";
    } else {
        boton.style.display = "inline-block";
    }
}
function calcularResumenLinea(valorPeriodo, numPeriodos, periodicidad, lineaCredito) {
    const mapPeriodicidadMeses = {
        mensual: 1,
        bimestral: 2,
        trimestral: 3,
        cuatrimestral: 4,
        semestral: 6,
        anual: 12
    };

    const condicionesLineaCredito = {
        "Plan flexible": 0.30,
        "Plan equilibrio": 0.60,
        "Plan ágil": 1.00,
        "Plan posgrado para medicina en Colombia": 0.00,
        "Plan para Educación para el Trabajo": 0.30,
        "Plan posgrado en el país": 0.20,
        "Plan posgrado para fuera de Colombia": 0.00,
        "Plan segundo idioma": 0.30,
        "Plan para Bienestar fuera de Colombia": 0.00,
        "Plan Saber Más": 0.30
    };
    const spread = {
    "Plan flexible": 0.09,
    "Plan equilibrio": 0.07,
    "Plan ágil": 0.07,
    "Plan posgrado para medicina en Colombia": 0.08,
    "Plan para Educación para el Trabajo": 0.09,
    "Plan posgrado en el país": 0.08,
    "Plan posgrado para fuera de Colombia": 0.08,
    "Plan segundo idioma": 0.08,
    "Plan para Bienestar fuera de Colombia": 0.08,
    "Plan Saber Más": 0.08
    };

    const ipc = 0.052;

    // 👉 Normalización para evitar errores de mayúsculas
    const lineaNormalizada = Object.keys(spread).find(key => key.toLowerCase() === lineaCredito.toLowerCase());
    const spreadValor = lineaNormalizada ? spread[lineaNormalizada] : 0.08;

    // 🟦 Cálculo de tasas
    const tasaEA = (1 + ipc) * (1 + spreadValor) - 1;
    const tasaNAMV = tasaEA * 100;
    const tasaMV = tasaNAMV / 12;

    // 🟦 Mostrar tasas en el resumen
    document.getElementById("resumen_tasa_anual").innerText = `${tasaNAMV.toFixed(2)}% NAMV`;
    document.getElementById("resumen_tasa").innerText = `${tasaMV.toFixed(2)}% MV`;

    const mesesPorPeriodo = mapPeriodicidadMeses[periodicidad] || 6;
    const totalMeses = numPeriodos * mesesPorPeriodo;
    const porcentaje = condicionesLineaCredito[lineaCredito] || 0;
    const capital = valorPeriodo * porcentaje;

    const cuota = capital > 0 ? Math.round((capital * tasaMV_decimal) / (1 - Math.pow(1 + tasaMV_decimal, -mesesPorPeriodo))) : 0;
    const AFPC = Math.round(valorPeriodo * 0.02);

    // Descripción de la línea
    const descripcionPlan = {
        "Plan flexible": "Pagas el 30% mientras estudias y el 70% luego de graduarte. Lo pagas en 1,5 veces el tiempo de estudios.",
        "Plan equilibrio": "Pagas el 60% mientras estudias y el 40% luego de graduarte. Lo pagas en 1,5 veces el tiempo de estudios.",
        "Plan ágil": "Financia el 100% de la matrícula y págalo en cuotas mensuales durante el semestre.",
        };

    // Mostrar en el resumen
    document.getElementById("resumen_tasa").innerText = `${tasaMV.toFixed(2)}% MV`;

    // Determinar cuotas de amortización
    let cuotasAmortizacion = 0;
    if (lineaCredito === "Plan flexible") {
        cuotasAmortizacion = Math.round(totalMeses * 1.5);
    } else if (lineaCredito === "Plan equilibrio") {
        cuotasAmortizacion = totalMeses;
    } else if (lineaCredito === "Plan posgrado para medicina en Colombia" || lineaCredito === "Plan posgrado en el país") {
        cuotasAmortizacion = totalMeses * 2;
    } else if (lineaCredito === "Plan para Educación para el Trabajo") {
        cuotasAmortizacion = Math.round(totalMeses * 1.5);
    } else if (lineaCredito === "Plan segundo idioma", "Plan Saber Más") {
        cuotasAmortizacion = 24;
    } else if (["Plan posgrado para fuera de Colombia", "Capacitación de Idiomas en el exterior", "Plan para Bienestar fuera de Colombia"].includes(lineaCredito)) {
        cuotasAmortizacion = 60;
    }

    return {
        cuotaSinAFPC: cuota,
        tasa: tasaEA,
        AFPC: AFPC,
        duracion: totalMeses,
        cuotasEstudios: totalMeses,
        cuotasAmortizacion: cuotasAmortizacion,
        tasaDetalle: `IPC + ${(spreadLinea * 100).toFixed(0)}%`
    };
}


// ==========================================================
// 👉 SIMULACIÓN DE AMORTIZACIÓN DURANTE ESTUDIOS
// ==========================================================
function simularEtapaEstudios() {
    
    const valorPeriodo = obtenerValorNumerico("valor_periodo");
    const numPeriodos = parseInt(document.getElementById("num_periodos").value);
    const periodicidad = document.getElementById("periodicidad").value;
    const mesesPorPeriodo = mapPeriodicidadMeses[periodicidad] || 6;
    const lineaSeleccionada = document.getElementById("linea_credito").value;

    const porcentajeAmortizar = condicionesLineaCredito[lineaSeleccionada];
    if (porcentajeAmortizar === undefined) {
        alert("Selecciona una línea de crédito válida.");
        return;
    }

    const subtitulosLineaCredito = {
        "Plan flexible": "Mediano plazo Tú eliges 30%",
        "Plan equilibrio": "Mediano plazo Tú eliges 60%",
        "Plan ágil": "Corto plazo Tú eliges 100%",
        "Plan posgrado para medicina en Colombia": "Posgrado País Medicina",
        "Plan posgrado en el país": "Posgrado País",
        "Plan para Educación para el Trabajo": "Educación para el trabajo y el desarrollo humano",
        "Plan posgrado para fuera de Colombia": "Posgrado Exterior Largo Plazo USD 25.000",
        "Plan segundo idioma": "Capacitación de Idiomas en el país",
        "Plan Saber Más": "Diplomados o certificaciones en el país"
    };

    const ipc = 0.052;
    const spread = {
        "Plan flexible": 0.09,
        "Plan equilibrio": 0.07,
        "Plan ágil": 0.07,
        "Plan posgrado para medicina en Colombia": 0.08,
        "Plan para Educación para el Trabajo": 0.09,
        "Plan posgrado en el país": 0.08,
        "Plan posgrado para fuera de Colombia": 0.08,
        "Plan segundo idioma": 0.08,
        "Plan para Bienestar fuera de Colombia": 0.08,
        "Diplomados o certificaciones en el país": 0.08
    }[lineaSeleccionada] || 0.08;

    const tasaEA = (1 + ipc) * (1 + spread) - 1;
    const tasaMV = Math.pow(1 + tasaEA, 1 / 12) - 1;
    const incremento = (1 + ipc) * (1 + 0.02) - 1;
    document.getElementById("resumen_tasa").innerText = `${(tasaMV * 100).toFixed(2)}% MV`;
    document.getElementById("resumen_tasa_anual").innerText = `${(tasaMV * 100 * 12).toFixed(2)}% NAMV`;
    document.getElementById("btnEstudios").classList.add("boton-activo");
    document.getElementById("btnPostEstudios").classList.remove("boton-activo");

    let tablaHTML = `
        <h4 style="margin-bottom: 0.3rem; color: #003399; font-size: 1.2rem; font-weight: 600;">
        ${subtitulosLineaCredito[lineaSeleccionada] || ""}
        </h4>

        <h4>Tabla de amortización durante estudios</h4>
        <div class="responsive-table-container">
        <table>
            <tr>
                <th>Mes</th>
                <th>Desembolso</th>
                <th>AFPC</th>
                <th>Intereses</th>
                <th>Abono a capital</th>
                <th>Cuota mensual</th>
                <th>Saldo capital (en estudios)</th>
            </tr>
            </div>
    `;

    const totalMeses = numPeriodos * mesesPorPeriodo;
    let mesActual = 1;
    let resumenMonto = 0;
    let amortizaciones = [];

    for (let i = 0; i < totalMeses; i++) {
        const periodoIndex = Math.floor(i / mesesPorPeriodo);
        const esMesDesembolso = i % mesesPorPeriodo === 0 && periodoIndex < numPeriodos;

        let desembolso = 0;
        let AFPC = 0;

        if (esMesDesembolso) {
            const factorIncremento = Math.pow(1 + incremento, Math.floor(i / 12));
            const valorAjustado = Math.round(valorPeriodo * factorIncremento);
            desembolso = valorAjustado;
            resumenMonto += desembolso;

            AFPC = Math.round(desembolso * 0.02);

            const capitalEstudios = Math.round(valorAjustado * porcentajeAmortizar);
            const n = mesesPorPeriodo;

            const cuota = capitalEstudios > 0
                ? Math.round((capitalEstudios * tasaMV) / (1 - Math.pow(1 + tasaMV, -n)))
                : 0;

            amortizaciones.push({
                saldo: capitalEstudios,
                cuota: cuota,
                mesesRestantes: n
            });
        }

        let interesesMes = 0;
        let abonoMes = 0;
        let cuotaMes = 0;
        let saldoEstudios = 0;

        amortizaciones.forEach(amort => {
            if (amort.saldo > 0 && amort.mesesRestantes > 0) {
                const interes = Math.round(amort.saldo * tasaMV);
                let abono, cuotaFinal;

                if (amort.mesesRestantes === 1) {
                    abono = amort.saldo;
                    cuotaFinal = interes + abono;
                    amort.saldo = 0;
                } else {
                    abono = Math.max(0, amort.cuota - interes);
                    cuotaFinal = amort.cuota;
                    amort.saldo = Math.max(0, amort.saldo - abono);
                }

                amort.mesesRestantes--;

                interesesMes += interes;
                abonoMes += abono;
                cuotaMes += cuotaFinal;
                saldoEstudios += amort.saldo;
            }
        });

        const cuotaTotal = cuotaMes + AFPC;

        tablaHTML += `
            <tr>
                <td>${mesActual}</td>
                <td>$${formatearNumero(desembolso)}</td>
                <td>$${formatearNumero(AFPC)}</td>
                <td>$${formatearNumero(interesesMes)}</td>
                <td>$${formatearNumero(abonoMes)}</td>
                <td>$${formatearNumero(cuotaTotal)}</td>
                <td>$${formatearNumero(saldoEstudios)}</td>
            </tr>
        `;

        mesActual++;
    }

    tablaHTML += "</table>";
    document.getElementById("tablaAmortizacion").innerHTML = tablaHTML;
    document.getElementById("resumen_monto").innerText = "$" + formatearNumero(resumenMonto);
    document.getElementById("resumen_cuota").innerText = "Según fórmula PAGO";
    document.getElementById("resumen_tasa").innerText = `${(tasaMV * 100).toFixed(2)}% MV`;
    
    
}
function simularPostEstudios() {
    const valorPeriodo = obtenerValorNumerico("valor_periodo");
    const numPeriodos = parseInt(document.getElementById("num_periodos").value);
    const periodicidad = document.getElementById("periodicidad").value;
    const lineaSeleccionada = document.getElementById("linea_credito").value;

    const porcentajeAmortizar = condicionesLineaCredito[lineaSeleccionada];
    const porcentajePendiente = 1 - porcentajeAmortizar;
    const mesesPorPeriodo = mapPeriodicidadMeses[periodicidad] || 6;
    const totalMesesEstudios = numPeriodos * mesesPorPeriodo;

    const ipc = 0.052;
    const spread = {
        "Plan flexible": 0.09,
        "Plan equilibrio": 0.07,
        "Plan ágil": 0.07,
        "Plan posgrado para medicina en Colombia": 0.08,
        "Plan para Educación para el Trabajo": 0.09,
        "Plan posgrado en el país": 0.08,
        "Plan posgrado para fuera de Colombia": 0.08,
        "Plan segundo idioma": 0.08,
        "Plan para Bienestar fuera de Colombia": 0.08,
        "Plan Saber Más": 0.08,
    }[lineaSeleccionada] || 0.08;

    const tasaEA = (1 + ipc) * (1 + spread) - 1;
    const tasaMensual = Math.pow(1 + tasaEA, 1 / 12) - 1;

    // Paso 1: Calcular capital diferido y acumular intereses durante estudios
    let capitalDiferido = 0;
    let interesesEstudios = 0;

    for (let i = 0; i < numPeriodos; i++) {
        const anioIndex = Math.floor(i * mesesPorPeriodo / 12);
        const factorIncremento = Math.pow((1 + ipc) * (1 + 0.02), anioIndex);
        const valorAjustado = valorPeriodo * factorIncremento;
        const capitalPendiente = valorAjustado * porcentajePendiente;

        capitalDiferido += capitalPendiente;

        for (let m = 0; m < mesesPorPeriodo; m++) {
            interesesEstudios += capitalPendiente * tasaMensual;
        }
    }

    capitalDiferido = Math.round(capitalDiferido);
    interesesEstudios = Math.round(interesesEstudios);

    // Paso 2: Periodo de gracia (intereses sobre capital diferido)
    let periodoGraciaMeses = lineaSeleccionada === "Plan flexible" ? 6 : 0;
    let interesesGracia = 0;
    let mes = 1;

    let tablaHTML = `
        <h4>Tabla de amortización después de estudios</h4>
        <table>
            <tr>
                <th>Mes</th>
                <th>Saldo inicial</th>
                <th>Intereses</th>
                <th>Abono a capital</th>
                <th>Cuota</th>
                <th>Saldo</th>
            </tr>
    `;

    for (let i = 0; i < periodoGraciaMeses; i++) {
        const interes = Math.round(capitalDiferido * tasaMensual);
        interesesGracia += interes;

        tablaHTML += `
            <tr style="background-color: #e6f0ff">
                <td>${mes}</td>
                <td>$${formatearNumero(capitalDiferido)}</td>
                <td>$${formatearNumero(interes)}</td>
                <td>$0</td>
                <td>$0</td>
                <td>$${formatearNumero(capitalDiferido)}</td>
            </tr>
        `;
        mes++;
    }

    // Paso 3: Fila informativa antes de iniciar amortización
    const totalIntereses = interesesEstudios + interesesGracia;
    tablaHTML += `
        <tr style="background-color: #fff3cd; font-weight: bold;">
            <td colspan="6">
                <span style="margin-right: 8px;">⚠️</span>
                Durante la época estudios y el período de gracia, se acumularon 
                $${formatearNumero(totalIntereses)} en intereses. 
                <span title="Este valor se suma al saldo inicial para calcular el nuevo plan de pagos mensuales.">ℹ️</span>
            </td>
        </tr>
    `;

    // Paso 4: Saldo total con intereses acumulados
    let saldo = capitalDiferido + totalIntereses;

    const plazoMeses = {
        "Plan flexible": Math.round(totalMesesEstudios * 1.5),
        "Plan equilibrio": totalMesesEstudios,
        "Plan ágil": 0,
        "Plan posgrado para medicina en Colombia": totalMesesEstudios * 2,
        "Plan para Educación para el Trabajo": Math.round(totalMesesEstudios * 1.5),
        "Plan posgrado en el país": totalMesesEstudios * 2,
        "Plan posgrado para fuera de Colombia": 60,
        "Plan segundo idioma": 24,
        "Plan para Bienestar fuera de Colombia": 60,
        "Plan Saber Más": 24,
    }[lineaSeleccionada] || 0;

    if (plazoMeses === 0) {
        tablaHTML += `<tr><td colspan="6">Esta línea no tiene fase de amortización posterior.</td></tr></table>`;
        document.getElementById("tablaAmortizacion").innerHTML = tablaHTML;
        return;
    }

    const cuota = Math.round((saldo * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoMeses)));

    for (let i = 0; i < plazoMeses; i++) {
        const saldoInicial = saldo;
        const interes = Math.round(saldo * tasaMensual);
        let abono;
        let cuotaFinal;

        if (i === plazoMeses - 1) {
            abono = saldo;
            cuotaFinal = interes + abono;
            saldo = 0;
        } else {
            abono = Math.max(0, cuota - interes);
            cuotaFinal = cuota;
            saldo = Math.max(0, saldo - abono);
        }

        tablaHTML += `
            <tr>
                <td>${mes}</td>
                <td>$${formatearNumero(saldoInicial)}</td>
                <td>$${formatearNumero(interes)}</td>
                <td>$${formatearNumero(abono)}</td>
                <td>$${formatearNumero(cuotaFinal)}</td>
                <td>$${formatearNumero(saldo)}</td>
            </tr>
        `;
        mes++;
    }

    tablaHTML += "</table>";
    document.getElementById("tablaAmortizacion").innerHTML = tablaHTML;
    document.getElementById("btnPostEstudios").classList.add("boton-activo");
    document.getElementById("btnEstudios").classList.remove("boton-activo");
}
