const genderButton = document.getElementById("gender_btn")
const populationButton = document.getElementById("population_btn")
const mainTitle = document.getElementById("main_title");
const subTitle = document.getElementById("sub_title");

function showInitialViz() {
    let script = document.createElement('script');
    script.src = "js/white_hat_viz_gender.js";

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

genderButton.onclick = function () {
    removeElementsAndAdd("js/white_hat_viz_gender.js");

    mainTitle.innerText = "Murder Ratio Between Male and Female Across the U.S.";
    subTitle.innerText = "Click on each state for further information";
};

populationButton.onclick = function () {
    removeElementsAndAdd("js/white_hat_viz_population.js");

    mainTitle.innerText = "Murder Ratio Between States Normalized for Population";
    subTitle.innerText = "Click on each state for further information";
};
