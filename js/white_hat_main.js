const myTestButton = document.getElementById("myTestButton")
let myButtonClicked = true;

function showInitialViz() {
    let script = document.createElement('script');
    script.src = "js/white_hat_viz.js";

    document.head.appendChild(script);
}

showInitialViz();

function removeElementsAndAdd(path) {
    const mapSvg = document.getElementById("mapSvg");
    const legendCanvas = document.getElementById("legendCanvas");

    if (mapSvg !== null) {
        mapSvg.remove();
    }

    if (legendCanvas !== null) {
        legendCanvas.remove();
    }

    let script = document.createElement('script');
    script.src = path;

    document.head.appendChild(script);
}

myTestButton.onclick = function () {

    if (!myButtonClicked) {
        myButtonClicked = !myButtonClicked;
        removeElementsAndAdd("js/white_hat_viz.js");
    } else {
        myButtonClicked = !myButtonClicked;
        removeElementsAndAdd("js/black_hat_viz.js");
    }
};



