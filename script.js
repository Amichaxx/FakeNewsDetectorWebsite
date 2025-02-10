document.addEventListener("DOMContentLoaded", function () {
    function showResults() {
        let resultsContainer = document.getElementById("results-container");
        if (resultsContainer) {
            resultsContainer.style.display = "block"; // Show results panel
        }
    }

    // Attach the function to the button
    let verifyButton = document.querySelector(".button");
    if (verifyButton) {
        verifyButton.addEventListener("click", showResults);
    }
});
