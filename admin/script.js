// നിങ്ങളുടെ Firebase കോൺഫിഗറേഷൻ ഇവിടെ ചേർക്കുക
const firebaseConfig = {
    apiKey: "AIzaSyAzb3jbndemY5w3nkwk-sdIxLmYV0Qj9WQ",
    authDomain: "sahithyotsav-results-288f2.firebaseapp.com",
    projectId: "sahithyotsav-results-288f2",
    storageBucket: "sahithyotsav-results-288f2.firebasestorage.app",
    messagingSenderId: "601783689113",
    appId: "1:601783689113:web:fca41edf54a85d45c43d08",
    // ഈ ലൈൻ ചേർക്കുക
    databaseURL: "https://sahithyotsav-results-288f2-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Firebase ആപ്പ് ഇനിഷ്യലൈസ് ചെയ്യുക
firebase.initializeApp(firebaseConfig);

// Firebase Realtime Database, Storage എന്നിവയുടെ റെഫറൻസുകൾ
const database = firebase.database();
const storage = firebase.storage();

// HTML എലമെന്റുകൾ
const categorySelect = document.getElementById('category');
const programSelect = document.getElementById('program');
const imageUploadInput = document.getElementById('imageUpload');
const resultUploadForm = document.getElementById('resultUploadForm');
const messageElement = document.getElementById('message');

// സ്റ്റാറ്റിക് വിഭാഗങ്ങളും പ്രോഗ്രാമുകളും (നിങ്ങളുടെ ആവശ്യമനുസരിച്ച് മാറ്റുക)
const availableData = {
    "General": ["Collage", "Nasheeda", "Viplavagana Rachana", "Mappilappatt Rachana", "Spot Magazine", "Group Song (Category-a)", "Group Song (Category-b)", "Moulid Recitation", "Qaseeda Recitation", "Viplava Ganam", "Chumarezhuth", "Malappattu", "Risala Quiz", "Qawwali", "Project"],
    "High School": ["Elocution English", "Elocution Malayalam", "Mappilappattu", "Madhu Ganam", "Poem Recitation (Arabic)", "Poem Recitation (Malayalam)", "Quiz", "Story Writing", "Poem Making", "Pencil Drawing", "Water Colouring", "Poem Recitation (Urdu)", "Book Test", "Essay Writing (Malayalam)", "News Reading", "Caption Writing", "Language Game (English)", "Pencil Drawing(girls)", "Water Colour(girls)", "Story Writing(girls)", "Poem Making(girls)"],
    "Higher Sec": ["Elocution", "Mappilappattu", "Bakthi Ganam", "Story Writing", "Poem Making", "Essay Writing (Malayalam)", "Essay Writing (English)", "Quiz", "Pencil Drawing", "Water Colouring", "Book Test", "News Writing", "Calligraphy (Arabic)", "Poem Recitation (Urdu)", "Calligraphy Arabic(girls)", "Story Writing(girls)", "Poem Making(girls)", "Reel Making", "Digital Painting"],
    "Junior": ["Mappilappattu", "Elocution (Malayalam)", "Elocution (Arabic)", "Elocution (English)", "Poem Making", "Story Writing", "Book Test", "Essay Writing (Malayalam)", "Essay Writing (Arabic)", "Mudravakya Rachana", "Madhu Gana Rachana", "Quiz", "Translation (Arabic)", "Calligraphy (Arabic)", "Social Text", "Hadees Musabaqa", "Ai Poem Making"],
    "Lower Primary": ["Elocution", "Madhu Song", "Quiz", "Story Telling", "Pencil Drawing", "Water Colouring", "Bhasha Keli", "Reading (Malayalam)", "Reading (Arabi Malayalam)", "Book Test", "Water Colouring(girls)", "Malayalam Writing(girls)", "Journal Art (Girls)"],
    "Senior": ["Mappilappattu", "Elocution (Malayalam)", "Elocution (English)", "Poem Making", "Story Writing", "Book Test", "Essay Writing (Malayalam)", "Essay Writing (English)", "Madhu Gana Rachana", "Quiz", "Feature Writing", "Social Text", "Poem Making (English)", "Translation (English)", "Poster Designing", "Digital Illustration", "E Poster", "Elocution (Urdu)", "Hamd (Urdu)", "Poem Recitation (English)", "Musha'ara Alfiyya", "Essay Writing (Urdu)", "Mudravakya Rachana", "Digital Painting"],
    "Upper Primary": ["Elocution", "Mappilappattu", "Story Telling", "Ganitha Keli", "Quiz", "Pencil Drawing", "Water Colouring", "Story Writing", "Book Test", "Spelling Bee", "Pencil Drawing(girls)", "Water Colouring(girls)", "Story Writing(girls)", "Sudoku", "Origami(girls)"]

};

// Firebase-ൽ ഇതിനകം സേവ് ചെയ്ത പ്രോഗ്രാമുകൾ ട്രാക്ക് ചെയ്യാൻ ഒരു Set
let uploadedPrograms = new Set();

// Firebase-ൽ നിന്ന് നിലവിലുള്ള ഡാറ്റ ലോഡ് ചെയ്യുക
async function loadExistingData() {
    try {
        const snapshot = await database.ref('results').once('value');
        const results = snapshot.val();
        if (results) {
            Object.values(results).forEach(result => {
                const programKey = `${result.category}-${result.program}`;
                uploadedPrograms.add(programKey);
            });
        }
        populateCategories(); // ഡാറ്റ ലോഡ് ചെയ്ത ശേഷം ഡ്രോപ്പ്ഡൗണുകൾ പോപ്പുലേറ്റ് ചെയ്യുക
    } catch (error) {
        console.error("Error loading existing data:", error);
        showMessage("മുമ്പുള്ള ഡാറ്റ ലോഡ് ചെയ്യുന്നതിൽ പിശക് സംഭവിച്ചു.", "error");
    }
}

// Category ഡ്രോപ്പ്ഡൗൺ പോപ്പുലേറ്റ് ചെയ്യുക
function populateCategories() {
    categorySelect.innerHTML = '<option value="" disabled selected>Please select a category</option>';
    for (const category in availableData) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    }
    programSelect.disabled = true; // കാറ്റഗറി തിരഞ്ഞെടുക്കുന്നത് വരെ പ്രോഗ്രാം ഡിസേബിൾ ചെയ്യുക
    programSelect.innerHTML = '<option value="" disabled selected>Please select a program</option>'; // പ്രോഗ്രാം റീസെറ്റ് ചെയ്യുക
}

// Category തിരഞ്ഞെടുക്കുമ്പോൾ Program ഡ്രോപ്പ്ഡൗൺ പോപ്പുലേറ്റ് ചെയ്യുക
categorySelect.addEventListener('change', () => {
    const selectedCategory = categorySelect.value;
    programSelect.innerHTML = '<option value="" disabled selected>Please select a program</option>';
    programSelect.disabled = false; // പ്രോഗ്രാം എനേബിൾ ചെയ്യുക

    if (selectedCategory && availableData[selectedCategory]) {
        availableData[selectedCategory].forEach(program => {
            const programKey = `${selectedCategory}-${program}`;
            if (!uploadedPrograms.has(programKey)) { // അപ്‌ലോഡ് ചെയ്യാത്ത പ്രോഗ്രാമുകൾ മാത്രം കാണിക്കുക
                const option = document.createElement('option');
                option.value = program;
                option.textContent = program;
                programSelect.appendChild(option);
            }
        });
    }
});

// ഫോം സബ്മിറ്റ് ചെയ്യുമ്പോൾ
resultUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // പേജ് റീലോഡ് ചെയ്യുന്നത് തടയുക

    const category = categorySelect.value;
    const program = programSelect.value;
    const imageFile = imageUploadInput.files[0];

    // ആവശ്യമായ വിവരങ്ങൾ നൽകിയിട്ടുണ്ടോ എന്ന് പരിശോധിക്കുക
    if (!category || !program || !imageFile) {
        showMessage("എല്ലാ ഫീൽഡുകളും പൂരിപ്പിക്കുക.", "error");
        return;
    }

    try {
        // ഇമേജ് ഫയലിന്റെ എക്സ്റ്റൻഷൻ എടുക്കുക
        const fileExtension = imageFile.name.split('.').pop();
        // പുതിയ ഫയൽ നെയിം ഉണ്ടാക്കുക: category_program.extension
        const newImageName = `${category.replace(/\s+/g, '_')}_${program.replace(/\s+/g, '_')}.${fileExtension}`;


        // 1. ഇമേജ് Firebase Storage-ലേക്ക് അപ്‌ലോഡ് ചെയ്യുക
        // ഇവിടെ storageRef-ന്റെ പാത്ത് പുതിയ ഫയൽ നെയിം ഉപയോഗിച്ച് മാറ്റുന്നു
        const storageRef = storage.ref(`images/${newImageName}`);
        const uploadTask = storageRef.put(imageFile);

        // അപ്‌ലോഡിംഗ് പുരോഗതി നിരീക്ഷിക്കുക (ആവശ്യമെങ്കിൽ)
        uploadTask.on('state_changed',
            (snapshot) => {
                // പ്രോഗ്രസ് ബാർ കാണിക്കാൻ ഇത് ഉപയോഗിക്കാം
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                showMessage(`Image Uploading: ${progress.toFixed(2)}%`, "info");
            },
            (error) => {
                console.error("Image upload error:", error);
                showMessage("ഇമേജ് അപ്‌ലോഡ് ചെയ്യുന്നതിൽ പിശക് സംഭവിച്ചു.", "error");
                throw error; // പിശക് മുകളിലേക്ക് പ്രചരിപ്പിക്കുക
            },
            async () => {
                // അപ്‌ലോഡ് പൂർത്തിയായാൽ ഇമേജ് URL നേടുക
                const imageUrl = await storageRef.getDownloadURL();
                console.log("Image URL:", imageUrl);

                // 2. ഡാറ്റ Firebase Realtime Database-ലേക്ക് സേവ് ചെയ്യുക
                const newResultRef = database.ref('results').push(); // ഒരു പുതിയ യുണീക്ക് കീ ഉണ്ടാക്കുക
                await newResultRef.set({
                    category: category,
                    program: program,
                    imageUrl: imageUrl,
                    timestamp: firebase.database.ServerValue.TIMESTAMP // അപ്‌ലോഡ് ചെയ്ത സമയം
                });

                showMessage("റിസൾട്ട് വിജയകരമായി അപ്‌ലോഡ് ചെയ്തു!", "success");
                resultUploadForm.reset(); // ഫോം റീസെറ്റ് ചെയ്യുക
                uploadedPrograms.add(`${category}-${program}`); // അപ്‌ലോഡ് ചെയ്ത പ്രോഗ്രാം ട്രാക്ക് ചെയ്യുക
                populateCategories(); // കാറ്റഗറികൾ പുതുക്കുക
            }
        );

    } catch (error) {
        console.error("Data upload error:", error);
        showMessage("ഡാറ്റ അപ്‌ലോഡ് ചെയ്യുന്നതിൽ പിശക് സംഭവിച്ചു.", "error");
    }
});

// സന്ദേശങ്ങൾ കാണിക്കാനുള്ള ഫംഗ്ഷൻ
function showMessage(msg, type) {
    messageElement.textContent = msg;
    messageElement.className = `message ${type}`;
    // കുറച്ച് സമയത്തിന് ശേഷം സന്ദേശം മായ്ക്കാൻ
    setTimeout(() => {
        messageElement.textContent = '';
        messageElement.className = 'message';
    }, 3000); // 5 സെക്കൻഡിന് ശേഷം മായും
}

// പേജ് ലോഡ് ചെയ്യുമ്പോൾ നിലവിലുള്ള ഡാറ്റ ലോഡ് ചെയ്യുക
window.onload = loadExistingData;