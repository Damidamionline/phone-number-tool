const fileInput = document.getElementById('fileInput');
const controlsDiv = document.getElementById('controls');
const countryCodeInput = document.getElementById('countryCodeInput');
const processNumbersBtn = document.getElementById('processNumbers');
const phoneDisplay = document.getElementById('phone-display');
const numberingSpan = document.getElementById('numbering');
const phoneNumberSpan = document.getElementById('phoneNumber');
const copyPhoneNumberBtn = document.getElementById('copyPhoneNumber');
const randomizeBtn = document.getElementById('randomizeBtn');
const addToListBtn = document.getElementById('addToListBtn');
const downloadListBtn = document.getElementById('downloadListBtn');
const initialView = document.getElementById('initial-view');
const fileNameSpan = document.getElementById('fileName');
// Add these with your other const definitions
const notificationMessage = document.getElementById('notification-message');
const restartMessage = document.getElementById('restart-message');

let rawPhoneNumbers = [];
let processedPhoneNumbers = [];
let shuffledIndices = [];
let currentIndex = 0;
let numbersAddedToList = [];

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            rawPhoneNumbers = text.split('\n').filter(num => num.trim() !== '');
            if (rawPhoneNumbers.length > 0) {
                controlsDiv.style.display = 'block';
                phoneDisplay.style.display = 'none';
                resetState();
            }
        };
        reader.readAsText(file);
    }
});

function resetState() {
    processedPhoneNumbers = [];
    shuffledIndices = [];
    currentIndex = 0;
    numbersAddedToList = [];
    downloadListBtn.style.display = 'none';
    randomizeBtn.disabled = false;
    restartMessage.style.display = 'none';
}

processNumbersBtn.addEventListener('click', () => {
    const countryCodeToRemove = countryCodeInput.value.trim();
    processedPhoneNumbers = rawPhoneNumbers.map(num => {
        const trimmedNum = num.trim();
        if (countryCodeToRemove && trimmedNum.startsWith(countryCodeToRemove)) {
            return trimmedNum.substring(countryCodeToRemove.length);
        }
        return trimmedNum;
    });

    if (processedPhoneNumbers.length > 0) {
        shuffledIndices = Array.from(Array(processedPhoneNumbers.length).keys());
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
        }
        initialView.style.display = 'none'; // <-- HIDE a
        controlsDiv.style.display = 'none';   // <-- HIDE b
        phoneDisplay.style.display = 'block'; // <-- SHOW c

        currentIndex = 0;
        displayPhoneNumber();
        phoneDisplay.style.display = 'block';
        controlsDiv.style.display = 'none';
    }
});

function displayPhoneNumber() {
    if (currentIndex < shuffledIndices.length) {
        const numberIndex = shuffledIndices[currentIndex];
        phoneNumberSpan.textContent = processedPhoneNumbers[numberIndex];
        numberingSpan.textContent = `${currentIndex + 1} of ${processedPhoneNumbers.length}`;
    } else {
        phoneNumberSpan.textContent = "All numbers shown!";
        numberingSpan.textContent = `Done!`;
        randomizeBtn.disabled = true;
        restartMessage.style.display = 'block';
    }
}

copyPhoneNumberBtn.addEventListener('click', () => {
    const numberToCopy = phoneNumberSpan.textContent;
    if (numberToCopy !== "All numbers shown!") {
        navigator.clipboard.writeText(numberToCopy)
            .then(() => {
                // Change button style and text
                copyPhoneNumberBtn.textContent = 'Copied!';
                copyPhoneNumberBtn.classList.add('copied');

                // Revert back after 1.5 seconds
                setTimeout(() => {
                    copyPhoneNumberBtn.textContent = 'Copy';
                    copyPhoneNumberBtn.classList.remove('copied');
                }, 1500);
            })
            .catch(err => console.error('Failed to copy: ', err));
    }
});

randomizeBtn.addEventListener('click', () => {
    currentIndex++;
    displayPhoneNumber();
});

addToListBtn.addEventListener('click', () => {
    const currentNumber = phoneNumberSpan.textContent;
    let message = '';

    if (currentNumber !== "All numbers shown!") {
        if (!numbersAddedToList.includes(currentNumber)) {
            numbersAddedToList.push(currentNumber);
            message = `Added! List now has ${numbersAddedToList.length} number(s).`;
            if (downloadListBtn.style.display === 'none') {
                downloadListBtn.style.display = 'inline-block';
            }
        } else {
            message = `${currentNumber} is already in the list.`;
        }

        // Show the notification message and fade it out
        notificationMessage.textContent = message;
        notificationMessage.style.opacity = 1;
        setTimeout(() => {
            notificationMessage.style.opacity = 0;
        }, 2000); // Message disappears after 2 seconds
    }
});

downloadListBtn.addEventListener('click', () => {
    const textToSave = numbersAddedToList.join('\n');
    const blob = new Blob([textToSave], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected_numbers.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});