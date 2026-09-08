(function () {
  "use strict";

  function initQuiz(block) {
    var questions = Array.prototype.slice.call(block.querySelectorAll(".quiz-question"));
    var scorePanel = block.querySelector(".quiz-score");
    var progressLabel = block.querySelector(".quiz-progress span");
    var progressFill = block.querySelector(".quiz-progress .progress-fill");
    var restartBtn = scorePanel ? scorePanel.querySelector(".score-actions .btn-ghost") : null;
    var total = questions.length;
    var score = 0;

    if (!total) return;

    function showQuestion(index) {
      questions.forEach(function (q, i) { q.hidden = i !== index; });
      if (scorePanel) scorePanel.hidden = true;
      if (progressLabel) progressLabel.textContent = "Question " + (index + 1) + "/" + total;
      if (progressFill) progressFill.style.width = Math.round((index / total) * 100) + "%";
    }

    function showScore() {
      questions.forEach(function (q) { q.hidden = true; });
      if (progressLabel) progressLabel.textContent = "Terminé";
      if (progressFill) progressFill.style.width = "100%";
      if (!scorePanel) return;
      scorePanel.hidden = false;
      var scoreNum = scorePanel.querySelector(".score-num");
      if (scoreNum) scoreNum.textContent = score + "/" + total;
      var feedback = scorePanel.querySelector("p");
      if (feedback) {
        if (score === total) {
          feedback.textContent = "Parfait, tu maîtrises ce chapitre ! Direction le chapitre suivant.";
        } else if (score >= Math.ceil(total / 2)) {
          feedback.textContent = "Pas mal ! Relis les points manqués si besoin, puis continue.";
        } else {
          feedback.textContent = "N'hésite pas à relire le chapitre avant de continuer.";
        }
      }
    }

    function resetQuiz() {
      score = 0;
      questions.forEach(function (q) {
        delete q.dataset.answered;
        var options = Array.prototype.slice.call(q.querySelectorAll(".quiz-option"));
        options.forEach(function (opt) {
          opt.classList.remove("correct", "incorrect");
          opt.removeAttribute("aria-disabled");
        });
        var explain = q.querySelector(".quiz-explain");
        if (explain) explain.classList.remove("visible");
        var nextBtn = q.querySelector(".quiz-next-btn");
        if (nextBtn) nextBtn.remove();
      });
      showQuestion(0);
    }

    questions.forEach(function (question, qIndex) {
      var options = Array.prototype.slice.call(question.querySelectorAll(".quiz-option"));
      var explain = question.querySelector(".quiz-explain");

      function select(option) {
        if (question.dataset.answered) return;
        question.dataset.answered = "true";

        var isCorrect = option.getAttribute("data-correct") === "true";
        option.classList.add(isCorrect ? "correct" : "incorrect");
        if (isCorrect) {
          score++;
        } else {
          var correctOption = options.filter(function (o) {
            return o.getAttribute("data-correct") === "true";
          })[0];
          if (correctOption) correctOption.classList.add("correct");
        }

        options.forEach(function (opt) { opt.setAttribute("aria-disabled", "true"); });
        if (explain) explain.classList.add("visible");

        var nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.className = "btn btn-primary quiz-next-btn";
        nextBtn.textContent = qIndex < total - 1 ? "Question suivante →" : "Voir mon score →";
        nextBtn.addEventListener("click", function () {
          if (qIndex < total - 1) {
            showQuestion(qIndex + 1);
          } else {
            showScore();
          }
        });
        question.appendChild(nextBtn);
      }

      options.forEach(function (option) {
        option.setAttribute("role", "button");
        option.setAttribute("tabindex", "0");
        option.addEventListener("click", function () { select(option); });
        option.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            select(option);
          }
        });
      });
    });

    if (restartBtn) {
      restartBtn.type = "button";
      restartBtn.addEventListener("click", resetQuiz);
    }

    showQuestion(0);
  }

  document.querySelectorAll(".quiz-block").forEach(initQuiz);
})();
