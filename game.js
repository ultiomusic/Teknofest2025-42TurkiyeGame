const GRID = 7;
const PLAYER_OFFSET = { x: 5, y: 5 };

let levelConfig = {};

let START = {};

let SEQ;

let state = {
	pos: { ...START },
	step: 0, // Sıradaki index
	playing: true,
};

const PLAYER = document.getElementById("player");
const boardEl = document.getElementById("board");
const barEl = document.getElementById("bar");
const countEl = document.getElementById("count");
const winEl = document.getElementById("win");
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

	let insert_tab;
	for (let index = 0; index < level.algorithm.length; index++) {
		const element = level.algorithm[index];

		if (element[element.length - 1] === '{') {
			insert_tab = 1;
		} else if (element[0] === '}') {
			insert_tab = 0;
		}
		const p = document.createElement("p");
		const text = document.createTextNode(element);
		if (insert_tab && element[element.length - 1] !== '{')
			p.innerHTML += "&emsp;";
		p.appendChild(text);
		algoEl.appendChild(p);
		if (index + 1 != level.algorithm.length)
			algoEl.appendChild(document.createElement("br"));
	}
}

function levelCount() {
	return (Object.keys(levelConfig.levels).length);
}

function buildGrid(level) {
	let x = 0;
	let y = 0;

	while (y < GRID) {
		while (x < GRID) {
			const cell = level.grid.some(cell => cell.x === x && cell.y === y && cell.type === "normal");
			const cellDiv = document.createElement("div");
			if (cell) {
				cellDiv.className = "cell";
			} else {
				cellDiv.className = "cell empty";
			}
			boardEl.appendChild(cellDiv);
			x++;
		}
		x = 0;
		y++;
	}
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
	levelText.innerHTML = `<span class=\"dot\"></span>${levelString}`;
	document.title = levelString;
	if (levelIndex == levelCount())
		document.getElementById("nextBtn").innerHTML = "İlk Level'a Dön";
}

function placePlayer() {
	const tx = `calc(${state.pos.x} * (var(--cell) + var(--gap)) + 5px)`;
	const ty = `calc(${state.pos.y} * (var(--cell) + var(--gap)) + 5px)`;
	PLAYER.style.transform = `translate(${tx}, ${ty})`;
}

function updateProgress() {
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
	placePlayer();
	updateProgress();
	if (hard) {
		boardEl.classList.remove("shake");
		requestAnimationFrame(() => {
			requestAnimationFrame(() => boardEl.classList.add("shake"));
		});
		setTimeout(() => boardEl.classList.remove("shake"), 400);
	}
	winEl.classList.remove("show");
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
	PLAYER.removeEventListener("transitionend", enableWinWindow);
}

function win() {
	state.playing = false;
	updateProgress();
	PLAYER.addEventListener("transitionend", enableWinWindow);
}

function handleMove(dx, dy) {
	if (!state.playing) return;
	let nx = (state.pos.x + dx) % GRID;
	let ny = (state.pos.y + dy) % GRID;

	if (nx < 0)
		nx = GRID - 1;
	if (ny < 0)
		ny = GRID - 1;
	let currentMove;
	if (dx != 0)
		currentMove = dx < 0 ? "left" : "right";
	else if (dy != 0)
		currentMove = dy < 0 ? "up" : "down";

	// Sıradaki beklenen hücre
	const expect = SEQ[state.step];
	if (expect && expect === currentMove) {
		state.pos.x = nx;
		state.pos.y = ny;
		state.step++;
		placePlayer();
		updateProgress();
		next = SEQ[state.step];
		if (next && next === "end") {
			// Son etiket F'e ulaşıldı
			win();
		}
	} else {
		// Yanlış kare -> Reset
		reset(true);
	}
}

// Klavye
function onKey(e) {
	const key = e.key;
	if (
		["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Space"].includes(
			key
		)
	) {
		e.preventDefault(); // Sayfa kaymasını engelle
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
	document.getElementById("resetBtn").addEventListener("click", () => reset());
	document.getElementById("focusBtn").addEventListener("click", () => boardEl.focus());
	document.getElementById("nextBtn").addEventListener("click", next);
	document.getElementById("replayBtn").addEventListener("click", () => reset());
	themeToggle.addEventListener("click", toggleTheme);
}

async function initGame() {
	const level = getLevel();
	await loadLevel(level);
	placePlayer();
	updateProgress();
	boardEl.setAttribute("tabindex", "0");
	boardEl.addEventListener("click", () => boardEl.focus());
	boardEl.focus({ preventScroll: true });
}

applySavedTheme();
initListeners();
initGame();
