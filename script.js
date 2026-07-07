const defaultState = {
  tasks: [],
  energy: 0,
  level: 1,
  doneCount: 0,
  focusCount: 0,
  totalMinutes: 0,
  petEmoji: "🐣",
  petName: "青柠小兽"
};

let state = JSON.parse(localStorage.getItem("focusPetState")) || defaultState;
let timerSeconds = 25 * 60;
let selectedMinutes = 25;
let timer = null;
let isRunning = false;

const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskType = document.querySelector("#taskType");
const taskList = document.querySelector("#taskList");
const energyEl = document.querySelector("#energy");
const levelEl = document.querySelector("#level");
const doneCountEl = document.querySelector("#doneCount");
const focusCountEl = document.querySelector("#focusCount");
const totalMinutesEl = document.querySelector("#totalMinutes");
const progressBar = document.querySelector("#progressBar");
const petEmoji = document.querySelector("#petEmoji");
const petName = document.querySelector("#petName");
const petTip = document.querySelector("#petTip");
const timerDisplay = document.querySelector("#timerDisplay");
const startTimer = document.querySelector("#startTimer");
const pauseTimer = document.querySelector("#pauseTimer");
const resetTimer = document.querySelector("#resetTimer");
const adviceText = document.querySelector("#dailyAdvice");
const changeAdvice = document.querySelector("#changeAdvice");

const advices = [
  "先完成最简单的一件事，让自己进入状态。",
  "把手机放远一点，专注 25 分钟会比硬熬一小时更有效。",
  "今天别追求完美，先把任务推进一小步。",
  "复习时先看例题，再自己遮住答案重做一遍。",
  "任务太大就拆小，拆到现在马上能开始为止。",
  "晚自习前列 3 件事，做完就给自己一个小奖励。"
];

function saveState() {
  localStorage.setItem("focusPetState", JSON.stringify(state));
}

function updateLevel() {
  state.level = Math.floor(state.energy / 50) + 1;
}

function renderStats() {
  updateLevel();
  energyEl.textContent = state.energy;
  levelEl.textContent = state.level;
  doneCountEl.textContent = state.doneCount;
  focusCountEl.textContent = state.focusCount;
  totalMinutesEl.textContent = state.totalMinutes;
  petEmoji.textContent = state.petEmoji;
  petName.textContent = state.petName;
  progressBar.style.width = `${state.energy % 50 * 2}%`;

  if (state.level >= 5) {
    petTip.textContent = "你的学习宠物已经很强了，继续保持节奏。";
  } else if (state.energy >= 80) {
    petTip.textContent = "再坚持一下，很快就能解锁新状态。";
  } else {
    petTip.textContent = "完成任务或专注一次，都可以获得能量。";
  }

  saveState();
}

function renderTasks() {
  taskList.innerHTML = "";

  if (state.tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "task-item";
    empty.innerHTML = `<span class="task-title">今天还没有任务，先添加一个吧。</span>`;
    taskList.appendChild(empty);
    return;
  }

  state.tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item ${task.done ? "done" : ""}`;
    li.innerHTML = `
      <span>${task.icon}</span>
      <span class="task-title">${task.title}</span>
      <div class="task-actions">
        <button title="完成任务" onclick="completeTask(${task.id})">✅</button>
        <button title="删除任务" onclick="deleteTask(${task.id})">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

function addEnergy(amount) {
  state.energy += amount;
  renderStats();
}

function completeTask(id) {
  const task = state.tasks.find(item => item.id === id);
  if (!task || task.done) return;
  task.done = true;
  state.doneCount += 1;
  addEnergy(10);
  renderTasks();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(task => task.id !== id);
  saveState();
  renderTasks();
}

window.completeTask = completeTask;
window.deleteTask = deleteTask;

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  state.tasks.unshift({
    id: Date.now(),
    title,
    icon: taskType.value,
    done: false
  });

  taskInput.value = "";
  saveState();
  renderTasks();
});

function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timerSeconds);
}

function finishFocus() {
  clearInterval(timer);
  timer = null;
  isRunning = false;
  state.focusCount += 1;
  state.totalMinutes += selectedMinutes;
  addEnergy(15);
  timerSeconds = selectedMinutes * 60;
  updateTimerDisplay();
  alert("本次专注完成！小宠物获得 15 点能量。\n记得休息一下眼睛。");
}

startTimer.addEventListener("click", () => {
  if (isRunning) return;
  isRunning = true;
  timer = setInterval(() => {
    timerSeconds -= 1;
    updateTimerDisplay();
    if (timerSeconds <= 0) finishFocus();
  }, 1000);
});

pauseTimer.addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
  isRunning = false;
});

resetTimer.addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
  isRunning = false;
  timerSeconds = selectedMinutes * 60;
  updateTimerDisplay();
});

document.querySelectorAll(".timer-controls button").forEach(button => {
  button.addEventListener("click", () => {
    selectedMinutes = Number(button.dataset.min);
    timerSeconds = selectedMinutes * 60;
    clearInterval(timer);
    timer = null;
    isRunning = false;
    updateTimerDisplay();
  });
});

document.querySelectorAll(".shop-item").forEach(item => {
  item.addEventListener("click", () => {
    const cost = Number(item.dataset.cost);
    if (state.energy < cost) {
      alert("能量还不够，先去完成任务吧！");
      return;
    }
    state.energy -= cost;
    state.petEmoji = item.dataset.pet;
    state.petName = item.dataset.name;
    renderStats();
  });
});

changeAdvice.addEventListener("click", () => {
  const index = Math.floor(Math.random() * advices.length);
  adviceText.textContent = advices[index];
});

renderTasks();
renderStats();
updateTimerDisplay();
