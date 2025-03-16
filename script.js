document.addEventListener("DOMContentLoaded", function () {
    async function verifyText() {
        const text = document.querySelector(".textbox").value;
        const response = await fetch("http://localhost:5000/verify", { // Updated URL
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });
        const result = await response.json();
        displayResults(result);
    }

    function displayResults(result) {
        let resultsContainer = document.getElementById("results-container");
        let resultsElement = document.getElementById("results");
        if (resultsContainer && resultsElement) {
            resultsContainer.style.display = "block"; // Show results panel
            resultsElement.innerHTML = ""; // Clear previous results

            // Determine overall result
            const overallResult = result.results.some(item => item.review.toLowerCase() === "false") ? "False" : "True";

            // Create and append overall result heading
            const overallResultHeading = document.createElement("h2");
            overallResultHeading.textContent = overallResult;
            overallResultHeading.style.color = overallResult.toLowerCase() === "true" ? "green" : "red";
            resultsElement.appendChild(overallResultHeading);

            result.results.forEach(item => {
                const claimElement = document.createElement("div");
                claimElement.classList.add("claim");

                const claimText = document.createElement("p");
                claimText.textContent = `Claim: ${item.claim}`;
                claimElement.appendChild(claimText);

                const reviewText = document.createElement("p");
                reviewText.textContent = `Review: ${item.review}`;
                reviewText.style.color = item.review.toLowerCase() === "true" ? "green" : "red";
                claimElement.appendChild(reviewText);

                if (item.url) {
                    const link = document.createElement("a");
                    link.href = item.url;
                    link.textContent = "Source";
                    link.target = "_blank";
                    claimElement.appendChild(link);
                }

                resultsElement.appendChild(claimElement);
            });
        }
    }

    // Attaches the function to the button
    let verifyButton = document.getElementById("verifyButton");
    if (verifyButton) {
        verifyButton.addEventListener("click", verifyText);
    }
});
