const GRID = 7;
const PLAYER_OFFSET = { x: 5, y: 5 };

let levelConfig = { };

let START = { };

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

async function loadLevelConfig() {
	const data = await fetch('./levels.json');
	if (!data.ok) throw new Error('Can\'t load the levels.json file.');
	levelConfig = await data.json();
}

function parseSequence(levelConfig)
{
	SEQ = [ ];
	const mainSequence = levelConfig.levels.one.sequence;
	for (let i = 0; i < mainSequence.length; i++) {
		const element = mainSequence[i];
		if (typeof(element) === "string") {
			SEQ.push(element);
			//console.log("Element: " + element);
		} else if (element.loop) {
			for (let j = 0; j < element.loop.sequence.length * element.loop.iteration; j++) {
				const loopElement = element.loop.sequence[j % element.loop.sequence.length];
				SEQ.push(loopElement);
				//console.log("Loop Element: " + loopElement);
			}
		}
	}
	//console.log("SEQUENCE: " + SEQ);
}

async function loadLevel()
{
	await loadLevelConfig();
	START = levelConfig.levels.one.startPosition;
	state.pos = { ...START };
	parseSequence(levelConfig);
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

function win() {
	state.playing = false;
	updateProgress();
	winEl.classList.add("show");
	//console.log("You won!");
}

function inBounds(x, y) {
	const xBounds = x >= 0 && x < GRID;
	const yBounds = y >= 0 && y < GRID;

	return xBounds && yBounds;
}

function handleMove(dx, dy) {
	if (!state.playing) return;
	const nx = state.pos.x + dx;
	const ny = state.pos.y + dy;
	//if (!inBounds(nx, ny)) return; // Sınır dışına çıkma: Hamleyi yok say

	let currentMove;
	if (dx != 0)
		currentMove = dx < 0 ? "left" : "right";
	else if (dy != 0)
		currentMove = dy < 0 ? "up" : "down";

	// Sıradaki beklenen hücre
	const expect = SEQ[state.step];
	// console.log(SEQ[state.step]);
	// console.log(currentMove);
	// if (expect && expect.x === nx && expect.y === ny) {
	if (expect && expect === currentMove) {
		state.pos.x = nx;
		state.pos.y = ny;
		state.step++;
		placePlayer();
		updateProgress();
		next = SEQ[state.step];
		//console.log("Next: " + next);
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
		//console.log("Key: " + key);
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

function initListeners() {
	document.addEventListener("keydown", onKey);
	document.getElementById("resetBtn").addEventListener("click", () => reset());
	document.getElementById("focusBtn").addEventListener("click", () => boardEl.focus());
	document.getElementById("nextBtn").addEventListener("click", () => reset());
}

async function initGame() {
	await loadLevel();
	placePlayer();
	updateProgress();
	boardEl.setAttribute("tabindex", "0");
	boardEl.addEventListener("click", () => boardEl.focus());
	boardEl.focus({ preventScroll: true });
}

initListeners();
initGame();
