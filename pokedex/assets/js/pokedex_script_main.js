//Thanks to https://www.deviantart.com/zel-duh for his 'rocking pokeball gif'


//sonido pokemoncries.com/cries/{id}.mp3        id>650
//                       /cries-old/{id}.mp3    id<650
//stats pokeapi.co/pokemon/?list=883


console.log("height: " + window.innerHeight, "width: " + window.innerWidth)


//Global Variables
var pokemonNamesArray
var pokemonEncontrado
var pokedexHeight // its updated after resizing the window browser, its used to change the #pokeInfo position for "Mas pokemones"
var found = {
    status: Boolean,
    is: (bulean) => {
        found.status = bulean;
    }
}

window.onload = function() {
    $("#loading-img").hide();
    CanvasJS.addColorSet("primarios", [ //colorSet Array
        // "orange",
        // "purple",
        // "blue",
        // "yellow",
        // "red",   
        // "green"
        "#03e603",
        "red",
        "blue",
        "#ff00dd",
        "#a1008c",
        "yellow"

    ]);


    //Acá se carga la lista inicial de los nombres de todos los pokemones
    //?limit= limita la busqueda... por sobre 889 hay pokemones con ropa que puede que no tengan ni imagen ni sonido
    var limit = 802; //limite seguro de pokemones con imagen y sonido
    $.ajax({
        url: `https://pokeapi.co/api/v2/pokemon/?limit=${limit}`,
    }).done(function(data) {
        var i;
        pokemonNamesArray = data.results
    })

    //se utiliza como alto el menor de los tamaños entre el width y el height
    updatePokedexHeight()
}



function updatePokedexHeight() {
    var alpha = 0.8; //porcentaje para disminuir el tamaño del pokedex
    var offsetH = 0.30; //% altura de TOP de #infoBox segun altura de pokedex
    if (window.innerHeight > window.innerWidth) {
        $(`#pokedex`).attr(`style`, `height:${alpha*100}vw; width:${alpha*96.3}vw`)
        $(`html`).attr(`style`, `font-size: ${alpha*2.6}vw`)
        pokedexHeight = offsetH * alpha * 100
        $("#infoBox").attr(`style`, `top:50vw`)

    } else {
        $(`#pokedex`).attr(`style`, `height:${alpha*100}vh; width:${alpha*96.3}vh`)
        $(`html`).attr(`style`, `font-size: ${alpha*2.6}vh`)
        pokedexHeight = offsetH * alpha * 100;
        $("#infoBox").attr(`style`, `top:${pokedexHeight}vh`)
    }
    console.log("newH: " + window.innerHeight)
}
window.addEventListener('resize', updatePokedexHeight)
    // $(window).on('resize', updatePokedexHeight())

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function() {
    $('#formulario').submit(function(event) {
        found.is(false);
        // alert("submited")
        event.preventDefault();
        $(':focus').blur();
        var nombreBuscado = $("#buscador").val().toLowerCase();

        //fuse search options //approximate string matching
        const options = {
            includeScore: true,
            keys: ['name']
        }
        const fuse = new Fuse(pokemonNamesArray, options);
        const resultadoBusqueda = fuse.search(nombreBuscado);
        if (resultadoBusqueda[0] != undefined) {
            pokemonEncontrado = resultadoBusqueda[0].item.name;
            console.log(resultadoBusqueda)
            $("#pokeInfo").empty();
            $("#pStats").empty();

            $("#loading-img").show();
            $.ajax({
                url: `https://pokeapi.co/api/v2/pokemon/${pokemonEncontrado}/`, //ajax
                error: () => {
                    $('#pokeInfo').append(`<div class="text-center my-3 " style="color:red;"> <p>404 - NO MATCH</p> <div>`);
                },
                complete: () => {
                    $("#loading-img").hide();
                }
            }).done(function(data) {

                if (data) {
                    var dataChart = data.stats;
                    var i;
                    // for (i = dataChart.length - 1; i >= 0; i--) { // ciclos.
                    //     dataChart[dataChart.length - 1 - i].label = dataChart[i]['stat'].name;

                    //     dataChart[dataChart.length - 1 - i].y = dataChart[i]['base_stat'];

                    //     console.log("att " + i + " " + dataChart[i].label)
                    // }    
                    largo = dataChart.length;
                    for (i = 0; i < largo; i++) { // ciclos.
                        dataChart[i].label = dataChart[i]['stat'].name;
                        dataChart[i].y = dataChart[i]['base_stat'];
                        console.log("att " + i + " " + dataChart[i].label)
                    }
                    dataChart.reverse();
                    dataChart[0].label = "HP";
                    dataChart[1].label = "ATK"
                    dataChart[2].label = "DEF"
                    dataChart[3].label = "S-ATK"
                    dataChart[4].label = "S-DEF"
                    dataChart[5].label = "SPD"


                    console.log("Sample of data, ID: " + data.id, data);

                    console.log("encontrado: " + found.status)
                        //el pokemon ruge cuando es encontrado con la funcion rugir
                    rugir(data.id);
                    $('#pokeInfo').append(`<div class="text-center texto my-3"> <h3>${capitalizar(data.name)}</h3> <div>`); //jquery
                    $("#pokeInfo").append(`<img id="pImg" height="250px" onclick="rugir('${data.id}')" src="${data.sprites.front_default}" alt="${data.name}"> <img>`);
                    $("#pokeInfo").append(`<div class="text-center texto my-3"> <p>Peso: ${data.weight/10} [kg]<p> <div>`);
                    var options = {
                        animationEnabled: true,
                        backgroundColor: "#000000",
                        colorSet: 'primarios',

                        title: {
                            text: ``
                        },
                        axisY: {
                            title: "",
                            includeZero: false
                        },
                        axisX: {
                            title: "Stats"
                        },
                        data: [{
                            type: "column",
                            dataPoints: dataChart
                        }]
                    };
                    $("#pStats").CanvasJSChart(options);
                    $(".canvasjs-chart-credit").empty()
                        //  $(".canvasjs-chart-container").attr("top", "20px")
                }
                found.is(true);
                $("#encontrado-mensaje").removeClass("al-fondo")
                $("#encontrado-mensaje").addClass("al-frente")
                $("#noencontrado-mensaje").addClass("al-fondo")
                $("#noencontrado-mensaje").removeClass("al-frente")
                console.log("encontrado")


                //Append la coincidencias de pokemones como un listado en infoBox
                $('#pokemonList').empty();
                if (!document.getElementById('title')) {
                    $("#infoBox").prepend('<h10 id="title">Más Pokemones:</h10>');
                }

                var i = 1;
                while (i < 11 && resultadoBusqueda[i]) {
                    $('#pokemonList').append(`<div onmouseover="highLight('${i}', 'on')" onmouseout="highLight('${i}','off')" onclick="submiting('${resultadoBusqueda[i].item.name}')" id ="coincidencia${i}" class=" my-1 link-list-item" style="">${i} - ${capitalizar(resultadoBusqueda[i].item.name)}</div>`)
                    $(`#coincidencia${i}>p`).show('slow')
                    i++
                }
            });

        } else /* si la "palabra clave buscada" no encuentra una coincidencia en el array de pokemones */ {

            //entonces, agregar un NO MATCH en la pantalla principal
            $('#pokeInfo').empty();
            $('#pStats').empty();
            $('#pokeInfo').append(`<div class="text-center my-3 " style="color:red;"> <p>404 - NO MATCH</p> <div>`);
        }

    });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function submiting(pokemonDeLista) {

    found.is(false);
    // alert("submited")

    $(':focus').blur();
    console.log(pokemonDeLista)
    var nombreBuscado = pokemonDeLista.toLowerCase();

    //fuse search options //approximate string matching
    const options = {
        includeScore: true,
        keys: ['name']
    }
    const fuse = new Fuse(pokemonNamesArray, options);
    const resultadoBusqueda = fuse.search(nombreBuscado);
    if (resultadoBusqueda[0] != undefined) {
        pokemonEncontrado = resultadoBusqueda[0].item.name;
        console.log(resultadoBusqueda)
        $("#pokeInfo").empty();
        $("#pStats").empty();

        $("#loading-img").show();
        $.ajax({
            url: `https://pokeapi.co/api/v2/pokemon/${pokemonEncontrado}/`, //ajax
            error: () => {
                $('#pokeInfo').append(`<div class="text-center my-3 " style="color:red;"> <p>404 - NO MATCH</p> <div>`);
            },
            complete: () => {
                $("#loading-img").hide();
            }
        }).done(function(data) {

            if (data) {
                var dataChart = data.stats;
                var i; // for (i = dataChart.length - 1; i >= 0; i--) { // ciclos.
                //     dataChart[dataChart.length - 1 - i].label = dataChart[i]['stat'].name;

                //     dataChart[dataChart.length - 1 - i].y = dataChart[i]['base_stat'];

                //     console.log("att " + i + " " + dataChart[i].label)
                // }


                for (i = 0; i < dataChart.length; i++) { // ciclos.
                    dataChart[i].label = dataChart[i]['stat'].name;
                    dataChart[i].y = dataChart[i]['base_stat'];
                    console.log("att " + i + " " + dataChart[i].label)
                }
                dataChart.reverse();
                dataChart[0].label = "HP";
                dataChart[1].label = "ATK"
                dataChart[2].label = "DEF"
                dataChart[3].label = "S-ATK"
                dataChart[4].label = "S-DEF"
                dataChart[5].label = "SPD"

                console.log("Sample of data, ID: " + data.id, data);

                console.log(found.status)
                rugir(data.id)
                $('#pokeInfo').append(`<div class="text-center texto my-3"> <h3>${capitalizar(data.name)}</h3> <div>`); //jquery
                $("#pokeInfo").append(`<img  onclick="rugir('${data.id}')" src="${data.sprites.front_default}" alt="${data.name}"> <img>`);
                $("#pokeInfo").append(`<div class="text-center texto my-3"> <p>Peso: ${data.weight/10} [kg]<p> <div>`);
                var options = {
                    animationEnabled: true,
                    backgroundColor: "#000000",
                    colorSet: 'primarios',

                    title: {
                        text: "     "
                    },
                    axisY: {
                        title: "",
                        includeZero: false
                    },
                    axisX: {
                        title: "Stats"
                    },
                    data: [{
                        type: "column",
                        dataPoints: dataChart
                    }, ],
                    indexLabelPlacement: "inside"

                };
                $("#pStats").CanvasJSChart(options);
                $(".canvasjs-chart-credit").empty()
            }
            found.is(true);
            $("#encontrado-mensaje").removeClass("al-fondo")
            $("#encontrado-mensaje").addClass("al-frente")
            $("#noencontrado-mensaje").addClass("al-fondo")
            $("#noencontrado-mensaje").removeClass("al-frente")
            console.log("encontrado")

            //Append la coincidencias de pokemones como un listado en infoBox
            $('#pokemonList').empty();
            if (!document.getElementById('title')) {
                $("#infoBox").prepend('<p id="title">Más Pokemones:</p><br><br>');
            }
            var i = 1;
            while (i < 11 && resultadoBusqueda[i]) {
                $('#pokemonList').append(`<div onmouseover="highLight('${i}', 'on')" onmouseout="highLight('${i}','off')" onclick="submiting('${resultadoBusqueda[i].item.name}')" id ="coincidencia${i}" class=" my-1 link-list-item" style="">${i} - ${capitalizar(resultadoBusqueda[i].item.name)}</div>`)
                $(`#coincidencia${i}>p`).show('slow')
                i++
            }
        });

    }

};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


for (var i = 0; i < 10; i++) {
    $
}

//esta funcion es para la lista de pokemones, es para que se prenda el nombre al ponerse encima
function highLight(i, onOff) {
    console.log("sobrelink");
    if (onOff === 'on') {
        eval("coincidencia" + i + ".style.color = 'green'")
    } else {
        eval("coincidencia" + i + ".style.color = 'black'")

    }
}


function resetScreen() {
    $('.busqueda').attr("placeholder", "");
    $('#buscador').empty()
    $("#encontrado-mensaje").removeClass("al-frente");
    $("#noencontrado-mensaje").removeClass("al-frente");
    $("#encontrado-mensaje").addClass("al-fondo");
    $("#noencontrado-mensaje").addClass("al-fondo");
}

function capitalizar(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function rugir(pokemonId) {
    console.log("rugiendo")
        //play pokemon audio from pokemoncries.com
    if (pokemonId < 650) {
        var audioTest = new Audio(`https://pokemoncries.com/cries-old/${pokemonId}.mp3`)
    } else {
        var audioTest = new Audio(`https://pokemoncries.com/cries/${pokemonId}.mp3`)
    }
    audioTest.play();
    //fin audioplay
}
//FOR BUILDING TESTING

// function() {
//     $("#pokeinfo")
// }