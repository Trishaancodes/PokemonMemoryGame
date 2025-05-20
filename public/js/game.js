
document.addEventListener("DOMContentLoaded", () => {

  const themeSelect = document.getElementById("theme");

themeSelect.addEventListener("change", () => {
  const theme = themeSelect.value;
  document.body.setAttribute("data-theme", theme);
});

  const board = document.getElementById("game-board");
   let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let clicks = 0;
  let matchedPairs = 0;
  let timerInterval;
  let timeLimit;
  let gameOver = false;

  const timerDisplay = document.getElementById("timer");

  let totalPairs = 0;
  const clicksDisplay = document.getElementById("clicks");
  const matchedDisplay = document.getElementById("matched");
  const totalPairsDisplay = document.getElementById("totalPairs");

  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");
  const powerUpBtn = document.getElementById("powerUpBtn");
  let powerUsed = false;

  powerUpBtn.addEventListener("click", () =>{
    if (powerUsed || gameOver) return;
    powerUsed = true;
    powerUpBtn.disabled = true;

    const cards  =document.querySelectorAll(".card-inner");
    cards.forEach(card => {
      if(!card.classList.contains("matched")){
        card.classList.add("flipped");
      }
    });

    setTimeout (() => {
      cards.forEach(card => {
        if(!card.classList.contains("matched")){
          card.classList.remove("flipped");
        }
      });
    }, 3000);
  });
 

  startBtn.addEventListener("click", startGame);
  resetBtn.addEventListener("click", startGame);

  function startGame() {
    board.innerHTML = ""; 
    clicks = 0;
    powerUsed = false;
    powerUpBtn.disabled = false;
    matchedPairs = 0;
    lockBoard = false;
    gameOver = false;

    firstCard = null;
    secondCard = null;

    clicksDisplay.textContent = clicks;
    matchedDisplay.textContent = matchedPairs;
    totalPairsDisplay.textContent = totalPairs;
    const difficulty = document.getElementById("difficulty").value;

    if (difficulty === "easy") {
    totalPairs = 3;
    timeLimit = 60;
    } else if (difficulty === "medium") {
    totalPairs = 6;
    timeLimit = 45;
    } else if (difficulty === "hard") {
    totalPairs = 8;
    timeLimit = 30;
    }
    totalPairsDisplay.textContent = totalPairs;
    clearInterval(timerInterval);
    startTimer(timeLimit);

  

fetch('https://pokeapi.co/api/v2/pokemon?limit=1500')
  .then(res => res.json())
  .then(data => {
    const all = data.results;
    const selected = getRandomItems(all, totalPairs);

    const fetches = selected.map(pokemon => {
      return fetch(pokemon.url)
        .then(res => res.json())
        .then(pokeData => ({
          name: pokemon.name,
          imageUrl: pokeData.sprites.other["official-artwork"].front_default
        }));
    });

    Promise.all(fetches).then(pokemonData => {
      const pairList = [...pokemonData, ...pokemonData]; // duplicate for pairs
      shuffle(pairList); // Now shuffle entire deck with images + names

      pairList.forEach(({ name, imageUrl }) => {
        const card = createCard(name, imageUrl);
        board.appendChild(card);
      });
    });
  });
}


  // const pokemonIds = [1,2,3];
  // const cardPairs = [...pokemonIds, ...pokemonIds];
  // shuffle(cardPairs);

  // cardPairs.forEach((id) => {
  //   const card = createCard(id);
  //   board.appendChild(card);
  // });

  function createCard(name, imageUrl) {
  const cardContainer = document.createElement("div");
 cardContainer.className = "card-pokemon col-6 col-sm-4 col-md-3 col-lg-2";


  const inner = document.createElement("div");
  inner.className = "card-inner";
  inner.dataset.id = name;

  const front = document.createElement("div");
  front.className = "card-front";
  front.style.backgroundImage = `url('${imageUrl}')`;

  const back = document.createElement("div");
  back.className = "card-back";

  inner.appendChild(front);
  inner.appendChild(back);
  cardContainer.appendChild(inner);

  inner.addEventListener("click", () => handleCardClick(inner));
  return cardContainer;
}


  function handleCardClick(card){
if (lockBoard || gameOver || card.classList.contains("matched") || card === firstCard) return;


    card.classList.add("flipped");

    if(!firstCard){
      firstCard = card;
      return;
    }

    secondCard = card;
    clicks++;
    document.getElementById("clicks").textContent = clicks;
    lockBoard = true;

    if(firstCard.dataset.id === secondCard.dataset.id){
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      matchedPairs++;
      document.getElementById("matched").textContent = matchedPairs;

      resetTurn();

      if(matchedPairs === totalPairs){
        setTimeout(() => alert("You win!"), 300);
      }
    } else {
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetTurn();
      }, 1000);
    }
  }
  function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
  }

  function startTimer(seconds) {
  let timeLeft = seconds;
  timerDisplay.textContent = timeLeft;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      lockBoard = true;
      gameOver = true;
      alert("⏱️ Time's up! You lost.");
    }
  }, 1000);
}


  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i+1));
      [array[i], array[j]] = [array[j],array[i]];
    }
    }


  function getRandomItems(arr, n) {
    const shuffled = [...arr];
    shuffle(shuffled);
    return shuffled.slice(0,n);
  }

  document.body.setAttribute("data-theme", themeSelect.value);


});
