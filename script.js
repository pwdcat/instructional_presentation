document.addEventListener("DOMContentLoaded", () => {
    initializeMontyHall();
    initializeHanoi();
    initializeCaesarCipher();
});

function removeHighlights() {
    document.querySelectorAll(".highlight-hint, .highlight-hint-subtle").forEach(el => {
        el.classList.remove("highlight-hint", "highlight-hint-subtle");
    });
}

let montyDoors;
let montyMessage;
let montyControls;
let montyStartButton;
let montyStatsDisplay;
let montyGuideButton;
let montyGuidanceText;
let winningDoor;
let playerChoice;
let hostOpenedDoor;
let gameStep = "initial_choice";

// stats
let stats = {
    switchWins: 0,
    switchTotal: 0,
    stayWins: 0,
    stayTotal: 0,
};

function initializeMontyHall() {
    montyDoors = document.querySelectorAll("#monty-doors .door");
    montyMessage = document.getElementById("monty-message");
    montyControls = document.getElementById("monty-controls");
    montyStartButton = document.getElementById("monty-start");
    montyGuideButton = document.getElementById("monty-guide");
    montyGuidanceText = document.getElementById("monty-guidance-text");
    montyStatsDisplay = {
        switchWins: document.getElementById("switch-wins"),
        switchTotal: document.getElementById("switch-total"),
        switchPercent: document.getElementById("switch-percent"),
        stayWins: document.getElementById("stay-wins"),
        stayTotal: document.getElementById("stay-total"),
        stayPercent: document.getElementById("stay-percent"),
    };

    montyStartButton.addEventListener("click", startMontyGame);
    montyGuideButton.addEventListener("click", showMontyGuide);
    startMontyGame();
}

function startMontyGame() {
    playerChoice = null;
    hostOpenedDoor = null;
    gameStep = "initial_choice";
    removeHighlights();
    montyGuidanceText.textContent = "";
    montyGuideButton.style.display = "none";

    // random winning
    winningDoor = Math.floor(Math.random() * 3) + 1;

    // reset door appearance and event listeners
    montyDoors.forEach(door => {
        door.classList.remove("selected", "opened");
        let contentSpan = door.querySelector(".content");
        if (contentSpan) {
            contentSpan.remove();
        }
        door.innerHTML = `Door ${door.dataset.door}`;
        door.removeEventListener("click", handleDoorChoice);
        door.removeEventListener("click", handleStay);
        door.removeEventListener("click", handleSwitch);
        door.addEventListener("click", handleDoorChoice);
        door.style.cursor = "pointer";
        door.style.width = "";
    });

    // reset message
    montyMessage.textContent = "Choose a door";
    montyControls.innerHTML = "";
    montyControls.appendChild(montyStartButton);
    montyStartButton.style.display = "inline-block";
    montyStartButton.disabled = true;
    updateStatsDisplay();
}

function handleDoorChoice(event) {
    if (gameStep !== "initial_choice") return;
    removeHighlights();

    playerChoice = parseInt(event.target.dataset.door);
    gameStep = "switch_or_stay";

    // mark selected door
    event.target.classList.add("selected");
    // host opens a door
    openHostDoor();

    montyMessage.textContent = `You chose Door ${playerChoice}. The host opened Door ${hostOpenedDoor}. Do you want to switch to Door ${getRemainingDoor()} or stay?`;
    montyDoors.forEach(door => {
        door.removeEventListener("click", handleDoorChoice);
        door.style.cursor = "default";
    });

    montyControls.innerHTML = "";
    let switchButton = document.createElement("button");
    switchButton.id = "monty-switch";
    switchButton.textContent = `Switch to Door ${getRemainingDoor()}`;
    switchButton.addEventListener("click", handleSwitch);
    montyControls.appendChild(switchButton);

    let stayButton = document.createElement("button");
    stayButton.id = "monty-stay";
    stayButton.textContent = `Stay with Door ${playerChoice}`;
    stayButton.addEventListener("click", handleStay);
    montyControls.appendChild(stayButton);

    montyControls.appendChild(montyGuideButton);
    montyGuideButton.style.display = "inline-block";
    montyGuidanceText.textContent = "";
}

function openHostDoor() {
    let options = [1, 2, 3];
    let doorToOpen = null;

    for (let doorNum of options) {
        if (doorNum !== playerChoice && doorNum !== winningDoor) {
            doorToOpen = doorNum;
            break;
        }
    }

    if (doorToOpen === null) {
        let remainingDoors = options.filter(d => d !== playerChoice);
        doorToOpen = remainingDoors[Math.floor(Math.random() * remainingDoors.length)];
    }

    hostOpenedDoor = doorToOpen;
    let doorElement = document.getElementById(`door${hostOpenedDoor}`);
    if (doorElement) {
        doorElement.classList.add("opened");
        doorElement.innerHTML = `<span class="content">🐐</span>`;
        doorElement.style.cursor = "default";
    } else {
        //console.error(`Could not find door ${hostOpenedDoor}`);
    }
}

function getRemainingDoor() {
    let options = [1, 2, 3];
    return options.find(d => d !== playerChoice && d !== hostOpenedDoor);
}

function handleStay() {
    if (gameStep !== "switch_or_stay") return;
    removeHighlights();
    montyGuideButton.style.display = "none";
    montyGuidanceText.textContent = "";
    gameStep = "revealed";
    let isWinner = (playerChoice === winningDoor);
    stats.stayTotal++;
    if (isWinner) {
        stats.stayWins++;
    }

    revealAllDoors(isWinner, false);
}

function handleSwitch() {
    if (gameStep !== "switch_or_stay") return;
    removeHighlights();
    montyGuideButton.style.display = "none";
    montyGuidanceText.textContent = "";
    gameStep = "revealed";
    let switchedChoice = getRemainingDoor();
    playerChoice = switchedChoice;

    let isWinner = (playerChoice === winningDoor);
    stats.switchTotal++;
    if (isWinner) {
        stats.switchWins++;
    }

    revealAllDoors(isWinner, true);
}

function revealAllDoors(isWinner, didSwitch) {
    removeHighlights();
    montyGuideButton.style.display = "none";
    montyGuidanceText.textContent = "";
    montyDoors.forEach(door => {
        let doorNum = parseInt(door.dataset.door);
        door.classList.add("opened");
        door.style.cursor = "default";
        door.removeEventListener("click", handleDoorChoice);
        door.removeEventListener("click", handleStay);
        door.removeEventListener("click", handleSwitch);

        let existingContent = door.querySelector(".content");
        if (existingContent) existingContent.remove();
        door.innerHTML = "";


        let contentSpan = document.createElement("span");
        contentSpan.classList.add("content");
        if (doorNum === winningDoor) {
            contentSpan.textContent = "🚗";
        } else {
            contentSpan.textContent = "🐐";
        }
        door.appendChild(contentSpan);


        if (doorNum === playerChoice) {
             door.classList.add("selected");
        } else {
             door.classList.remove("selected");
        }
    });

    let resultText = isWinner ? "You Won!" : "You Lost.";
    montyMessage.textContent = `${resultText} Click "Start New Game".`;
    montyControls.innerHTML = "";
    montyControls.appendChild(montyStartButton);
    montyStartButton.style.display = "inline-block";
    montyStartButton.disabled = false;
    updateStatsDisplay();
}

function updateStatsDisplay() {
    montyStatsDisplay.switchWins.textContent = stats.switchWins;
    montyStatsDisplay.switchTotal.textContent = stats.switchTotal;
    montyStatsDisplay.switchPercent.textContent = stats.switchTotal > 0 ? ((stats.switchWins / stats.switchTotal) * 100).toFixed(1) : "0.0";

    montyStatsDisplay.stayWins.textContent = stats.stayWins;
    montyStatsDisplay.stayTotal.textContent = stats.stayTotal;
    montyStatsDisplay.stayPercent.textContent = stats.stayTotal > 0 ? ((stats.stayWins / stats.stayTotal) * 100).toFixed(1) : "0.0";
}

function showMontyGuide() {
    if (gameStep !== "switch_or_stay") return;
    removeHighlights();

    let doorToSwitchTo = getRemainingDoor();
    let switchButton = document.getElementById("monty-switch");
    let targetDoorElement = document.getElementById(`door${doorToSwitchTo}`);
    if (switchButton) {
        switchButton.classList.add("highlight-hint");
    }
    if (targetDoorElement) {
        targetDoorElement.classList.add("highlight-hint-subtle");
    }

    montyGuidanceText.textContent = "Hint: Switching doors increases your probability of winning from 1/3 to 2/3.";
    setTimeout(removeHighlights, 3000);
}

let hanoiPegs;
let hanoiDiskInput;
let hanoiResetButton;
let hanoiSolveButton;
let hanoiMovesDisplay;
let hanoiMinMovesDisplay;
let hanoiMessage;
let hanoiGuideButton;
let hanoiGuidanceText;
let hanoiNumDisks = 3;
let hanoiMoves = 0;
let hanoiDraggedDisk = null;
let hanoiIsSolving = false;
let hanoiSolveInterval = null;
function initializeHanoi() {
    hanoiPegs = {
        A: document.getElementById("peg-a"),
        B: document.getElementById("peg-b"),
        C: document.getElementById("peg-c")
    };
    hanoiDiskInput = document.getElementById("hanoi-disks");
    hanoiResetButton = document.getElementById("hanoi-reset");
    hanoiSolveButton = document.getElementById("hanoi-solve");
    hanoiGuideButton = document.getElementById("hanoi-guide");
    hanoiMovesDisplay = document.getElementById("hanoi-moves");
    hanoiMinMovesDisplay = document.getElementById("hanoi-min-moves");
    hanoiMessage = document.getElementById("hanoi-message");
    hanoiGuidanceText = document.getElementById("hanoi-guidance-text");
    hanoiDiskInput.addEventListener("change", () => {
        let num = parseInt(hanoiDiskInput.value);
        if (num >= 3 && num <= 7) {
            hanoiNumDisks = num;
            resetHanoiGame();
        } else {
            hanoiDiskInput.value = hanoiNumDisks;
        }
    });

    hanoiResetButton.addEventListener("click", resetHanoiGame);
    hanoiSolveButton.addEventListener("click", solveHanoiFromCurrentState);
    hanoiGuideButton.addEventListener("click", showHanoiGuide);

    setupHanoiDragDrop();
    resetHanoiGame();
}

function resetHanoiGame() {
    hanoiIsSolving = false;
    if (hanoiSolveInterval) {
        clearInterval(hanoiSolveInterval);
        hanoiSolveInterval = null;
    }
    hanoiMoves = 0;
    removeHighlights();
    updateHanoiMoves();
    hanoiMessage.textContent = "Drag disks to move them";
    hanoiMessage.classList.remove("success");
    hanoiGuidanceText.textContent = "";
    hanoiSolveButton.disabled = false;
    hanoiGuideButton.disabled = false;
    hanoiDiskInput.disabled = false;

    Object.values(hanoiPegs).forEach(peg => {
        while (peg.children.length > 1) {
            peg.removeChild(peg.lastElementChild);
        }
    });

    for (let i = hanoiNumDisks; i >= 1; i--) {
        let disk = createHanoiDisk(i);
        hanoiPegs.A.appendChild(disk);
    }
    addDiskDragListeners();
}

function createHanoiDisk(size) {
    let disk = document.createElement("div");
    disk.classList.add("disk");
    disk.dataset.size = size;
    disk.textContent = size;
    disk.draggable = true;
    return disk;
}

function updateHanoiMoves() {
    let minMoves = Math.pow(2, hanoiNumDisks) - 1;
    hanoiMovesDisplay.textContent = `Moves: ${hanoiMoves}`;
    hanoiMinMovesDisplay.textContent = `Min: ${minMoves}`;
}

function addDiskDragListeners() {
    let disks = document.querySelectorAll(`#hanoi-towers .disk`);
    disks.forEach(disk => {
        disk.addEventListener("dragstart", handleHanoiDragStart);
        disk.addEventListener("dragend", handleHanoiDragEnd);
    });
}

function setupHanoiDragDrop() {
    Object.values(hanoiPegs).forEach(peg => {
        peg.addEventListener("dragover", handleHanoiDragOver);
        peg.addEventListener("dragenter", handleHanoiDragEnter);
        peg.addEventListener("dragleave", handleHanoiDragLeave);
        peg.addEventListener("drop", handleHanoiDrop);
    });
}

function handleHanoiDragStart(e) {
    if (hanoiIsSolving) {
        e.preventDefault(); return;
    }
    removeHighlights();
    hanoiGuidanceText.textContent = "";
    let diskElement = e.currentTarget;
    let sourcePeg = diskElement.parentElement;
    if (diskElement !== sourcePeg.lastElementChild) {
        e.preventDefault();
        hanoiMessage.textContent = "You can only move the top disk!";
        hanoiMessage.classList.remove("success");
        return;
    }
    hanoiDraggedDisk = diskElement;
    setTimeout(() => diskElement.classList.add("dragging"), 0);
    hanoiMessage.textContent = `Moving disk ${hanoiDraggedDisk.dataset.size}...`;
    hanoiMessage.classList.remove("success");
}

function handleHanoiDragEnd(e) {
    if (hanoiIsSolving) return;
    e.currentTarget.classList.remove("dragging");
    hanoiDraggedDisk = null;
}

function handleHanoiDragOver(e) {
    if (hanoiIsSolving) return;
    e.preventDefault();
}

function handleHanoiDragEnter(e) {
    if (hanoiIsSolving) return;
    let targetPeg = e.target.closest(".peg");
    if (targetPeg && isValidHanoiMove(hanoiDraggedDisk, targetPeg)) {
        targetPeg.classList.add("over");
    }
}

function handleHanoiDragLeave(e) {
    if (hanoiIsSolving) return;
    let targetPeg = e.target.closest(".peg");
    if (targetPeg) {
        targetPeg.classList.remove("over");
    }
}

function handleHanoiDrop(e) {
    if (hanoiIsSolving || !hanoiDraggedDisk) return;
    e.preventDefault();
    removeHighlights();
    hanoiGuidanceText.textContent = "";
    let targetPeg = e.target.closest(".peg");
    targetPeg.classList.remove("over");
    if (isValidHanoiMove(hanoiDraggedDisk, targetPeg)) {
        let sourcePeg = hanoiDraggedDisk.parentElement;
        targetPeg.appendChild(hanoiDraggedDisk);
        hanoiMoves++;
        updateHanoiMoves();
        hanoiMessage.textContent = `Moved disk ${hanoiDraggedDisk.dataset.size} from Peg ${sourcePeg.dataset.peg} to Peg ${targetPeg.dataset.peg}.`;
        hanoiMessage.classList.remove("success");
        checkHanoiWin();
    } else {
        hanoiMessage.textContent = "Invalid move.";
        hanoiMessage.classList.remove("success");
    }
    hanoiDraggedDisk = null;
}

function isValidHanoiMove(diskToMove, targetPeg) {
    if (!diskToMove || !diskToMove.dataset || !diskToMove.dataset.size || !targetPeg) {
        //console.error("isValidHanoiMove: Invalid input", { diskToMove, targetPeg });
        return false;
    }

    let movingDiskSize = parseInt(diskToMove.dataset.size);
    let topDiskOnTarget = Array.from(targetPeg.children).filter(el => el.classList.contains("disk")).pop();
    if (!topDiskOnTarget) {
        return true;
    }

    let topDiskSize = parseInt(topDiskOnTarget.dataset.size);
    return movingDiskSize < topDiskSize;
}

function checkHanoiWin() {
    let targetPeg = hanoiPegs["C"];
    let diskCount = Array.from(targetPeg.children).filter(el => el.classList.contains("disk")).length;
    if (diskCount === hanoiNumDisks) {
        hanoiMessage.textContent = `Congratulations! You solved the puzzle in ${hanoiMoves} moves!`;
        hanoiMessage.classList.add("success");
        hanoiSolveButton.disabled = true;
        hanoiGuideButton.disabled = true;
        hanoiIsSolving = true;
        removeHighlights();
        hanoiGuidanceText.textContent = "";
        return true;
    }
    return false;
}

// Find the current peg of the disk
function getDiskLocation(diskSize) {
    let diskSelector = `.disk[data-size="${diskSize}"]`;
    for (let pegId in hanoiPegs) {
        let peg = hanoiPegs[pegId];
        if (peg.querySelector(diskSelector)) {
            return peg;
        }
    }
    //console.error(`Disk ${diskSize} not found`);
    return null;
}

// Find actual disk element
function getDiskElement(diskSize) {
     let diskSelector = `.disk[data-size="${diskSize}"]`;
     for (let pegId in hanoiPegs) {
         let disk = hanoiPegs[pegId].querySelector(diskSelector);
         if (disk) {
             return disk;
         }
     }
     return null;
}

// Tower of Hanoi 

// Recursively generates the list of moves needed
function generateMovesRecursive(diskNum, targetPeg, sourcePeg, sparePeg, movesList) {
    if (diskNum <= 0) return;

    let diskElement = getDiskElement(diskNum);
    if (!diskElement) {
        console.error(`generateMovesRecursive: Disk ${diskNum} not found!`);
        return;
    }
    let currentPeg = diskElement.parentElement;

    if (currentPeg === targetPeg) {
        // disk 'diskNum' is already at the target peg
        generateMovesRecursive(diskNum - 1, targetPeg, sparePeg, sourcePeg, movesList);
    } else if (currentPeg === sourcePeg) {
        // disk 'diskNum' is at the source peg
        // move stack 'diskNum - 1' from sourcePeg to sparePeg
        generateMovesRecursive(diskNum - 1, sparePeg, sourcePeg, targetPeg, movesList);
        // move disk 'diskNum' from sourcePeg to targetPeg
        movesList.push({ diskSize: diskNum, diskElement: diskElement, fromPegElement: sourcePeg, toPegElement: targetPeg });
        // move stack 'diskNum - 1' from sparePeg to targetPeg
        generateMovesRecursive(diskNum - 1, targetPeg, sparePeg, sourcePeg, movesList);
    } else {
        // disk 'diskNum' is on the spare peg
        // move stack 'diskNum - 1' from sparePeg to sourcePeg
        generateMovesRecursive(diskNum - 1, sourcePeg, sparePeg, targetPeg, movesList);
        // move disk 'diskNum' from sparePeg to targetPeg
        movesList.push({ diskSize: diskNum, diskElement: diskElement, fromPegElement: sparePeg, toPegElement: targetPeg });
        // move stack 'diskNum - 1' from sourcePeg to targetPeg
        generateMovesRecursive(diskNum - 1, targetPeg, sourcePeg, sparePeg, movesList);
    }
}

// Calculates the sequence of moves
function getRemainingMoves() {
    let moves = [];
    let targetPeg = hanoiPegs["C"]; // target peg

    let k = 0;
    let currentPegOfK = null;
    for (let i = hanoiNumDisks; i >= 1; i--) {
        let diskElem = getDiskElement(i);
        if (diskElem && diskElem.parentElement && diskElem.parentElement.classList.contains('peg')) {
             if (diskElem.parentElement !== targetPeg) {
                k = i;
                currentPegOfK = diskElem.parentElement;
                break;
            }
        } else if (diskElem) {
             console.error(`Disk ${i} has invalid parent:`, diskElem.parentElement);
             k = i;
             currentPegOfK = null; 
             break;
        } else {
             console.warn(`Disk ${i} not found.`);
        }
    }


    if (k === 0) return [];
    if (currentPegOfK === null) {
         console.error("Cannot determine current peg of largest misplaced disk", k);
         return [];
    }


    // third peg
    let pegIds = Object.keys(hanoiPegs);
    let currentPegId = currentPegOfK.dataset.peg;
    let targetPegId = targetPeg.dataset.peg;
    let sparePegId = pegIds.find(id => id !== currentPegId && id !== targetPegId);
    if (!sparePegId) {
        console.error("Could not determine spare peg.");
        return [];
    }
    let sparePegForK = hanoiPegs[sparePegId];

    generateMovesRecursive(k, targetPeg, currentPegOfK, sparePegForK, moves);
    return moves;
}

// Tower of Hanoi

function showHanoiGuide() {
    if (hanoiIsSolving || checkHanoiWin()) return;
    removeHighlights();

    let remainingMoves = getRemainingMoves();
    if (remainingMoves.length === 0) {
        hanoiGuidanceText.textContent = "Puzzle Solved!";
        checkHanoiWin();
        return;
    }

    let nextMove = remainingMoves[0];
    let { diskSize, diskElement, fromPegElement, toPegElement } = nextMove;
    //let recursiveReason = "";

    if (diskElement && toPegElement) {
        diskElement.classList.add("highlight-hint");
        toPegElement.classList.add("highlight-hint-subtle");
        //let actualTopDisk = fromPegElement.lastElementChild;
        //let topDiskIsTarget = actualTopDisk === diskElement;
        let fromPegName = fromPegElement.dataset.peg;
        let toPegName = toPegElement.dataset.peg;

        let guidance = `Next Move: Disk ${diskSize} from ${fromPegName} to ${toPegName}.`;

        /* FIX LATER
        if (recursiveReason) {
            guidance += `\n${recursiveReason}`;
        }

        if (!topDiskIsTarget && actualTopDisk && actualTopDisk.classList.contains("disk")) {
             guidance += `\n(Hint: This requires moving disk ${actualTopDisk.dataset.size} first)`;
        }
        */
        hanoiGuidanceText.innerText = guidance;
    }

    setTimeout(removeHighlights, 4000);
}

function solveHanoiFromCurrentState() {
    if (hanoiIsSolving || checkHanoiWin()) return;
    hanoiIsSolving = true;
    hanoiSolveButton.disabled = true;
    hanoiGuideButton.disabled = true;
    hanoiDiskInput.disabled = true;
    hanoiMessage.textContent = "Solving...";
    hanoiMessage.classList.remove("success");
    hanoiGuidanceText.textContent = "";
    removeHighlights();

    function executeNextAutoMove() {
        if (!hanoiIsSolving) {
             if(hanoiSolveInterval) clearInterval(hanoiSolveInterval);
             hanoiSolveInterval = null;
             return;
        }
        removeHighlights();

        let remainingMoves = getRemainingMoves();
        if (remainingMoves.length === 0 || checkHanoiWin()) {
            clearInterval(hanoiSolveInterval);
            hanoiSolveInterval = null;
            hanoiIsSolving = false;
            let isWon = checkHanoiWin();
            hanoiSolveButton.disabled = isWon;
            hanoiGuideButton.disabled = isWon;
            hanoiDiskInput.disabled = false;
             if (!isWon) {
                 hanoiMessage.textContent = "Solver finished or cannot proceed";
                 console.log("Solver stopped. No remaining moves or already won");
             }
            return;
        }

        // Get the very next required move from the generated sequence
        let nextMove = remainingMoves[0];
        if (!nextMove || !nextMove.diskElement || !nextMove.fromPegElement || !nextMove.toPegElement) {
            console.error("ERROR: Invalid next move generated", nextMove);
            clearInterval(hanoiSolveInterval);
            hanoiSolveInterval = null;
            hanoiIsSolving = false;
            hanoiSolveButton.disabled = false;
            hanoiGuideButton.disabled = false;
            hanoiDiskInput.disabled = false;
            hanoiMessage.textContent = "ERROR: Could not determine next move";
            return;
        }

        let { diskSize: moveDiskSize, diskElement: diskToMove, fromPegElement: sourcePeg, toPegElement: targetPeg } = nextMove;

        /* Debugging
        // check if valid
        if (!diskToMove || !sourcePeg || !targetPeg || !sourcePeg.contains(diskToMove)) {
            console.error("ERROR: Invalid move components", nextMove);
            clearInterval(hanoiSolveInterval);
            hanoiSolveInterval = null;
            hanoiIsSolving = false;
            hanoiSolveButton.disabled = false;
            hanoiGuideButton.disabled = false;
            hanoiDiskInput.disabled = false;
            hanoiMessage.textContent = "ERROR: Invalid move data";
            return;
        }
        if (sourcePeg.lastElementChild !== diskToMove) {
            console.error(`ERROR: Disk ${moveDiskSize} is not the top disk on ${sourcePeg.dataset.peg}. Top is:`, sourcePeg.lastElementChild);
            clearInterval(hanoiSolveInterval);
            hanoiSolveInterval = null;
            hanoiIsSolving = false;
            hanoiSolveButton.disabled = false;
            hanoiGuideButton.disabled = false;
            hanoiDiskInput.disabled = false;
            hanoiMessage.textContent = "ERROR";
            return;
        }
         if (!isValidHanoiMove(diskToMove, targetPeg)) {
            console.error(`ERROR: Move ${moveDiskSize} from ${sourcePeg.dataset.peg} to ${targetPeg.dataset.peg} is invalid`);
            clearInterval(hanoiSolveInterval);
            hanoiSolveInterval = null;
            hanoiIsSolving = false;
            hanoiSolveButton.disabled = false;
            hanoiGuideButton.disabled = false;
            hanoiDiskInput.disabled = false;
            hanoiMessage.textContent = "ERROR: Invalid move planned";
            return;
        }
        */
        targetPeg.appendChild(diskToMove);
        hanoiMoves++;
        updateHanoiMoves();
        hanoiMessage.textContent = "Solving...";
        // next move
        hanoiSolveInterval = setTimeout(executeNextAutoMove, 500);
    }

    executeNextAutoMove();
}

// Caesar's Cipher
let cipherInput, cipherShiftInput;
let cipherModeEncrypt, cipherModeDecrypt;
let cipherEncryptButton;
let cipherDecryptButton;
let cipherOutput;

function initializeCaesarCipher() {
    cipherInput = document.getElementById("cipher-input");
    cipherShiftInput = document.getElementById("cipher-shift");
    cipherOutput = document.getElementById("cipher-output-text");
    cipherModeEncrypt = document.getElementById("cipher-mode-encrypt");
    cipherModeDecrypt = document.getElementById("cipher-mode-decrypt");
    cipherInput.addEventListener("input", updateCaesarOutput);
    cipherShiftInput.addEventListener("input", updateCaesarOutput);
    cipherModeEncrypt.addEventListener("change", updateCaesarOutput);
    cipherModeDecrypt.addEventListener("change", updateCaesarOutput);

    updateCaesarOutput();
}

function updateCaesarOutput() {
    let text = cipherInput.value;
    let shift = parseInt(cipherShiftInput.value);

    let encryptMode = cipherModeEncrypt.checked;
    let LoRShift = encryptMode ? shift : -shift;

    cipherOutput.value = applyCaesarShift(text, LoRShift);
}

function applyCaesarShift(str, amount) {
    if (amount < 0) { // wrap around
        return applyCaesarShift(str, amount + 26);
    }

    let output = "";

    for (let i = 0; i < str.length; i++) {
        let char = str[i];

        if (char.match(/[a-z]/i)) { // check if letter
            let code = str.charCodeAt(i);

            if (code >= 65 && code <= 90) { // uppercase
                char = String.fromCharCode(((code - 65 + amount) % 26) + 65);
            }
            else if (code >= 97 && code <= 122) { // lower
                char = String.fromCharCode(((code - 97 + amount) % 26) + 97);
            }
        }
        output += char;
    }
    return output;
}
