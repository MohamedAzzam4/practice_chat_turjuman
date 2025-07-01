document.addEventListener("DOMContentLoaded", function () {
    // --- Page Views ---
    const selectionView = document.getElementById('selection-view');
    const chatView = document.getElementById('chat-view');

    // --- Selection Form Elements ---
    const selectionForm = document.getElementById('selection-form');
    const languageSelect = document.getElementById('language-select');
    const levelSelect = document.getElementById('level-select');

    // --- Chat Elements ---
    const chatForm = document.getElementById('chat-form');
    const userInputElement = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const chatInfo = document.getElementById('chat-info');

    // --- Sidebar Elements ---
    const sidebarNav = document.querySelector(".sidebar-nav");

    // --- Handle Language and Level Selection ---
    selectionForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent page reload

        const selectedLanguage = languageSelect.value;
        const selectedLevel = levelSelect.value;

        if (!selectedLanguage || !selectedLevel) {
            alert('Please select both language and level.');
            return;
        }

        // Update the chat header
        chatInfo.textContent = `Language: ${selectedLanguage} | Level: ${selectedLevel}`;

        // Switch the views
        selectionView.style.display = 'none';
        chatView.style.display = 'flex'; // Use flex as per the chat container's style
        userInputElement.focus();
    });

    
    // --- Chat History Loading (existing code) ---
    async function loadChatHistory() {
        try {
            const response = await fetch("/api/history");
            if (!response.ok) throw new Error('Failed to load history');
            const conversations = await response.json();
            sidebarNav.innerHTML = '';
            conversations.forEach(chat => {
                const chatLink = document.createElement('a');
                chatLink.href = `#chat-${chat.id}`;
                chatLink.className = 'nav-item';
                chatLink.textContent = chat.title;
                chatLink.dataset.chatId = chat.id;
                sidebarNav.appendChild(chatLink);
            });
        } catch (error) {
            console.error("Error loading chat history:", error);
            sidebarNav.innerHTML = '<a href="#" class="nav-item">Could not load history.</a>';
        }
    }
    loadChatHistory();


    // --- Chat Message Submission (existing code) ---
    chatForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const userInput = userInputElement.value.trim();
        if (!userInput) return;
        addMessage(userInput, "user-message");
        userInputElement.value = "";
        userInputElement.disabled = true;
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_input: userInput }),
            });
            if (response.ok) {
                const data = await response.json();
                addMessage(data.response, "ai-message");
                loadChatHistory();
            } else {
                addMessage("⚠️ Error: Could not get a response.", "ai-message");
            }
        } catch (error) {
            addMessage("⚠️ Error: Network issue.", "ai-message");
        } finally {
            userInputElement.disabled = false;
            userInputElement.focus();
        }
    });

    function addMessage(message, className) {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${className}`;
        if (className === 'ai-message') {
            messageElement.innerHTML = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        } else {
            messageElement.textContent = message;
        }
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
