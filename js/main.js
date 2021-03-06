var modal = document.getElementById("modalBox");
var howItWorksBtn = document.getElementById("howItWorksBtn");
var close = document.getElementsByClassName("close")[0];
var keyInput = document.getElementById("keyInput");

// makes modal window appear on click
howItWorksBtn.onclick = function() {
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

// allows user to search for fact by pressing enter instead of clicking button
keyInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        document.getElementById("searchBtn").click();
    }
})

// helper to remove input box from search screen
function removeInputBox() {
    let inputBox = document.getElementById("inputBox");

    inputBox.style.display = "none";
}

// helper to change title display from search screen
function shrinkTitle() {
    let pretitle = document.getElementById("pretitle");
    let title = document.getElementById("title");

    pretitle.style.display = "none";
    title.style.fontSize = "40px";
}

// removes body elements of existingFact div
function removeExistingFactElements() {
    document.getElementById("existingFactHeader").remove();
    document.getElementById("factBody").remove();
    document.getElementById("views").remove();
    document.getElementById("likes").remove();
}

// removes body elements of newFact div
function removeNewFactElements() {
    document.getElementById("newFactHeader").remove();
    document.getElementById("newFactSubheader").remove();
    document.getElementById("factInput").remove();
}

// changes screen to show a new search screen for user to input number (NOT STARTING SCREEN)
function newSearchScreen(justUpdated) {
    if (justUpdated) {
        removeExistingFactElements();
        document.getElementById("existingFact").style.display = "none";
    } else {
        removeNewFactElements();
        document.getElementById("newFact").style.display = "none";
    }

    let inputBox = document.getElementById("inputBox");
    inputBox.style.display = "block";
    inputBox.style.marginTop = "175px";

    // clears input field
    document.getElementById("keyInput").value = "";
}

// fetches for requested fact from server based on user input
function search() {
    var searchVal = parseInt(document.getElementById("keyInput").value);

    // defaults blank field as 0
    if (searchVal == "") searchVal = 0;

    fetch('/api/v1/facts?key=' + searchVal)
    .then((response) => {
        if (response.status == 201) return response.json();
    })
    .then((fact) => {
        if (fact) {
            factSpace.showExistingFact(fact);
        } else {
            factSpace.showNewFact(searchVal);
        }
    })
    .catch((err) => {
        console.log(err);
    });
}

// module pattern used to keep track of current fact ID or new fact key to update db after user finishes with fact
var factSpace = function() {
    var currentId = null;
    var currentKey = null;

    // displays an existing fact and allows user to like the fact which would update the fact in the db
    // NOTE: views MUST be incremented every time an existing fact is shown
    function showExistingFact(fact) {
        currentId = fact._id;
        currentKey = fact.key;

        var existingFact = document.getElementById("existingFact");
        var factDetails = document.getElementById("factDetails");
        
        const header = document.createElement("h1");
        header.textContent = "Fact " + fact.key;
        header.id = "existingFactHeader";
        existingFact.insertBefore(header, factDetails);

        const body = document.createElement("p");
        body.textContent = fact.fact;
        body.id = "factBody"
        existingFact.insertBefore(body, factDetails);

        const views = document.createElement("h6");
        views.textContent = fact.views  + " user(s) have read this fact before you."
        views.id = "views";
        factDetails.appendChild(views);

        const likes = document.createElement("h6");
        likes.textContent = fact.likes + " enjoyed learning about it!"
        likes.id = "likes";
        factDetails.appendChild(likes);

        removeInputBox();
        shrinkTitle();

        existingFact.style.display = "block";
    }

    // displays an input box that allows user to input their own fact which would create the fact in the db
    function showNewFact(key) {
        currentKey = key;

        var newFact = document.getElementById("newFact");
        var factOptions = document.getElementsByClassName("factOptions")[1];

        const header = document.createElement("h1");
        header.textContent = "Fact " + key;
        header.id = "newFactHeader"
        newFact.insertBefore(header, factOptions);

        const subheader = document.createElement("h3");
        subheader.textContent = "No fact here, add one of your own!";
        subheader.id = "newFactSubheader"
        newFact.insertBefore(subheader, factOptions);

        const factInput = document.createElement("textarea");
        factInput.placeholder = "Something something interesting...";
        factInput.maxLength = "500";
        factInput.id = "factInput";
        newFact.insertBefore(factInput, factOptions);

        removeInputBox();
        shrinkTitle();

        newFact.style.display = "block";
    }

    // updates current fact in server based on id and userLiked
    function updateFact(userLiked) {
        if (currentId == null) {
            console.log("Error, no fact id present");
            return;
        }

        fetch('/update?liked=' + userLiked + '&id=' + currentId, { method: 'POST' })
        .then((res) => {
            if (res.status == 404) {
                console.log("Something went wrong with accessing DB");
                return;
            }

            if (userLiked) {
                alert("Factastic! I'm sure fact " + currentKey + " likes you too! :)");
            }
    
            currentId = null;
            currentKey = null;

            newSearchScreen(true);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    // creates and inserts a new fact into db based on key
    function addFact() {
        var factInput = document.getElementById("factInput").value;
        var factData = { fact: factInput }

        fetch('/create?key=' + currentKey, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(factData)
        })
        .then((res) => {
            if (res.status == 400) {
                console.log("Something went wrong with accessing DB");
            } else {
                alert("Successfully added fact " + currentKey + ", thank you for your contribution!");

                currentKey = null;
            }

            newSearchScreen(false);
        })
    }

    return {
        showExistingFact:showExistingFact,
        showNewFact:showNewFact,
        update:updateFact,
        addFact:addFact
    }
}();

