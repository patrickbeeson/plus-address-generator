document.addEventListener('DOMContentLoaded', () => {
    const baseEmailInput = document.getElementById('baseEmail');
    const tagInput = document.getElementById('tag');
    const generateButton = document.getElementById('generateButton');
    const resultDisplay = document.getElementById('result');

    // --- Load saved base email on popup open ---
    chrome.storage.local.get(['savedBaseEmail'], (result) => {
        if (result.savedBaseEmail) {
            baseEmailInput.value = result.savedBaseEmail;
        }
    });

    // --- Generate button click listener ---
    generateButton.addEventListener('click', () => {
        const baseEmail = baseEmailInput.value.trim();
        const tag = tagInput.value.trim();

        // Reset previous results/errors
        resultDisplay.textContent = '';
        resultDisplay.className = ''; // Clear previous success/error classes

        // --- Input Validation ---
        if (!baseEmail) {
            resultDisplay.textContent = 'Please enter a base email.';
            resultDisplay.className = 'error';
            return;
        }
        if (!baseEmail.includes('@') || baseEmail.split('@').length !== 2 || !baseEmail.split('@')[0] || !baseEmail.split('@')[1]) {
             resultDisplay.textContent = 'Invalid base email format.';
             resultDisplay.className = 'error';
             return;
        }
         if (!tag) {
            resultDisplay.textContent = 'Please enter a tag.';
            resultDisplay.className = 'error';
            return;
        }
        // This allows letters, numbers, dots, and dashes, but blocks @, +, and spaces
        if (/[@\s+]/.test(tag)) {
             resultDisplay.textContent = 'Tag cannot contain spaces, @, or +.';
             resultDisplay.className = 'error';
             return;
        }


        // --- Save the valid base email for next time ---
        chrome.storage.local.set({ savedBaseEmail: baseEmail });

        // --- Generate the email ---
        const parts = baseEmail.split('@');
        const localPart = parts[0];
        const domainPart = parts[1];
        const generatedEmail = `${localPart}+${tag}@${domainPart}`;

        // --- Copy to Clipboard ---
        navigator.clipboard.writeText(generatedEmail).then(() => {
            // Success! Display the email and confirmation.
            resultDisplay.textContent = `Copied: ${generatedEmail}`;
            resultDisplay.className = 'success'; // Style as success

            // Optional: Give feedback on button
            generateButton.textContent = 'Copied!';
            setTimeout(() => {
                generateButton.textContent = 'Generate & Copy';
            }, 1500); // Reset button text after 1.5 seconds

        }).catch(err => {
            // Error copying
            console.error('Failed to copy: ', err);
            resultDisplay.textContent = `Generated: ${generatedEmail} (Copy failed)`;
            resultDisplay.className = 'error'; // Style as error
        });
    });
});