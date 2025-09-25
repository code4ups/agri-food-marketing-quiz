// Μεταβλητές Εφαρμογής
let selectedQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let selectedSection = 1;
let quizSettings = {
    questionCount: 30,
    feedbackMode: 'educational'
};

// Αρχικοποίηση
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    showMainMenu();
});

function setupEventListeners() {
    // Επιλογή ενότητας από το κύριο μενού
    document.querySelectorAll('.section-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.section-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedSection = parseInt(this.dataset.section);
            setTimeout(() => showSetupSection(), 300);
        });
    });

    // Επιλογή αριθμού ερωτήσεων
    document.querySelectorAll('.count-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.count-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            quizSettings.questionCount = parseInt(this.dataset.count);
        });
    });

    // Επιλογή τρόπου λειτουργίας
    document.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.feedback-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            quizSettings.feedbackMode = this.dataset.mode;
        });
    });
}

function showMainMenu() {
    document.getElementById('mainMenuSection').style.display = 'block';
    document.getElementById('setupSection').style.display = 'none';
    document.getElementById('quizSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
}

function showSetupSection() {
    const sectionData = sectionInfo[selectedSection];

    // Ενημέρωση τίτλου ενότητας
    document.getElementById('sectionTitle').textContent = sectionData.title;

    // Ενημέρωση του μέγιστου αριθμού ερωτήσεων για την πλήρη αξιολόγηση
    const fullAssessmentOption = document.querySelector('.count-option[data-count="30"]');
    if (fullAssessmentOption) {
        fullAssessmentOption.textContent = `Πλήρης Αξιολόγηση (${sectionData.maxQuestions})`;
        fullAssessmentOption.dataset.count = sectionData.maxQuestions;
        quizSettings.questionCount = sectionData.maxQuestions;
    }

    // Εμφάνιση setup section
    document.getElementById('mainMenuSection').style.display = 'none';
    document.getElementById('setupSection').style.display = 'block';
}

function backToMenu() {
    // Επαναφορά στις αρχικές ρυθμίσεις
    resetQuizData();

    // Εμφάνιση του κύριου μενού
    showMainMenu();

    // Επαναφορά επιλογών στις default τιμές
    resetSetupOptions();
}

function resetSetupOptions() {
    // Επαναφορά επιλογής αριθμού ερωτήσεων
    document.querySelectorAll('.count-option').forEach(o => o.classList.remove('selected'));
    const defaultCountOption = document.querySelector('.count-option[data-count="30"]');
    if (defaultCountOption) {
        defaultCountOption.classList.add('selected');
        defaultCountOption.textContent = 'Πλήρης Αξιολόγηση (30)';
        quizSettings.questionCount = 30;
    }

    // Επαναφορά τρόπου λειτουργίας
    document.querySelectorAll('.feedback-btn').forEach(b => b.classList.remove('selected'));
    const defaultModeBtn = document.querySelector('.feedback-btn[data-mode="educational"]');
    if (defaultModeBtn) {
        defaultModeBtn.classList.add('selected');
        quizSettings.feedbackMode = 'educational';
    }
}

function startQuiz() {
    // Λήψη ερωτήσεων για την επιλεγμένη ενότητα
    const sectionQuestions = getSectionQuestions();

    if (sectionQuestions.length === 0) {
        alert('Δεν υπάρχουν διαθέσιμες ερωτήσεις για αυτή την ενότητα.');
        return;
    }

    // Ανάμιξη και επιλογή ερωτήσεων
    const shuffledQuestions = [...sectionQuestions].sort(() => Math.random() - 0.5);
    const questionCount = Math.min(quizSettings.questionCount, shuffledQuestions.length);
    selectedQuestions = shuffledQuestions.slice(0, questionCount);

    // Μηδενισμός μεταβλητών
    currentQuestionIndex = 0;
    userAnswers = new Array(selectedQuestions.length);

    // Εμφάνιση quiz section
    document.getElementById('setupSection').style.display = 'none';
    document.getElementById('quizSection').style.display = 'block';

    showQuestion();
}

function getSectionQuestions() {
    const sectionKey = `section${selectedSection}`;

    if (selectedSection === 8) {
        // Για την ενότητα 8 (μικτή αξιολόγηση), συλλογή ερωτήσεων από όλες τις ενότητες
        let allQuestions = [];
        for (let i = 1; i <= 7; i++) {
            const questions = questionBank[`section${i}`] || [];
            allQuestions = allQuestions.concat(questions);
        }
        return allQuestions;
    }

    return questionBank[sectionKey] || [];
}

function showQuestion() {
    const question = selectedQuestions[currentQuestionIndex];

    // Update progress
    const progress = ((currentQuestionIndex) / selectedQuestions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `Ερώτηση ${currentQuestionIndex + 1} από ${selectedQuestions.length}`;

    // Update question content
    document.getElementById('questionNumber').textContent = currentQuestionIndex + 1;
    document.getElementById('questionType').textContent = question.type === 'true_false' ? 'Σωστό/Λάθος' : 'Πολλαπλή Επιλογή';
    document.getElementById('questionText').textContent = question.question;

    // Create options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectOption(index);

        // Αν είμαστε σε εξεταστικό τρόπο και έχουμε ήδη απαντήσει, δείξε την επιλογή
        if (quizSettings.feedbackMode === 'exam' && userAnswers[currentQuestionIndex] !== undefined) {
            if (index === userAnswers[currentQuestionIndex]) {
                optionDiv.classList.add('selected');
            }
        }

        optionsContainer.appendChild(optionDiv);
    });

    // Reset feedback
    document.getElementById('feedbackMessage').style.display = 'none';

    // Update navigation buttons
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    updateNextButton();
}

function selectOption(optionIndex) {
    const question = selectedQuestions[currentQuestionIndex];

    // Remove previous selections
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected', 'correct', 'incorrect');
    });

    // Mark selected option
    const selectedOption = document.querySelectorAll('.option')[optionIndex];
    selectedOption.classList.add('selected');

    // Store answer (Answer Memory implementation)
    userAnswers[currentQuestionIndex] = optionIndex;

    // Show immediate feedback in educational mode
    if (quizSettings.feedbackMode === 'educational') {
        showFeedback(optionIndex, question);
    }

    updateNextButton();
}

function showFeedback(selectedIndex, question) {
    const options = document.querySelectorAll('.option');
    const feedbackDiv = document.getElementById('feedbackMessage');

    // Mark correct and incorrect options
    options.forEach((option, index) => {
        if (index === question.correct) {
            option.classList.add('correct');
        } else if (index === selectedIndex && index !== question.correct) {
            option.classList.add('incorrect');
        }
    });

    // Show feedback message
    const isCorrect = selectedIndex === question.correct;
    feedbackDiv.className = `feedback-message ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackDiv.innerHTML = `
        <strong>${isCorrect ? '✅ Σωστό!' : '❌ Λάθος!'}</strong><br>
        ${question.explanation}
    `;
    feedbackDiv.style.display = 'block';
}

function updateNextButton() {
    const nextBtn = document.getElementById('nextBtn');
    const hasAnswer = userAnswers[currentQuestionIndex] !== undefined;

    nextBtn.disabled = !hasAnswer;

    if (currentQuestionIndex === selectedQuestions.length - 1) {
        nextBtn.textContent = 'Ολοκλήρωση 🏁';
    } else {
        nextBtn.textContent = 'Επόμενη ➡️';
    }
}

function nextQuestion() {
    if (currentQuestionIndex === selectedQuestions.length - 1) {
        showResults();
    } else {
        currentQuestionIndex++;
        showQuestion();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

// Cancel Button functionality
function cancelQuiz() {
    const confirmCancel = confirm('Είστε βέβαιοι ότι θέλετε να ακυρώσετε το τεστ; Όλες οι απαντήσεις θα χαθούν.');

    if (confirmCancel) {
        // Επαναφορά δεδομένων
        resetQuizData();

        // Επιστροφή στην αρχική οθόνη
        backToMenu();
    }
}

function resetQuizData() {
    selectedQuestions = [];
    currentQuestionIndex = 0;
    userAnswers = [];
    selectedSection = 1;
}

function showResults() {
    // Calculate score
    let correctCount = 0;
    selectedQuestions.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            correctCount++;
        }
    });

    const percentage = Math.round((correctCount / selectedQuestions.length) * 100);
    const incorrectCount = selectedQuestions.length - correctCount;

    // Update results display
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('incorrectCount').textContent = incorrectCount;
    document.getElementById('finalPercentage').textContent = percentage + '%';
    document.getElementById('totalQuestions').textContent = selectedQuestions.length;
    document.getElementById('scoreText').textContent = percentage + '%';

    // Update score circle
    const scoreCircle = document.getElementById('scoreCircle');
    scoreCircle.style.setProperty('--percentage', percentage + '%');

    // Performance badge
    const badge = document.getElementById('performanceBadge');
    if (percentage >= 90) {
        badge.textContent = '🏆 Άριστα! Εξαιρετική Επίδοση!';
        badge.className = 'performance-badge excellent';
    } else if (percentage >= 75) {
        badge.textContent = '🎯 Πολύ Καλά! Καλή Επίδοση!';
        badge.className = 'performance-badge good';
    } else if (percentage >= 60) {
        badge.textContent = '📚 Μέτρια Επίδοση - Χρειάζεται Μελέτη';
        badge.className = 'performance-badge average';
    } else {
        badge.textContent = '📖 Χρειάζεται Περισσότερη Μελέτη';
        badge.className = 'performance-badge poor';
    }

    // Show detailed results for exam mode
    if (quizSettings.feedbackMode === 'exam') {
        showDetailedResults();
    }

    // Show results section
    document.getElementById('quizSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
}

function showDetailedResults() {
    const detailedResultsDiv = document.getElementById('detailedResults');
    const containerDiv = document.getElementById('detailedResultsContainer');

    containerDiv.innerHTML = '';

    selectedQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correct;

        const resultItem = document.createElement('div');
        resultItem.className = `detailed-result-item ${isCorrect ? 'correct' : 'incorrect'}`;

        resultItem.innerHTML = `
            <h5>Ερώτηση ${index + 1}: ${question.question}</h5>
            <div class="user-answer">Η απάντησή σας: ${question.options[userAnswer]}</div>
            ${!isCorrect ? `<div class="correct-answer">Σωστή απάντηση: ${question.options[question.correct]}</div>` : ''}
            <div class="explanation">${question.explanation}</div>
        `;

        containerDiv.appendChild(resultItem);
    });

    detailedResultsDiv.style.display = 'block';
}

function restartQuiz() {
    // Reset everything
    resetQuizData();

    // Show setup section για την ίδια ενότητα
    showSetupSection();
    resetSetupOptions();
}

// PDF Export functionality
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Ρυθμίσεις PDF
    doc.setFont('helvetica');
    let yPosition = 20;
    const pageHeight = 280;
    const lineHeight = 7;

    // Τίτλος
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Apotelesmata Test Autoaxiologisis', 20, yPosition);
    yPosition += 10;

    // Πληροφορίες ενότητας
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const sectionData = sectionInfo[selectedSection];
    doc.text(`Enotita: ${sectionData.title}`, 20, yPosition);
    yPosition += 10;

    // Αποτελέσματα
    const correctCount = selectedQuestions.filter((q, i) => userAnswers[i] === q.correct).length;
    const percentage = Math.round((correctCount / selectedQuestions.length) * 100);

    doc.text(`Synolikes Erotiseis: ${selectedQuestions.length}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Sostes Apantiseis: ${correctCount}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Pososto Epitychias: ${percentage}%`, 20, yPosition);
    yPosition += 15;

    // Αναλυτικά αποτελέσματα
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Analytika Apotelesmata:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    selectedQuestions.forEach((question, index) => {
        // Έλεγχος αν χρειάζεται νέα σελίδα
        if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
        }

        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correct;

        doc.setFont('helvetica', 'bold');
        const questionText = `${index + 1}. ${question.question}`;
        const splitQuestion = doc.splitTextToSize(questionText, 170);
        doc.text(splitQuestion, 20, yPosition);
        yPosition += splitQuestion.length * lineHeight;

        doc.setFont('helvetica', 'normal');
        doc.text(`I apantisi sas: ${question.options[userAnswer]}`, 25, yPosition);
        yPosition += lineHeight;

        if (!isCorrect) {
            doc.text(`Sosti apantisi: ${question.options[question.correct]}`, 25, yPosition);
            yPosition += lineHeight;
        }

        doc.setFontSize(9);
        const explanationText = `Exigisi: ${question.explanation}`;
        const splitExplanation = doc.splitTextToSize(explanationText, 170);
        doc.text(splitExplanation, 25, yPosition);
        yPosition += splitExplanation.length * 6 + 5;

        doc.setFontSize(10);
    });

    // Αποθήκευση αρχείου
    const fileName = `quiz_results_section_${selectedSection}_${new Date().toLocaleDateString('el-GR').replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
}

// Έλεγχος διαθεσιμότητας jsPDF
function checkPDFSupport() {
    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF library is not loaded');
        return false;
    }
    return true;
}