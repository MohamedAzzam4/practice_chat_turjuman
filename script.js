document.addEventListener("DOMContentLoaded", function () {
    const languageForm = document.getElementById("language-selection-form");
    const chatForm = document.getElementById("chat-form");

    const languageView = document.getElementById("language-selection-view");
    const chatView = document.getElementById("chat-view");
    
    let selectedLanguage = '';
    let selectedLevel = '';

    // Handle language selection submission
    languageForm.addEventListener("submit", function (event) {
        event.preventDefault();
        
        selectedLanguage = document.getElementById("language-select").value;
        selectedLevel = document.getElementById("level-select").value;

        if (selectedLanguage && selectedLevel) {
            // Update chat header
            document.getElementById("chat-info").textContent = `Language: ${selectedLanguage} | Level: ${selectedLevel}`;
            
            // Switch views
            languageView.style.display = "none";
            chatView.style.display = "flex"; // Use flex as it's a flex container
            document.getElementById("user-input").focus();
        }
    });


    // Handle chat message submission
    chatForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const userInputElement = document.getElementById("user-input");
        const userInput = userInputElement.value.trim();

        if (!userInput) return;

        addMessage(userInput, "user-message");

        userInputElement.value = "";
        userInputElement.disabled = true;

        try {
            // NOTE: The API endpoint '/practice' needs to be implemented on the server.
            const response = await fetch("/practice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    user_input: userInput,
                    language: selectedLanguage, // Sending language info
                    level: selectedLevel      // Sending level info
                }),
            });

            if (response.ok) {
                const data = await response.json();
                addMessage(data.response, "ai-message");
            } else {
                addMessage("⚠️ Error: Could not get a response from the server.", "ai-message");
            }
        } catch (error) {
            addMessage("⚠️ Error: Network issue. Please check your connection.", "ai-message");
        } finally {
            userInputElement.disabled = false;
            userInputElement.focus();
        }
    });

    // Function to add messages to the UI
    function addMessage(message, className) {
        const chatBox = document.getElementById("chat-box");
        const messageElement = document.createElement("div");
        messageElement.className = `message ${className}`;

        if (className === 'ai-message') {
            messageElement.innerHTML = formatAIResponse(message);
        } else {
            messageElement.textContent = message;
        }

        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Function to format AI response text
    function formatAIResponse(text) {
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\n/g, '<br>');
        return formattedText;
    }
});