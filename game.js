const state = {
	pos: { ...START },
	step: 0, // Sıradaki index
	playing: true,
};


function placePlayer() {
	const tx = `calc(${state.pos.x} * (var(--cell) + var(--gap)))`;
	const ty = `calc(${state.pos.y} * (var(--cell) + var(--gap)))`;
	player.style.transform = `translate(${tx}, ${ty})`;
}


function updateProgress() {
	const total = SEQ.length;
	const done = Math.min(state.step, total);
	const pct = (done / total) * 100;
	barEl.style.width = pct + '%';
	countEl.textContent = `${done}/${total}`;
}


function reset(hard = false) {
	state.pos = { ...START };
	state.step = 0;
	state.playing = true;
	placePlayer();
	updateProgress();
	if (hard) {
		boardEl.classList.remove('shake');
		requestAnimationFrame(() => {
			requestAnimationFrame(() => boardEl.classList.add('shake'));
		});
		setTimeout(() => boardEl.classList.remove('shake'), 400);
	}
	winEl.classList.remove('show');
	boardEl.focus({ preventScroll: true });
}


function win() {
	state.playing = false;
	updateProgress();
	winEl.classList.add('show');
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
	if (!inBounds(nx, ny)) return; // Sınır dışına çıkma: Hamleyi yok say


	// Sıradaki beklenen hücre
	const expect = SEQ[state.step];
	if (expect && expect.x === nx && expect.y === ny) {
		state.pos.x = nx; state.pos.y = ny; state.step++;
		placePlayer(); updateProgress();
		if (state.step >= SEQ.length) {
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
	if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Space"].includes(key)) {
		e.preventDefault(); // Sayfa kaymasını engelle
	}
	switch (key) {
		case 'ArrowUp': handleMove(0, -1); break;
		case 'ArrowDown': handleMove(0, 1); break;
		case 'ArrowLeft': handleMove(-1, 0); break;
		case 'ArrowRight': handleMove(1, 0); break;
		case 'r': case 'R': reset(); break;
	}
}


document.addEventListener('keydown', onKey);
document.getElementById('resetBtn').addEventListener('click', () => reset());
document.getElementById('focusBtn').addEventListener('click', () => boardEl.focus());
document.getElementById('nextBtn').addEventListener('click', () => reset());


// İlk kurulum
placePlayer();
updateProgress();
boardEl.setAttribute('tabindex', '0');
boardEl.addEventListener('click', () => boardEl.focus());
boardEl.focus({ preventScroll: true });