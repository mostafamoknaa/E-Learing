function submitQuiz() {
    let score = 0;
    let answers = {
        q1: "Paris",
        q2: "4",
        q3: "Jupiter",
        q4: "Harper Lee",
        q5: "H2O"
    };

    for (let question in answers) {
        let selected = document.querySelector(`input[name="${question}"]:checked`);
        if (selected && selected.value === answers[question]) {
            score++;
        }
    }

    document.getElementById("result").innerText = `Your Score: ${score}/5`;
}