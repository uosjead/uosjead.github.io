/*
    todo:
    1. completion state
    2. 80% difficulty rule
*/

document.addEventListener("DOMContentLoaded", function() {
    let characterInputs = document.getElementById("characters");
    let divs = characterInputs.getElementsByTagName("textarea");
    divs[0].value = getCharactersRange();
});

function getCharactersRange() {
    let text = localStorage.getItem("characters");
    var charactersText = "";
    if (text) {
        let characterRanges = JSON.parse(text);
        charactersText = characterRanges[0].characters;
    }
    if (charactersText.length === 0) {
        charactersText = Array.from({length: 127-33}, (_, i) => String.fromCharCode(33 + i)).join("");
    }
    return charactersText;
}


function randomIntergerBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateText() {
    let characterRange = getCharactersRange();
    let characters = characterRange.split("");
    //add wrong characters
    characters = characters.concat(gotWrong.split(""));
    let max = 120, min = 50;
    let overallLength = randomIntergerBetween(min, max);
    let text = "";
    while (text.length < overallLength) {
        let wordLength = randomIntergerBetween(3, 5);
        for(_ of Array(wordLength).keys()) {
            let randomCharacterIndex = randomIntergerBetween(0, characters.length - 1);
            text += characters[randomCharacterIndex];
        }
        text += Math.random() < 0.8 ? " " : "\n";
    }
    text = text.trim();
    let gameInput = document.getElementById("input");
    gameInput.innerHTML = text;
    document.getElementById("output").value = "";
    document.getElementById("speedo").innerHTML = "0 wpm 100% " + gotWrong.length;
    document.getElementById("output").focus();
}

function characterRangeChange(e) {
    let characterInputs = document.getElementById("characters");
    let divs = characterInputs.getElementsByTagName("textarea");
    let textRanges = [];
    for(let el of divs) {
        textRanges.push({
            characters: el.value,
            weight: 1,
        });
    }
    localStorage.setItem("characters", JSON.stringify(textRanges));
}

function characterRangeChange2(e) {
    console.log(e);
}

function highlightInput() {
    let gameInput = document.getElementById("input");
    let inputText = gameInput.innerText.replaceAll("\u21B5\n", "\n");
    let gameOutput = document.getElementById("output");
    let outputText = gameOutput.value;
    let boundaries = [];
    if (outputText.length > 0) {
        let previous = 0;
        let correct = outputText.substring(previous, 1) === inputText.substring(previous, 1);
        for (i of Array(outputText.length).keys()) {
            if (outputText.substring(i, i + 1) === inputText.substring(i, i + 1)) {
                if (correct === false) {
                    boundaries.push([
                        previous,
                        i,
                        outputText.substring(previous, i) === inputText.substring(previous, i)
                    ]);
                    previous = i;
                    correct = true;
                }
            } else {
                if (correct === true) {
                    boundaries.push([
                        previous,
                        i,
                        outputText.substring(previous, i) === inputText.substring(previous, i)
                    ]);
                    previous = i
                    correct = false;
                }
            }
        }
        boundaries.push([
            previous,
            outputText.length,
            outputText.substring(previous, outputText.length) === inputText.substring(previous, outputText.length)
        ]);
        let highlightedText = "";
        if(boundaries.length) {
            boundaries.forEach((el) => {
                highlightedText += "<span class=\"" + (el[2] ? "correct" : "incorrect") + "\">" + inputText.substring(el[0], el[1]).replaceAll("\n", "\u21B5\n") + "</span>";
            });
            highlightedText += inputText.substring(boundaries[boundaries.length - 1][1]);
        }
        gameInput.innerHTML = highlightedText;
    } else {
        gameInput.innerHTML = gameInput.innerText;
    }
}

function evalutateGame() {
    let outputText = document.getElementById("output").value;
    let now = new Date();
    if(outputText.length === 1) {
        gameTimer = now;
    }
    if (outputText.length > 1 && now > gameTimer) {
        let timeTaken = now - gameTimer;
        let timeTakenMinutes = timeTaken / (60 * 1000);
        wpm = ((outputText.length / 5) / timeTakenMinutes);
        let correct = 0;
        let inputText = document.getElementById("input").innerText.replaceAll("\u21B5\n", "\n"); 
        [...outputText].forEach((value,  index) => {
            if (index < inputText.length && inputText.charAt(index) === outputText.charAt(index)) {
                correct++;
            }
        });
        let percentageCorrect = Math.round(10 * 100 * correct / outputText.length) / 10;
        document.getElementById("speedo").innerHTML = Math.floor(wpm) + " wpm " + percentageCorrect + "% " + gotWrong.length;
    }
    highlightInput();
    // track errors
    let inputText = document.getElementById("input").innerText.replaceAll("\u21B5\n", "\n");
    outputText = document.getElementById("output").value;
    let lastTestedCharacter = inputText.substring(outputText.length - 1, outputText.length);
    let lastTypedCharacter = outputText.substring(outputText.length - 1);
    if(outputText.length <= inputText.length && [" ", "\n"].indexOf(lastTestedCharacter) === -1 && lastTestedCharacter.charCodeAt(0) > 32) {
        if (lastTypedCharacter !== lastTestedCharacter) {
            gotWrong += lastTestedCharacter;
            gotWrong += lastTestedCharacter;
            gotWrong += lastTestedCharacter;
        } else {
            gotWrong = gotWrong.replace(lastTestedCharacter, "");
        }
        localStorage.setItem("gotWrong", gotWrong);
    }
}

var gameTimer = new Date();
var gotWrong = localStorage.getItem("gotWrong") || "";
