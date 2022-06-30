var modal = document.getElementById("modalBox");
var btn = document.getElementById("howItWorks");
var close = document.getElementsByClassName("close")[0];

// makes modal window appear on click
btn.onclick = function() {
    modal.style.display = "block";
}

// closes modal window upon pressing "Got it!"
close.onclick = function() {
    modal.style.display = "none";
}

// closes modal window upon clicking outside of box
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function showExistingFact() {
    var existingFact = document.getElementById("existingFact");

    existingFact.style.display = "block";
}

function showNewFact() {
    var newFact = document.getElementById("newFact");
    
    newFact.style.display = "block";
}
