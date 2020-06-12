console.log("crieScprit Started")
$(document).ready($.ajax({
    url: `https://pokemoncries.com/cries/650.mp3`
}).done((data) => {
    console.log(data)
}))