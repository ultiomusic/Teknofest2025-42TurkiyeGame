let levelConfig = {};

let START = {};
let X_BOUNDS = {x: 999, y: -999};
let Y_BOUNDS = {x: 999, y: -999};

let SEQ;

let state = {
	pos: { ...START },
	step: 0,
	playing: true,
};

let BLOCKS;
let PATH_BLOCKS = [];
let path_index = 0;

let nextLevelTimeout;

let touchStartX;
let tocuhStartY;

let PLAYER;
const boardEl = document.getElementById("board");
const barEl = document.getElementById("bar");
const countEl = document.getElementById("count");
const winEl = document.getElementById("win");
const nextTimerEl = document.getElementById("nextTimer");
const levelText = document.getElementById("level-name");
const themeToggle = document.getElementById("themeToggle");

async function loadLevelConfig() {
	const data = await fetch('./levels.json');
	if (!data.ok) throw new Error('Can\'t load the levels.json file.');
	levelConfig = await data.json();
}

function parseSequence(level) {
	SEQ = [];
	const mainSequence = level.sequence;
	for (let i = 0; i < mainSequence.length; i++) {
		const element = mainSequence[i];
		if (typeof (element) === "string") {
			SEQ.push(element);
		} else if (element.loop) {
			for (let j = 0; j < element.loop.sequence.length * element.loop.iteration; j++) {
				const loopElement = element.loop.sequence[j % element.loop.sequence.length];
				SEQ.push(loopElement);
			}
		}
	}
}

function parseAlgorithmText(level) {
	const algoEl = document.getElementById("algorithm");

	if (!algoEl) {
		console.error("Can't find the algorithm paragraph.");
		return;
	}

	let tab_indent = 0;
	for (let index = 0; index < level.algorithm.length; index++) {
		let element = level.algorithm[index].toString();
		element = element.replace("sarı", "<span class=\"algo-block yellow\"></span>");
		element = element.replace("yeşil", "<span class=\"algo-block green\"></span>");
		element = element.replace("mavi", "<span class=\"algo-block blue\"></span>");
		const p = document.createElement("p");

		if (element[0] === '}') {
			tab_indent -= 1;
		}
		if (tab_indent > 0) {
			p.innerHTML += "&emsp;".repeat(tab_indent);
		}
		p.innerHTML += element;
		algoEl.appendChild(p);
		if (index + 1 != level.algorithm.length) {
			algoEl.appendChild(document.createElement("br"));
		}
		if (element[element.length - 1] === '{') {
			tab_indent += 1;
		}
	}
}

function levelCount() {
	return (Object.keys(levelConfig.levels).length);
}

function placeAbsoluteDiv(div, pos) {
	const tx = `calc(${pos.x} * (var(--cell) + var(--gap)) + 5px)`;
	const ty = `calc(${pos.y} * (var(--cell) + var(--gap)) + 5px)`;
	div.style.transform = `translate(${tx}, ${ty})`;
}

function buildGrid(level) {
	let x = 0;
	let y = 0;

	BLOCKS = level.grid;
	const gridSize = level.gridSize;
	boardEl.style.width = `calc(var(--cell) * ${gridSize.x} + var(--gap) * ${gridSize.x + 1})`;
	boardEl.style.height = `calc(var(--cell) * ${gridSize.y} + var(--gap) * ${gridSize.y + 1})`;
	boardEl.style.gridTemplateColumns = `repeat(${gridSize.x}, var(--cell))`;
	boardEl.style.gridTemplateRows = `repeat(${gridSize.y}, var(--cell))`;

	while (y < gridSize.y) {
		while (x < gridSize.x) {
			const cellDiv = document.createElement("div");
			cellDiv.className = "cell";
			let cellClass;
			for (let i = 0; i < BLOCKS.length; i++) {
				const cell = BLOCKS[i];
				if (cell.x === x && cell.y === y) {
					if (x < X_BOUNDS.x) {
						X_BOUNDS.x = x;
					} else if (x > X_BOUNDS.y) {
						X_BOUNDS.y = x;
					}
					if (y < Y_BOUNDS.x) {
						Y_BOUNDS.x = y;
					} else if (y > Y_BOUNDS.y) {
						Y_BOUNDS.y = y;
					}
					if (cell.type === "path") {
						const pathDiv = document.createElement("div");
						pathDiv.className = "cell";
						pathDiv.classList.add("path");
						boardEl.appendChild(pathDiv);
						PATH_BLOCKS.push({ pathDiv, cell });
						placeAbsoluteDiv(pathDiv, { x, y });
						path_index++;
					} else {
						cellClass = cell.type;
					}
					break;
				}
			}
			if (!cellClass) {
				cellClass = "empty";
			}
			cellDiv.classList.add(cellClass);
			boardEl.appendChild(cellDiv);
			x++;
		}
		x = 0;
		y++;
	}
	path_index = PATH_BLOCKS.length - 1;
	PLAYER = document.createElement("div");
	PLAYER.id = "player";
	PLAYER.className = "player";
	boardEl.appendChild(PLAYER);
}

async function loadLevel(levelIndex) {
	await loadLevelConfig();
	const level = levelConfig.levels[levelIndex];
	START = level.startPosition;
	state.pos = { ...START };
	buildGrid(level);
	parseSequence(level);
	parseAlgorithmText(level);
	const levelString = `Level ${levelIndex} • ${level.name}`;
	if (levelText) {
		levelText.innerHTML = `<span class=\"dot\"></span>${levelString}`;
	}
	document.title = levelString;
}

function updateProgress() {
	if (!barEl || !countEl) return;
	const total = SEQ.length - 1;
	const done = Math.min(state.step, total);
	const pct = (done / total) * 100;
	barEl.style.width = pct + "%";
	countEl.textContent = `${done}/${total}`;
}

function reset(hard = false) {
	state.pos = { ...START };
	state.step = 0;
	state.playing = true;
	path_index = PATH_BLOCKS.length - 1;
	placeAbsoluteDiv(PLAYER, state.pos);
	for (let i = 0; i < PATH_BLOCKS.length; i++) {
		const block = PATH_BLOCKS[i];
		placeAbsoluteDiv(block.pathDiv, { x: block.cell.x, y: block.cell.y});
	}
	updateProgress();
	if (hard) {
		boardEl.classList.remove("shake");
		requestAnimationFrame(() => {
			requestAnimationFrame(() => boardEl.classList.add("shake"));
		});
		setTimeout(() => boardEl.classList.remove("shake"), 400);
	}
	winEl.classList.remove("show");
	nextTimerEl.classList.remove("show");
	nextTimerEl.querySelector("i").style.width = "100%";
	clearTimeout(nextLevelTimeout);
	boardEl.focus({ preventScroll: true });
}

function getLevel() {
	const url_string = window.location.href;
	const url = new URL(url_string);
	level = url.searchParams.get("level");
	return (level ? Number(level) : 1);
}

function setLevel(level) {
	const url_string = window.location.href;
	const url = new URL(url_string);
	url.searchParams.set("level", level);
	return (url);
}

function next() {
	const levelIndex = getLevel();
	const newUrl = setLevel(levelIndex == levelCount() ? 1 : levelIndex + 1);
	window.location.href = newUrl;
}

function enableWinWindow() {
	winEl.classList.add("show");
	nextTimerEl.classList.add("show");
	const bar = nextTimerEl.querySelector("i");
	bar.style.width = "100%";
	setTimeout(() => {
		bar.style.width = "0%";
	}, 50);
	nextLevelTimeout = setTimeout(() => {
		next();
	}, 1050);
	PLAYER.removeEventListener("transitionend", enableWinWindow);
}

function win() {
	state.playing = false;
	updateProgress();
	PLAYER.addEventListener("transitionend", enableWinWindow, { once: true });
}

function handleBounds(nx, ny) {
	let beforeNx;
	let beforeNy;

	beforeNx = nx;
	beforeNy = ny;
	if (nx < X_BOUNDS.x) {
		nx = X_BOUNDS.y;
		beforeNx = nx + 1;
	} else if (nx > X_BOUNDS.y) {
		nx = X_BOUNDS.x;
		beforeNx = nx - 1;
	}
	if (ny < Y_BOUNDS.x) {
		ny = Y_BOUNDS.y;
		beforeNy = ny + 1;
	} else if (ny > Y_BOUNDS.y) {
		ny = Y_BOUNDS.x;
		beforeNy = ny - 1;
	}

	const transition = PLAYER.style.transition;
	PLAYER.style.transition = "none";
	placeAbsoluteDiv(PLAYER, { x: beforeNx, y: beforeNy });

	// foce reflow
	PLAYER.offsetHeight;
	PLAYER.style.transition = transition;
	state.pos.x = nx;
	state.pos.y = ny;
	placeAbsoluteDiv(PLAYER, state.pos);
}

function handleMove(dx, dy) {
	if (!state.playing) return;
	let nx = (state.pos.x + dx);
	let ny = (state.pos.y + dy);

	let currentMove;
	if (dx != 0)
		currentMove = dx < 0 ? "left" : "right";
	else if (dy != 0)
		currentMove = dy < 0 ? "up" : "down";

	const expect = SEQ[state.step];
	if (expect && expect === currentMove) {
		state.pos.x = nx;
		state.pos.y = ny;
		if (nx < X_BOUNDS.x || nx > X_BOUNDS.y || ny < Y_BOUNDS.x || ny > Y_BOUNDS.y) {
			PLAYER.addEventListener("transitionend", () => handleBounds(nx, ny), { once: true });
		}
		placeAbsoluteDiv(PLAYER, state.pos);
		if (BLOCKS != null && BLOCKS[state.step] != null && BLOCKS[state.step].type === "blue") {
			const path_block = PATH_BLOCKS[path_index];
			if (path_block) {
				placeAbsoluteDiv(path_block.pathDiv, { x: path_block.cell.x + dx, y: path_block.cell.y + dy });
				path_index--;
			}
		}
		state.step++;
		updateProgress();
		const nextMove = SEQ[state.step];
		if (nextMove && nextMove === "end") {
			win();
		}
	} else {
		reset(true);
	}
}

function onKey(e) {
	const key = e.key;
	if (
		["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Space"].includes(
			key
		)
	) {
		e.preventDefault();
	}
	switch (key) {
		case "ArrowUp":
			handleMove(0, -1);
			break;
		case "ArrowDown":
			handleMove(0, 1);
			break;
		case "ArrowLeft":
			handleMove(-1, 0);
			break;
		case "ArrowRight":
			handleMove(1, 0);
			break;
		case "r":
		case "R":
			reset();
			break;
	}
}

function onTouchStart(e) {
	const touch = e.changedTouches[0];
	touchStartX = touch.clientX;
	touchStartY = touch.clientY;
}

function onTouchEnd(e) {
	const touch = e.changedTouches[0];
	const dx = touch.clientX - touchStartX;
	const dy = touch.clientY - touchStartY;
	const absDx = Math.abs(dx);
	const absDy = Math.abs(dy);
	if (Math.max(absDx, absDy) < 30) return;
	if (absDx > absDy) {
			handleMove(dx > 0 ? 1 : -1, 0);
	} else {
			handleMove(0, dy > 0 ? 1 : -1);
	}
}

function toggleTheme() {
	const isLight = document.body.classList.toggle("light");
	themeToggle.textContent = isLight ? "🌙" : "🌞";
	localStorage.setItem("theme", isLight ? "light" : "dark");
}

function applySavedTheme() {
	const saved = localStorage.getItem("theme");
	if (saved === "light") {
		document.body.classList.add("light");
		themeToggle.textContent = "🌙";
	} else {	
		themeToggle.textContent = "🌞";
	}
}

function initListeners() {
	document.addEventListener("keydown", onKey);
	const resetBtn = document.getElementById("resetBtn");
	if (resetBtn) resetBtn.addEventListener("click", () => reset());
	const focusBtn = document.getElementById("focusBtn");
	if (focusBtn) focusBtn.addEventListener("click", () => boardEl.focus());
	themeToggle.addEventListener("click", toggleTheme);
	boardEl.addEventListener("touchstart", onTouchStart);
	boardEl.addEventListener("touchadd", onTouchEnd);
}

async function initGame() {
	const level = getLevel();
	await loadLevel(level);
	placeAbsoluteDiv(PLAYER, state.pos);
	updateProgress();
	boardEl.setAttribute("tabindex", "0");
	boardEl.addEventListener("click", () => boardEl.focus());
	boardEl.focus({ preventScroll: true });
}

applySavedTheme();
initListeners();
initGame();
